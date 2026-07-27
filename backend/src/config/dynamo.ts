import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'us-east-1';
const endpoint = process.env.DYNAMODB_ENDPOINT;

const clientConfig: Record<string, unknown> = { region };

// Optional: support for local DynamoDB (e.g. http://localhost:8000)
if (endpoint) {
  clientConfig.endpoint = endpoint;
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fakeAccessKey',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fakeSecretKey',
  };
}

export const dynamoClient = new DynamoDBClient(clientConfig);

export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

export const USERS_TABLE = process.env.USERS_TABLE || 'LMS_Users';
export const LOANS_TABLE = process.env.LOANS_TABLE || 'LMS_Loans';
export const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || 'LMS_Payments';
