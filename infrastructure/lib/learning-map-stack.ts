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

    // Use existing ECR Repository
    const repository = ecr.Repository.fromRepositoryName(serviceStack, 'LearningMapRepo', 'learningmap');

    // ECS Service
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(serviceStack, 'LearningMapService', {
      cluster,
      memoryLimitMiB: 512,
      cpu: 256,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository),
        containerName: 'learningmap',
        containerPort: 80,
        environment: {
          NODE_ENV: 'production'
        }
      },
      assignPublicIp: false,
      publicLoadBalancer: true
    });
  }
}