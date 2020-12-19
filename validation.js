const Joi = require("@hapi/joi");


const extendSessionValidation = (data) => {
    const schema = Joi.object({
        refreshToken: Joi.string().required()
    })
    return schema.validate(data)
}

// Create question
const createQuestionValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required()
    })
    return schema.validate(data)
}

// Registration
const registerValidation = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required()
    })
    return schema.validate(data)
}

// Registration
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    })
    return schema.validate(data)
}

module.exports.createQuestionValidation = createQuestionValidation;
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.extendSessionValidation = extendSessionValidation;