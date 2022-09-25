import Joi from "joi"

const schema = Joi.object({
    id: Joi.number(),
    name: Joi.string()
        .max(255)
        .when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
    description: Joi.string()
        .max(2000),
    done: Joi.boolean(),
    creationDate: Joi.date(),
    lastUpdateDate: Joi.date()
})

export default class Task {
    // Properties
    id?: number
    name: string
    description?: string
    done: boolean = false

    // Technical properties
    creationDate: Date = new Date()
    lastUpdateDate: Date = new Date()

    validate(): Joi.ValidationResult {
        return schema.validate(this)
    }
}