//Destructure validationResult from express-validator
//This functiin collects all the validation errors from authValidator middleware


const {validationResult} = require('express-validator');

exports.validateRequest = (req, res, next) =>{ 

    //extract error from the request object after validation

    const errors = validationResult(req); 
    // console.log("type of the error: ", typeof(errors));
    

    //If error exist, return 400 with details

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // No validation errors -> continue to the controller logic

    next();
}