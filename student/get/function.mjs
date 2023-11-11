/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    ExecuteStatementCommand,
    DynamoDBDocumentClient,
  } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (event, context) => {
    const stmt = `SELECT * FROM students`;
    const command = new ExecuteStatementCommand({
        Statement: stmt,
        ConsistentRead: true,
    });
    try {
        const { Items, $metadata } = await docClient.send(command);
        return {
            statusCode: $metadata.httpStatusCode,
            body: Items
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};
