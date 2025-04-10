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
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

// Define repository name as a constant
const ECR_REPOSITORY_NAME = 'learningmap';
const ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT;
const REGION = process.env.CDK_DEFAULT_REGION;

export class LearningMapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create ECR Repository first
    const repository = new ecr.Repository(this, 'LearningMapRepo', {
      repositoryName: ECR_REPOSITORY_NAME,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      imageScanOnPush: true
    });

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

    // Create a build stage with a stack
    class BuildStage extends cdk.Stage {
      constructor(scope: Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);

        // Create a stack for the build stage
        const buildStack = new cdk.Stack(this, 'BuildStack');

        // Add any resources needed for the build stage here
        // This can be empty, we just need a stack to satisfy CDK's requirements
      }
    }

    const buildStage = pipeline.addStage(new BuildStage(this, 'BuildStage', {
      env: {
        account: ACCOUNT,
        region: REGION
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
              value: repository.repositoryUri
            },
            CONTAINER_NAME: {
              value: ECR_REPOSITORY_NAME
            },
            AWS_DEFAULT_REGION: {
              value: REGION || 'us-east-1'
            }
          }
        },
        commands: [
          'cd $CODEBUILD_SRC_DIR',
          'echo "Current directory: $(pwd)"',
          'ls -la',
          'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $REPOSITORY_URI',
          'docker build -t $CONTAINER_NAME .',
          'docker tag $CONTAINER_NAME:latest $REPOSITORY_URI:latest',
          'docker push $REPOSITORY_URI:latest'
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
            resources: [repository.repositoryArn]
          })
        ]
      })
    );

    // Add deployment stage
    const deployStage = new LearningMapStage(this, 'Deploy', {
      env: {
        account: ACCOUNT,
        region: REGION
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

    // Construct the repository URI using account and region
    const repositoryUri = `${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:latest`;

    // ECS Service
    const executionRole = new iam.Role(serviceStack, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    });

    const taskDefinition = new ecs.FargateTaskDefinition(serviceStack, 'LearningMapTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole: executionRole
    });

    const container = taskDefinition.addContainer('learningmap', {
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryAttributes(serviceStack, 'ExistingRepo', {
          repositoryArn: `arn:aws:ecr:${REGION}:${ACCOUNT}:repository/${ECR_REPOSITORY_NAME}`,
          repositoryName: ECR_REPOSITORY_NAME
        }),
        'latest'
      ),
      containerName: ECR_REPOSITORY_NAME,
      portMappings: [{ containerPort: 3000 }],
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0'
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ecs',
        logRetention: 7
      }),
      essential: true,
      memoryLimitMiB: 512,
      cpu: 256
    });

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(serviceStack, 'LearningMapService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(180),
      taskSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      listenerPort: 80,
      targetProtocol: elbv2.ApplicationProtocol.HTTP
    });

    // Configure target group health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/',
      port: '3000',
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
      timeout: cdk.Duration.seconds(30),
      interval: cdk.Duration.seconds(60),
      healthyHttpCodes: '200-399'
    });

    // Update security group rules to allow inbound traffic from ALB
    fargateService.service.connections.allowFrom(
      fargateService.loadBalancer,
      ec2.Port.tcp(3000),
      'Allow inbound from ALB'
    );
    
    // Allow inbound HTTP traffic to ALB
    fargateService.loadBalancer.connections.allowFromAnyIpv4(
      ec2.Port.tcp(80),
      'Allow inbound HTTP traffic to ALB'
    );
    
    // Allow the task to pull from ECR
    const ecrRepo = ecr.Repository.fromRepositoryAttributes(serviceStack, 'ExistingEcrRepo', {
      repositoryArn: `arn:aws:ecr:${REGION}:${ACCOUNT}:repository/${ECR_REPOSITORY_NAME}`,
      repositoryName: ECR_REPOSITORY_NAME
    });
    ecrRepo.grantPull(taskDefinition.executionRole!);
  }
}