var express = require("express");
const cors = require("cors");
var router = express.Router();
var user = require('../models/user')
var userHelpers = require('../helpers/userHelpers')
const {signUser} = require('../middlewares/jwt')



let userSignup = async (req, res, next) => {
    try {
        console.log(req.body,'njnjnjnnjnjnnjj');
        const updatedUserData = await userHelpers.userSignup(req.body);
        const userSecure = {
            _id : updatedUserData.user._id,
            name : updatedUserData.user.patientfirstname,
            email : updatedUserData.user.email
        }
        res.status(200).json({userSecure}); // Send a response with the updated user data
      } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: "Something went wrong" }); // Handle the error gracefully
      }

}

let otpVerification = async(req, res) => {
    try {
        const {otp, number} = req.body
        let otpVerify = await userHelpers.otpVerification(req.body) 
        if(otpVerify.otpVerifiedStatus === "approved"){
            let {otpVerifiedStatus, patient} = otpVerify
            const token = await signUser(patient)
            res.status(200).json({message : 'otp verified successfully',otpVerifiedStatus, patient, auth : token})
        }else {
            res.status(200).json({ error : "Otp is incorrect"})
        }
       
    }catch(error) {
        console.error(error,'Otp is not verified');
        if (error) {
            res.status(500).json({ error: "Twilio resource not found" });
        } else {
            res.status(500).json({ message: 'OTP is not matched' });
        }
    }
    
}

let userLogin = async(req, res) => {
    console.log(req.body,'qwerqwerqwerqwer');
        try {
            let response = await userHelpers.userLogin(req.body)
            console.log(response,'userlogin response');
            if(response.status && response.signupStatus === true) {
                const token = await signUser(response.user)
                res.status(200).json({status: true, message: 'Login successful', user: response.user, auth : token});
            } else {
                res.status(200).json({status: false, error: 'Login failed. Invalid credentials. or You are blocked by admin'});
            }

        } catch(err) {
            console.error(err,'aaaaaaaa');
            res.status(500).json({ status: false, message: 'Internal server error.' });
        }
}

let forgotPassword = async(req, res) => {
    console.log(req.body,'forgot password number');
    userHelpers.forgotPassword(req.body).then((response) => {
        console.log(response,'vgvgvgvgvgvgvgvvg');
        if(response.status) {
            res.status(200).json({ message : "Otp send successfully", response })
        } else {
            res.status(200).json({ error : "Otp error", response })
        }

    })
}

let forgotPasswordConfirm = async (req, res) => {
    console.log(req.body,'this is my bosy');
    const {otp, password, number} = req.body
    console.log(otp,password,number,'hjhjhjhjh');
    userHelpers.forgotPasswordConfirm(req.body).then((response) => {
        console.log(response,'qwertyuioppppppppppppppppppppppp');
        if(response.status) {
            res.status(200).json({ message : "Password updated successfully", response })
        } else [
            res.status(200).json({ error : "Password not changed", response })
        ]
    })
}


module.exports = {
    userSignup,
    otpVerification,
    userLogin,
    forgotPassword,
    forgotPasswordConfirm,
}