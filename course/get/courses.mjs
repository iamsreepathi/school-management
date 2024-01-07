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
import Ajv from 'ajv'

const client = new DynamoDBClient({
    endpoint: 'http://dynamo:8000',
})
const docClient = DynamoDBDocumentClient.from(client)

const ajv = new Ajv()
const schema = {
    type: 'object',
    properties: {
        limit: {
            type: 'integer',
        },
        key: {
            type: ['string', 'null'],
        },
    },
}

const validate = ajv.compile(schema)

const headers = {
    'Access-Control-Allow-Origin': '*',
}

export const lambdaHandler = async (event, context) => {
    let pageSize = 10 // Set your desired page size
    let token = null

    if (event.queryStringParameters) {
        const { limit, key } = event.queryStringParameters
        if (limit) pageSize = +limit
        if (key) token = key

        const valid = validate({ limit: pageSize, key: token })
        if (!valid) {
            const errors = validate.errors.map((e) => ({
                field: e.instancePath,
                message: e.message,
            }))
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid data format', errors }),
                headers,
            }
        }
    }

    const statement = 'SELECT * FROM courses'
    const command = new ExecuteStatementCommand({
        Statement: statement,
        NextToken: token,
        Limit: pageSize,
    })
    try {
        const { $metadata, NextToken, Items } = await docClient.send(command)
        token = NextToken ? NextToken : null
        return {
            statusCode: $metadata.httpStatusCode,
            body: JSON.stringify({
                items: Items,
                token,
            }),
            headers,
        }
    } catch (err) {
        console.error(err)
        let statusCode = 500
        let error = 'Internal Server Error'
        const metadata = err.$metadata
        if (metadata) {
            statusCode = metadata.httpStatusCode
            error = err.message
        }
        return {
            statusCode,
            body: JSON.stringify({
                error,
            }),
            headers,
        }
    }
}
