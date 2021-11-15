var express = require('express')
var router = express.Router()
const { check, validationResult } = require('express-validator');
const { signout, signup } = require('../controllers/auth') 

router.post('/signup',[
    check('name')
    .isLength({min: 3 })
    .withMessage('Name must have atleast 3 characters'),

    check('email')
    .isEmail()
    .withMessage('Email address is required'),

    check('password')
    .isLength({min: 3 })
    .withMessage('Password must have atleast 3 characters')

    ],
    signup);

router.get('/signout', signout)

module.exports = router