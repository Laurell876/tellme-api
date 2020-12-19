const Joi = require("@hapi/joi");


// Create question
const createQuestionValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required()
    })


    // Validate user received from request
    return schema.validate(data)

}

module.exports.createQuestionValidation = createQuestionValidation;