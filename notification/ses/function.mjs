import { SES } from '@aws-sdk/client-ses'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

const region = 'us-east-2'
const ses = new SES({ region })
const s3Client = new S3Client({ region })
const bucket = process.env.BUCKET
const source = process.env.SOURCE
const to = 's.prasantreddy94@gmail.com'
export const lambdaHandler = async (event, context) => {
    const { Records } = event
    for (let i = 0; i < Records.length; i++) {
        const { data, template } = JSON.parse(Records[i].body)
        console.log('Template Data', data)
        console.log('Template Name', template)
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: template,
            })
            const res = await s3Client.send(command)
            const content = await res.Body.transformToString()
            const mailTemplate = content.replace(/{{\w+}}/g, function (prop) {
                return data[prop.substring(2, prop.length - 2)] || prop
            })
            await ses.sendEmail({
                Source: source,
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Subject: { Data: data.subject },
                    Body: {
                        Html: { Data: mailTemplate },
                    },
                },
            })
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Email sent.',
                }),
            }
        } catch (err) {
            console.error('Error sending email', err)
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error sending email.',
                }),
            }
        }
    }
}
