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
import { Construct } from 'constructs';

export class LearningMapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
        new cdk.Stack(this, 'BuildStack', {
          env: props?.env
        });
      }
    }

    const buildStage = pipeline.addStage(new BuildStage(this, 'BuildStage', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
      }
    }));

    // Add build step
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
              value: 'learningmap'
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
            resources: ['arn:aws:ecr:us-east-1:358719591151:repository/learningmap']
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

    // ECR Repository
    const repository = new ecr.Repository(serviceStack, 'LearningMapRepo', {
      repositoryName: 'learningmap',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      imageScanOnPush: true
    });

    // ECS Service
    const taskDefinition = new ecs.FargateTaskDefinition(serviceStack, 'LearningMapTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    const container = taskDefinition.addContainer('learningmap', {
      image: ecs.ContainerImage.fromEcrRepository(repository),
      containerName: 'learningmap',
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