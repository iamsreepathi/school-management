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

import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const client = new DynamoDBClient({
    endpoint: 'http://dynamo:8000',
})

const headers = {
    'Access-Control-Allow-Origin': '*',
}

const schema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
    },
}
const ajv = new Ajv()

addFormats(ajv, { mode: 'fast', formats: ['uuid'] })

const validate = ajv.compile(schema)

export const lambdaHandler = async (event, context) => {
    const id = event.pathParameters.id
    // Validate the data against the schema
    const valid = validate({ id })

    if (!valid) {
        const errors = validate.errors.map((e) => ({ field: e.instancePath, message: e.message }))
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid data format', errors }),
        }
    }

    const command = new GetItemCommand({
        TableName: 'courses',
        Key: {
            id: { S: id },
        },
    })

    try {
        let statusCode = 404
        let body = JSON.stringify({
            message: 'Course not found',
        })
        const { Item } = await client.send(command)

        if (Item) {
            statusCode = 200
            body = JSON.stringify(unmarshall(Item))
        }
        return {
            statusCode,
            body,
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
