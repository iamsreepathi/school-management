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
import { ExecuteStatementCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export const lambdaHandler = async (event, context) => {
    let pageSize = 10 // Set your desired page size
    let token = null

    if (event.queryStringParameters) {
        const { limit, key } = event.queryStringParameters
        if (limit) pageSize = limit
        if (key) token = key
    }

    const statement = 'SELECT * FROM students'
    const command = new ExecuteStatementCommand({
        Statement: statement,
        NextToken: token,
        Limit: pageSize,
    })
    try {
        const { $metadata, NextToken, Items } = await docClient.send(command)
        const token = NextToken ? NextToken : null
        return {
            statusCode: $metadata.httpStatusCode,
            body: JSON.stringify({
                items: Items,
                token,
            }),
        }
    } catch (err) {
        const metadata = err.$metadata
        if (metadata) {
            const statusCode = metadata.httpStatusCode
            if (statusCode === 400)
                return {
                    statusCode,
                    body: JSON.stringify({
                        error: err.message,
                    }),
                }
        }
        console.log(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error',
            }),
        }
    }
}
