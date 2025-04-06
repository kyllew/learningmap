import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

// Define repository name as a constant
const ECR_REPOSITORY_NAME = 'learningmap';

export class LearningMapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Lambda function to check if ECR repository exists
    const checkEcrFunction = new lambda.Function(this, 'CheckEcrFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const ecr = new AWS.ECR();
        
        exports.handler = async (event) => {
          const repositoryName = event.ResourceProperties.RepositoryName;
          
          try {
            await ecr.describeRepositories({ repositoryNames: [repositoryName] }).promise();
            return {
              Data: { Exists: true }
            };
          } catch (error) {
            if (error.code === 'RepositoryNotFoundException') {
              return {
                Data: { Exists: false }
              };
            }
            throw error;
          }
        };
      `),
      timeout: cdk.Duration.seconds(30)
    });

    // Grant the Lambda function permission to check ECR repositories
    checkEcrFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ecr:DescribeRepositories'],
      resources: ['*']
    }));

    // Create a custom resource to check if ECR repository exists
    const checkEcrRepo = new cr.AwsCustomResource(this, 'CheckEcrRepo', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: checkEcrFunction.functionName,
          Payload: JSON.stringify({
            ResourceProperties: {
              RepositoryName: ECR_REPOSITORY_NAME
            }
          })
        },
        physicalResourceId: cr.PhysicalResourceId.of('ecrcheck'),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: [checkEcrFunction.functionArn]
        })
      ])
    });

    // Get the result from the custom resource
    const ecrExists = checkEcrRepo.getResponseField('Payload.Data.Exists');

    // Only create the ECR repository if it doesn't exist
    let repository: ecr.IRepository;
    if (!ecrExists) {
      repository = new ecr.Repository(this, 'LearningMapRepo', {
        repositoryName: ECR_REPOSITORY_NAME,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        imageScanOnPush: true
      });
    } else {
      repository = ecr.Repository.fromRepositoryAttributes(this, 'ExistingLearningMapRepo', {
        repositoryName: ECR_REPOSITORY_NAME,
        repositoryArn: `arn:aws:ecr:us-east-1:358719591151:repository/${ECR_REPOSITORY_NAME}`
      });
    }

    // Pipeline
    const pipeline = new pipelines.CodePipeline(this, 'LearningMapPipeline', {
      pipelineName: 'LearningMapPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('kyllew/learningmap', 'main', {
          connectionArn: 'arn:aws:codestar-connections:us-east-1:358719591151:connection/7e303cfc-9e9d-44ea-92ca-f094158e5f06',
          triggerOnPush: true
        }),
        primaryOutputDirectory: 'infrastructure/cdk.out',
        commands: [
          'cd infrastructure',
          'npm install -g aws-cdk',
          'npm install',
          'npm run build',
          'npx cdk synth'
        ],
        env: {
          NODE_VERSION: '18'
        }
      }),
      dockerEnabledForSynth: true
    });

    // Add build stage
    class BuildStage extends cdk.Stage {
      constructor(scope: Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);

        // Create a stack for the build stage
        const buildStack = new cdk.Stack(this, 'BuildStack', {
          env: props?.env
        });

        // Reference the existing ECR repository
        const repository = ecr.Repository.fromRepositoryName(
          buildStack,
          'ExistingLearningMapRepo',
          ECR_REPOSITORY_NAME
        );

        // Grant CodeBuild permissions to push to the repository
        repository.grantPullPush(new iam.ServicePrincipal('codebuild.amazonaws.com'));
      }
    }

    const buildStage = pipeline.addStage(new BuildStage(this, 'BuildStage', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
      }
    }));

    // Add build step with updated permissions
    buildStage.addPost(
      new pipelines.CodeBuildStep('BuildAndPushImage', {
        projectName: 'LearningMapBuild',
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
          privileged: true,
          environmentVariables: {
            REPOSITORY_URI: {
              value: '358719591151.dkr.ecr.us-east-1.amazonaws.com/learningmap'
            },
            CONTAINER_NAME: {
              value: ECR_REPOSITORY_NAME
            },
            AWS_DEFAULT_REGION: {
              value: 'us-east-1'
            }
          }
        },
        commands: [
          'cd $CODEBUILD_SRC_DIR',
          'echo "Current directory: $(pwd)"',
          'ls -la',
          'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 358719591151.dkr.ecr.us-east-1.amazonaws.com',
          'docker build -t learningmap .',
          'docker tag learningmap:latest 358719591151.dkr.ecr.us-east-1.amazonaws.com/learningmap:latest',
          'docker push 358719591151.dkr.ecr.us-east-1.amazonaws.com/learningmap:latest'
        ],
        rolePolicyStatements: [
          new iam.PolicyStatement({
            actions: ['ecr:GetAuthorizationToken'],
            resources: ['*']
          }),
          new iam.PolicyStatement({
            actions: [
              'ecr:BatchCheckLayerAvailability',
              'ecr:GetDownloadUrlForLayer',
              'ecr:BatchGetImage',
              'ecr:InitiateLayerUpload',
              'ecr:UploadLayerPart',
              'ecr:CompleteLayerUpload',
              'ecr:PutImage'
            ],
            resources: [`arn:aws:ecr:us-east-1:358719591151:repository/${ECR_REPOSITORY_NAME}`]
          })
        ]
      })
    );

    // Add deployment stage
    const deployStage = new LearningMapStage(this, 'Deploy', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
      }
    });
    pipeline.addStage(deployStage);
  }
}

class LearningMapStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    // Create a new stack for the stage
    const serviceStack = new cdk.Stack(this, 'ServiceStack', {
      env: props?.env
    });

    // VPC
    const vpc = new ec2.Vpc(serviceStack, 'LearningMapVpc', {
      maxAzs: 2,
      natGateways: 1
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(serviceStack, 'LearningMapCluster', {
      vpc,
      containerInsights: true
    });

    // Reference the existing repository
    const repository = ecr.Repository.fromRepositoryAttributes(
      serviceStack,
      'ECRRepo',
      {
        repositoryName: ECR_REPOSITORY_NAME,
        repositoryArn: `arn:aws:ecr:us-east-1:358719591151:repository/${ECR_REPOSITORY_NAME}`
      }
    );

    // ECS Service
    const taskDefinition = new ecs.FargateTaskDefinition(serviceStack, 'LearningMapTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    const container = taskDefinition.addContainer('learningmap', {
      image: ecs.ContainerImage.fromEcrRepository(repository),
      containerName: ECR_REPOSITORY_NAME,
      portMappings: [{ containerPort: 3000 }],
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0'
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/ || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60)
      }
    });

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(serviceStack, 'LearningMapService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(60)
    });

    // Configure target group health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/',
      healthyHttpCodes: '200-399',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3
    });
  }
}