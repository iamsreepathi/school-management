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

import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb'
const client = new DynamoDBClient({})

export const lambdaHandler = async (event, context) => {
    const id = event.pathParameters.id
    const command = new DeleteItemCommand({
        TableName: 'students',
        Key: {
            id: { S: id },
        },
    })
    try {
        await client.send(command)
        const res = {
            statusCode: 200,
            body: {
                message: `Student ${id} successfully deleted.`,
            },
        }
        context.succeed(JSON.stringify(res))
    } catch (error) {
        console.log(error)
        return error
    }
}
