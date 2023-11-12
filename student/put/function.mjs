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
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const client = new DynamoDBClient({})

// create student schema
const schema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
        fullName: { type: 'string', maxLength: 50 },
        dateOfBirth: { type: 'string', format: 'date' },
        contact: { type: 'string', format: 'email' },
        address: { type: 'string', maxLength: 255 },
        gaurdian: { type: 'string', maxLength: 50 },
    },
    required: ['id', 'fullName', 'dateOfBirth', 'contact', 'address', 'gaurdian'],
    additionalProperties: false,
}

const ajv = new Ajv()

addFormats(ajv, { mode: 'fast', formats: ['date', 'email', 'uuid'] })

const validate = ajv.compile(schema)

export const lambdaHandler = async (event, context) => {
    const { body } = event
    const item = JSON.parse(body)

    // Validate the data against the schema
    const valid = validate(item)

    // return invalid request response
    if (!valid) {
        const errors = validate.errors.map((e) => ({ field: e.instancePath, message: e.message }))
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid data format', errors }),
        }
    }

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
        console.log($metadata)
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
