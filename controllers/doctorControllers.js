var express = require("express");
const cors = require("cors");
var router = express.Router();
var user = require('../models/user')
var doctorHelpers = require('../helpers/doctorHelpers')
const {signUser, signDoctor, autherizeRole} = require('../middlewares/jwt')


let doctorSignup = async (req, res) => {
    console.log(req.body,'rrrrrrreeeee');
    let doctor = await doctorHelpers.doctorSignup(req.body)
    console.log(doctor,'wwwwwwwwqqqqq');
    if(doctor) {
        res.status(200).json({doctor}); // Send a response with the updated user data
    } else {
        res.status(500).json({ error: "Something went wrong" }); // Handle the error gracefully
    }
}

let doctorOtpVerification = async (req, res) => {
    console.log(req.body,'i got doctor otpppppp');
    const {otp, number} = req.body
    let docOtpVerify = await doctorHelpers.docOtpVerify(req.body)
    console.log(docOtpVerify,'qwerqwertyuuuuuuu');
    if(docOtpVerify.otpVerifiedStatus === 'approved') {
        let {otpVerifiedStatus, doc} = docOtpVerify
        const token = await signDoctor(doc)
        console.log(token,'i got doctor tokennnn');
        res.status(200).json({message : 'otp verified successfully',otpVerifiedStatus, doc, auth : token})

    } else {
        res.status(200).json({ error : "Otp is incorrect"})

    }
}

let doctorLogin = async (req, res) => {
    console.log(req.body,'i got login bodyyyyy');
    try{
        let response = await doctorHelpers.docLogin(req.body)
        console.log(response,'htrrrrrrrrrrrrrrr');
        if (!response) {
            res.status(500).json({ status: false, message: 'Login failed. Invalid response.' });
            return;
        }
        if(response.status) {
            if(response.doctor.signupStatus === true) {
                res.status(200).json({ status : true, message : "Login Successful", user : response.doctor })
            } else {
                res.status(200).json({ status : true, message : 'Approval pending',user : response.doctor })
            }
        } else {
            res.status(200).json({status: false, error: 'Login failed. Invalid credentials.'});
        }
    } catch(err) {
        console.log(err,'xdxdxdxd');
        res.status(500).json({ status: false, message: 'Internal server error.' });
    }
   
}



module.exports = {
    doctorSignup,
    doctorOtpVerification,
    doctorLogin 
}