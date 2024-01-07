import { SQS } from '@aws-sdk/client-sqs'

const queueUrl = 'https://sqs.us-east-2.amazonaws.com/424848754882/SmsNotificationQueue'

const sqs = new SQS()
export const lambdaHandler = async (event, context) => {
    const body = event.body
    try {
        await sqs.sendMessage({
            QueueUrl: queueUrl,
            MessageBody: body,
        })
        return {
            statusCode: 202,
            body: JSON.stringify({
                message: 'Request accepted. Notification will be sent shortly.',
            }),
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Request Failed due to unknown reason.',
            }),
        }
    }
}
