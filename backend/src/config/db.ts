import { dynamoClient } from './dynamo';

const connectDB = async (): Promise<void> => {
  console.log('✅ DynamoDB Client initialized');
};

export default connectDB;
