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

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
const client = new DynamoDBClient({})

export const lambdaHandler = async (event, context) => {
    const { body } = event
    const item = JSON.parse(body)
    const command = new PutItemCommand({
        TableName: 'students',
        Item: {
            id: { S: item.id },
            fullName: { S: item.fullName },
            dateOfBirth: { S: item.dateOfBirth },
            contact: { S: item.contact },
            address: { S: item.address },
            gaurdian: { S: item.gaurdian },
        },
    })
    try {
        const { $metadata } = await client.send(command)
        const response = {
            statusCode: 200,
            body: item,
        }
        context.succeed(JSON.stringify(response))
    } catch (err) {
        console.log(err)
        return err
    }
}
