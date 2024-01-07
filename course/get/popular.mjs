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

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const client = new DynamoDBClient({
    endpoint: 'http://dynamo:8000',
})

const headers = {
    'Access-Control-Allow-Origin': '*',
}

export const lambdaHandler = async (event, context) => {
    const input = {
        TableName: 'courses',
        ScanFilter: {
            rating: {
                ComparisonOperator: 'GE',
                AttributeValueList: [
                    {
                        N: '5',
                    },
                ],
            },
        },
    }

    let stop = false
    let maxRating = 5
    let courses = []
    const step = 0.5
    try {
        while (!stop) {
            maxRating = maxRating - step
            input.ScanFilter.rating.AttributeValueList[0].N = maxRating.toString()
            const command = new ScanCommand(input)
            const { Items } = await client.send(command)
            const items = Items.map((i) => unmarshall(i))
            courses = [...courses, ...items]
            if (courses.length >= 10 || maxRating < 1) stop = true
        }
        courses = courses.sort((a, b) => b.rating - a.rating).slice(0, 10)
        return {
            statusCode: 200,
            body: JSON.stringify({
                items: courses,
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
