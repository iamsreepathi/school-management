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
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const client = new DynamoDBClient({
    endpoint: 'http://dynamo:8000',
})

const ajv = new Ajv()

const schema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
    },
}

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

    const command = new DeleteItemCommand({
        TableName: 'students',
        Key: {
            id: { S: id },
        },
    })
    try {
        await client.send(command)
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Student ${id} successfully deleted.`,
            }),
        }
    } catch (error) {
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
