import {
  CreateTableCommand,
  DescribeTableCommand,
  ScalarAttributeType,
  KeyType,
  ProjectionType,
  BillingMode,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, USERS_TABLE, LOANS_TABLE, PAYMENTS_TABLE } from '../config/dynamo';

const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
};

const createUsersTable = async () => {
  if (await tableExists(USERS_TABLE)) {
    console.log(`ℹ️  Table ${USERS_TABLE} already exists.`);
    return;
  }

  console.log(`🛠  Creating table ${USERS_TABLE}...`);
  await dynamoClient.send(
    new CreateTableCommand({
      TableName: USERS_TABLE,
      BillingMode: BillingMode.PAY_PER_REQUEST,
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'email', AttributeType: ScalarAttributeType.S },
      ],
      KeySchema: [{ AttributeName: 'id', KeyType: KeyType.HASH }],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [{ AttributeName: 'email', KeyType: KeyType.HASH }],
          Projection: { ProjectionType: ProjectionType.ALL },
        },
      ],
    })
  );
  console.log(`✅ Table ${USERS_TABLE} created successfully.`);
};

const createLoansTable = async () => {
  if (await tableExists(LOANS_TABLE)) {
    console.log(`ℹ️  Table ${LOANS_TABLE} already exists.`);
    return;
  }

  console.log(`🛠  Creating table ${LOANS_TABLE}...`);
  await dynamoClient.send(
    new CreateTableCommand({
      TableName: LOANS_TABLE,
      BillingMode: BillingMode.PAY_PER_REQUEST,
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'borrowerId', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'status', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'createdAt', AttributeType: ScalarAttributeType.S },
      ],
      KeySchema: [{ AttributeName: 'id', KeyType: KeyType.HASH }],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'BorrowerIndex',
          KeySchema: [{ AttributeName: 'borrowerId', KeyType: KeyType.HASH }],
          Projection: { ProjectionType: ProjectionType.ALL },
        },
        {
          IndexName: 'StatusIndex',
          KeySchema: [
            { AttributeName: 'status', KeyType: KeyType.HASH },
            { AttributeName: 'createdAt', KeyType: KeyType.RANGE },
          ],
          Projection: { ProjectionType: ProjectionType.ALL },
        },
      ],
    })
  );
  console.log(`✅ Table ${LOANS_TABLE} created successfully.`);
};

const createPaymentsTable = async () => {
  if (await tableExists(PAYMENTS_TABLE)) {
    console.log(`ℹ️  Table ${PAYMENTS_TABLE} already exists.`);
    return;
  }

  console.log(`🛠  Creating table ${PAYMENTS_TABLE}...`);
  await dynamoClient.send(
    new CreateTableCommand({
      TableName: PAYMENTS_TABLE,
      BillingMode: BillingMode.PAY_PER_REQUEST,
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'loanId', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'paymentDate', AttributeType: ScalarAttributeType.S },
        { AttributeName: 'utrNumber', AttributeType: ScalarAttributeType.S },
      ],
      KeySchema: [{ AttributeName: 'id', KeyType: KeyType.HASH }],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'LoanIndex',
          KeySchema: [
            { AttributeName: 'loanId', KeyType: KeyType.HASH },
            { AttributeName: 'paymentDate', KeyType: KeyType.RANGE },
          ],
          Projection: { ProjectionType: ProjectionType.ALL },
        },
        {
          IndexName: 'UtrIndex',
          KeySchema: [{ AttributeName: 'utrNumber', KeyType: KeyType.HASH }],
          Projection: { ProjectionType: ProjectionType.ALL },
        },
      ],
    })
  );
  console.log(`✅ Table ${PAYMENTS_TABLE} created successfully.`);
};

const setupTables = async () => {
  console.log('🚀 Setting up DynamoDB Tables...');
  await createUsersTable();
  await createLoansTable();
  await createPaymentsTable();
  console.log('✨ All DynamoDB tables ready!');
};

setupTables().catch((err) => {
  console.error('❌ Error setting up tables:', err);
  process.exit(1);
});
