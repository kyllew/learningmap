#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LearningMapStack } from '../lib/learning-map-stack';  // Fixed import path

const app = new cdk.App();
new LearningMapStack(app, 'LearningMapStack', {  // Updated stack name
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});