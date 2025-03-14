import Joi from "joi";

const registerSchema = Joi.object({
  userName: Joi.string()
    .trim()
    .min(3)
    .max(32)
    .pattern(/^(?!.*(.)\1{2,})[A-Za-z0-9_]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Name must only contain letters and numbers, and no character should repeat more than twice consecutively! min 3 and max 32 characters",
      // "string.empty": `"Name" cannot be an empty field`,
      "string.min": `"User Name" should have a minimum length of 3`,
      "string.max": `"Name" should have a maximum length of 30`,
      "any.required": "Name is required!",
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "co", "in"] },
    })
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
    .required()
    .messages({
      "string.email": "Invalid email format!",
      "string.pattern.base": "Email contains invalid characters!",
      "any.required": "Email is required!",
    }),
  password: Joi.string()
    .trim()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    )
    .required()
    .messages({
      "string.pattern.base": `"Password" must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character`,
      // "string.empty": `"Password" cannot be an empty field`,
      "any.required": `"Password" is a required field`,
    }),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": `"Confirm Password" must match "Password"`,
    "any.required": `"Confirm Password" is a required field`,
  }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "co", "in"] },
    })
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
    .required()
    .messages({
      "string.email": "Invalid email format!",
      "string.pattern.base": "Email contains invalid characters!",
      "any.required": "Email is required!",
    }),
  password: Joi.string()
    .trim()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    )
    .required()
    .messages({
      "string.pattern.base": `"Password" must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character`,
      "string.empty": `"Password" cannot be an empty field`,
      "any.required": `"Password" is a required field`,
    }),
});

const validator = (schema) => (payload) => {
  const { value, error } = schema.validate(payload, { abortEarly: false });
  if (error) {
    const message = error?.details?.map((err) => {
      return err?.message;
    });

    throw new Error(message?.join(","));
  }
  // console.log(value);

  return value;
};

export const registerValidation = validator(registerSchema);
export const loginValidation = validator(loginSchema);
