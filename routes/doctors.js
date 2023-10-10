var express = require('express');
const cors = require("cors");
var router = express.Router();
var user = require('../models/user')
var doctorControllers = require('../controllers/doctorControllers')
const { autherizeRole, signUser } = require('../middlewares/jwt')

router.post('/doctorsignup',doctorControllers.doctorSignup)
router.post('/docotpverification',doctorControllers.doctorOtpVerification)
router.post('/doctorlogin', doctorControllers.doctorLogin)

module.exports = router;

