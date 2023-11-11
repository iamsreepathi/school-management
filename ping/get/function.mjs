export const lambdaHandler =  async (event, context) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hi There! Welcome to School Management System."
        })
    };
    return response;
}