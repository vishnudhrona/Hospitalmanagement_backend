var db = require('../config/connection')
const bcrypt = require('bcrypt');
const env = require('dotenv').config({path: __dirname + '/../.env'})
var User = require('../models/user')
var temporaryUser = require('../models/temporaryUser')
const { Vonage } = require('@vonage/server-sdk');
const { signUser } = require('../middlewares/jwt');


// const VONAGE_API_KEY = process.env.VONAGE_API_KEY
// const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET

// const vonage = new Vonage({
//     apiKey : VONAGE_API_KEY,
//     apiSecret : VONAGE_API_SECRET
// })
const accountSid = process.env.accountSID
const authToken = process.env.authToken
const serviceSID = "VAc107a57727774a9b62b056df37bd1103"
const client = require("twilio")(accountSid, authToken);


const userSignup = async (userData) => {
    let user = null
    try {
        if(!userData.formData.password) {
            return res.status(400).json({ error : "Password is required"});
        }
        userData.formData.password = await bcrypt.hash(userData.formData.password, 10)
        user = await temporaryUser.create(userData.formData)
        console.log(user,'user added in database');
        if (user) {
            console.log('otp verification start');
          client.verify.v2
            .services(serviceSID)
            .verifications.create({
              to: `+91${userData.formData.number}`,
              channel: "sms",
            })
            .then((verifications) => {
              console.log(verifications, "hey this is the verification");
            })
            .catch((err) => {
              console.log(err, "bnbnbnbnbnbnbnbn");
            });
        }
        
    } catch(err) {
        console.error(err,'yyyyyyyyyyyyy');
    }
    
    return { user }
}

const otpVerification = async(otpDetails, res) => {

   try {
    const {otp, number} = otpDetails
    if(otp) {
        let otpVerifiedStatus = "";
        console.log(otp,number,'iiiiiiiiiiooooooooooooooooo');
    
        const verification_check = await client.verify.v2
        .services(serviceSID)
        .verificationChecks.create({ to: `+91${number}`, code: otp })
            otpVerifiedStatus = verification_check.status
            console.log(otpVerifiedStatus,'bbbbbbrrrrrrr')
       
        if(otpVerifiedStatus === "approved") {
            let user = await temporaryUser.findOne({number : number})
            if(!user) {
                return res.status(404).json({ error : "Verification Timeout" })
            }
            let newPatient = new User(user.toObject())
            newPatient.signupStatus = true;
            let patient = await newPatient.save()
            patient = patient.toObject()
            delete patient.password
            let tempUser = await temporaryUser.deleteOne({ number : number })
            console.log(tempUser,'temporary user deleted');
    
            return {otpVerifiedStatus, patient}
        }else {
            console.log(otpVerifiedStatus,'eeeeeeeeeerrrrrrr');
            return otpVerifiedStatus
        }
    } else {
        res.status(400).json({ error : "No Otp entered" })
    }
   
   } catch (err) {
     console.error(err);
   }
}

const userLogin = (loginCredentials) => {
    return new Promise(async(resolve, reject) => {
        let response = {};
        console.log(loginCredentials.formData.number,'qgqgqgqgqgqgqgqgqgqgqgqgqg');
        let user = await User.findOne({ number : loginCredentials.formData.number })
        user = await user.toObject()
        console.log(user,'tytyytytytytytytytyt');
        if(user) {
            bcrypt.compare(loginCredentials.formData.password, user.password).then((status) => {
                console.log(status,'qwvcfghhhhhhhhhhhhhh');
                delete user.password
                if(status) {
                    response.user = user
                    response.status = true
                    resolve(response);
                } else {
                    resolve({ status : false })
                }
            })
        } else {
            resolve({ status : false })
        }
    })
}

const forgotPassword = (number) => {
        console.log(number,'i got password otp send number');
        return new Promise(async(resolve, reject) => {
            let response = {}
            try{
                let user = await User.findOne({ number : number.formData.number })
            user = await user.toObject() 
            console.log(user,'hythtyhtyhyttttt');

            if(user) {
                let userNumber = user.number
                response.status = true
                response.number = userNumber
                console.log('otp verification start');
              client.verify.v2
                .services(serviceSID)
                .verifications.create({
                  to: `+91${user.number}`,
                  channel: "sms",
                })
                .then((verifications) => {
                  console.log(verifications, "hey this is the verification");
                })
            console.log(response,'i got response');
                resolve(response)
                .catch((err) => {
                  console.log(err, "bnbnbnbnbnbnbnbn");
                });
        } else {
            response.status = false;
            resolve(response)
        }
            } catch(err) {
                console.log(err,'tyutyutyu');
            }
            
        })
}

const forgotPasswordConfirm = (newPassword) => {
    console.log(newPassword,'bubububububububububu');
    return new Promise(async(resolve, reject) => {
        try {
            let updatedPassword;
            let { otp, password, number } = newPassword
            console.log(number,'cxcxcxcxcxcxcxcx');
            let hashPassword = await bcrypt.hash(password, 10)
            console.log(hashPassword,'hjhjhjhjhj');
            updatedPassword = await User.updateOne(
                {number : number},
                {$set: { password : hashPassword } }
                );

                console.log(updatedPassword,'dfgdfgggggggggggg');

                const verification_check = await client.verify.v2
        .services(serviceSID)
        .verificationChecks.create({ to: `+91${number}`, code: otp })
            otpVerifiedStatus = verification_check.status
            console.log(otpVerifiedStatus,'bbbbbbrrrrrrr')
            if(otpVerifiedStatus === 'approved') {
                resolve({ status : true })
            } else {
                resolve({ status : false })
            }
        } catch(err) {
            console.error(err);
        }

    })
}


module.exports = {
    userSignup,
    otpVerification,
    userLogin,
    forgotPassword,
    forgotPasswordConfirm,
}