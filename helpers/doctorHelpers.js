var db = require('../config/connection')
const bcrypt = require('bcrypt');
const env = require('dotenv').config({path: __dirname + '/../.env'})
var temporaryDoctor = require('../models/temporaryDoctor')
var Doctor = require('../models/doctor')
const { Vonage } = require('@vonage/server-sdk');
const { signUser } = require('../middlewares/jwt');
var temporaryDoctor = require('../models/temporaryDoctor');

const accountSid = process.env.accountSID
const authToken = process.env.authToken
const serviceSID = "VAe42f5796539e7ae82e0a2a4e4f53596f"
const client = require("twilio")(accountSid, authToken);


const doctorSignup = async(doctorDetails) => {
    console.log(doctorDetails.formData.password,'qwqwqwqwwqwqwqwqwqwddff');
    let doctor = null;
    try {
        if(!doctorDetails.formData || !doctorDetails.formData.password){
            return res.status(400).json({ error : "Password is required"});
        }
        doctorDetails.formData.password = await bcrypt.hash(doctorDetails.formData.password, 10)
        doctor = await temporaryDoctor.create(doctorDetails.formData)
        doctor = await doctor.toObject()
        console.log(doctor,'doctor added in database');
        if(doctor) {
            console.log('otp verification start');
            client.verify.v2
              .services(serviceSID)
              .verifications.create({
                to: `+91${doctorDetails.formData.number}`,
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
        console.error(err);
    }

    return { doctor }
}

const docOtpVerify = async (docOtpDetails, res) => {
    try {
        const {otp, number} = docOtpDetails
        console.log(otp, number,'got otppppp');
        if(otp) {
            let otpVerifiedStatus = "";

            const verification_check = await client.verify.v2
        .services(serviceSID)
        .verificationChecks.create({ to: `+91${number}`, code: otp })
            otpVerifiedStatus = verification_check.status
            console.log(otpVerifiedStatus,'bbbbbbrrrrrrr')

            if(otpVerifiedStatus === "approved") {
                let doctor = await temporaryDoctor.findOne({ number : number })
                console.log(doctor,'i find deleting doctor');
                if(!doctor) {
                    return res.status(404).json({ error : "Verification Timeout" })
                }
                let newDoctor = new Doctor(doctor.toObject())
                newDoctor.signupStatus = "interdict"
                let doc = await newDoctor.save()
                doc = doc.toObject()
                delete doc.password
                let tempDoctor = await temporaryDoctor.deleteOne({ number : number })

                return { otpVerifiedStatus, doc}
            } else {
                return otpVerifiedStatus
            }

        } else {
            res.status(400).json({ error : "No Otp entered" })
        }
    } catch(err) {
        console.error(err,'hhhhh');
    }
}

const docLogin = (loginDetails) => {
    console.log(loginDetails,'xxrrrttttuuuuuiiioooo');
    return new Promise(async(resolve, reject) => {
        let response = {}
        try {
            let doctor = await Doctor.findOne({ number : loginDetails.formData.number })
            doctor = doctor.toObject()
            console.log(doctor,'ghghghghwerewerewerewereeee');
            if(doctor) {
                bcrypt.compare(loginDetails.formData.password, doctor.password).then((status) => {
                    console.log(status,'rtyurytuisadjkklj');
                    delete doctor.password
                    if(status) {
                        response.doctor = doctor
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status : false })
                    }
                })
            } else {
                resolve({ status : false })
            }
        } catch(err) {
            console.error(err,'uiuiuiuiuiuiuiuiuiuiuiuiuiuiuiui');
        }
    })
}

module.exports = {
    doctorSignup,
    docOtpVerify,
    docLogin,
}