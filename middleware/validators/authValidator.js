// Destructure `body` from express-validator to define validation rules for request body fields

const {body} = require('express-validator');

exports.registerValidation = [
    
    //-> Validation chaining

     // Validate username: must be present, alphanumeric, and at least 3 characters

    body("username")
    .notEmpty().withMessage("Username is required.")
    .isAlphanumeric().withMessage("Username must be alphanumeric")
    .isLength({min: 3}).withMessage("Username must be atleast 3 characters long"),

    // Validate password: must be present, at least 6 characters, contain number and special character
    body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({min: 6}).withMessage("Password must be at least 6 characters long")
    .matches(/\d/).withMessage("Password must contain a number")
    .matches(/[!@#$%^&*]/).withMessage("Password must contain a special character")
];

// Validation rules for login (just presence check)
exports.loginValidation = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required")
];