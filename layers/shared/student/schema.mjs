const student = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
        fullName: { type: 'string', maxLength: 50 },
        dateOfBirth: { type: 'string', format: 'date' },
        contact: { type: 'string', format: 'email' },
        address: { type: 'string', maxLength: 255 },
        gaurdian: { type: 'string', maxLength: 50 },
    },
    required: ['fullName', 'dateOfBirth', 'contact', 'address', 'gaurdian'],
    additionalProperties: false,
}

export { student }
