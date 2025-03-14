import dotenv from "dotenv";
import CryptoJS from "crypto-js";
import {
  loginValidation,
  registerValidation,
} from "../validation/userValidation.js";
dotenv.config();

export const decryptValue = (value) => {
  const decryptedValue = CryptoJS.AES.decrypt(
    value,
    process.env.DECRYPT_KEY
  ).toString(CryptoJS.enc.Utf8);
  return decryptedValue;
};

export const inputDataValidation = ({
  userName,
  email,
  password,
  confirmPassword,
}) => {
  const decryptEmail = decryptValue(email);
  const decryptPassword = decryptValue(password);
  const decryptConfirmPassword = confirmPassword
    ? decryptValue(confirmPassword)
    : null;

  const validation =
    userName && confirmPassword
      ? {
          userName: userName,
          email: decryptEmail,
          password: decryptPassword,
          confirmPassword: decryptConfirmPassword,
        }
      : {
          email: decryptEmail,
          password: decryptPassword,
        };

  const validatedData =
    userName && confirmPassword
      ? registerValidation(validation)
      : loginValidation(validation);
  return validatedData;
};
