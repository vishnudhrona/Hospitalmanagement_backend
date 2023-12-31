var db = require('../config/connection')
const bcrypt = require('bcrypt');
const env = require('dotenv').config({path: __dirname + '/../.env'})
var temporaryDoctor = require('../models/temporaryDoctor')
var Doctor = require('../models/doctor')
const { Vonage } = require('@vonage/server-sdk');
const { signUser } = require('../middlewares/jwt');
var temporaryDoctor = require('../models/temporaryDoctor');
var DoctorProfile = require('../models/doctorProfile')
const DoctorTime = require('../models/docScheduledTime')
const BookingDetails = require('../models/bookingDetails')
const nodemailer = require("nodemailer");

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
                        response = doctor
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

const addDoctorProfile = (docProf) => {
    console.log(docProf,'helpers doc');
    let doctorProf = null
    let response = {}
    return new Promise(async (resolve, reject) => {
        try {
            doctorProf = await DoctorProfile.create(docProf)
            if(doctorProf) {
                response.status = true
                resolve(response)
            } else {
                resolve({status : false})
            }
        } catch(err) {
            console.error(err);
            reject(err)
        }
    })
}

const fetchDoctorProfile = (doctorId) => {
    console.log(doctorId,'zzzzqqqqqqqqqqq');
    return new Promise(async(resolve, reject) => {
        await DoctorProfile.findOne({doctorId : doctorId})
        .then((doctorProfile) => {
            resolve(doctorProfile)
        })
    })
}

const doctorTimeschedule = (timeSchedule) => {
    console.log(timeSchedule,'i got timeSchedule');
    return new Promise(async(resolve, reject) => {
        try {
            let docTime = await DoctorTime.create(timeSchedule)
            console.log(docTime,'bbbbyyyyeeeeee');
            resolve(docTime)
        } catch(err) {
            console.error(err,'hyyyyy');
            reject(err)
        }
    })
}

const fetchDoctorTimeSchedule = (docId) => {
    return new Promise((resolve, reject) => {
        try {
            DoctorTime.find({ doctorId : docId }).then((response) => {
                console.log(response, 'i got fetch time response');
                resolve(response)
            })
        } catch(err) {
            console.error(err,'i got error in fetch doctor timeschedule');
            reject(err)
        }
    })
}

const fetchBookingDetails = (docId) => {
    console.log(docId,'xxxxxxxxx');
    return new Promise(async(resolve, reject) => {
        try {
            let bookings = await BookingDetails.find({ doctorId : docId.doctorId})
            console.log(bookings,'qqqqqqqqqqqq');
            if(bookings) {
                resolve(bookings)
            } else {
                reject()
            }
        } catch(err) {
            console.error(err);
        }
    })
}

const invitingPatient = (invitingDetails) => {
    console.log(invitingDetails,'zzzzzzzzz');
    return new Promise(async(resolve, reject) => {
        try {
            let bookings = await BookingDetails.findOne({ userEmail : invitingDetails.bookinguseremail })
            console.log(bookings,'qqqqqqqqqvvvvvrrrrr');
            if(bookings) {
                const transporter = nodemailer.createTransport({
                    host: "forward-email=centaurr252@gmail.com",
                    port: 465,
                    secure: true,
                    service: 'Gmail',
                    auth: {
                      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                      user: 'centaurr252@gmail.com',
                      pass: 'nuslvzvfidhqyjrr',
                    },
                  });


                  async function main() {
                    // send mail with defined transport object
                    const info = await transporter.sendMail({
                        from: 'centaurr252@gmail.com', // sender address
                        to: invitingDetails.bookinguseremail, // list of receivers
                    subject: "Hello ✔", // Subject line
                    text: 'copy this url to your browser', // plain text body
                    html: `<p>${invitingDetails.urlWithData}</p>`, // html body
                  });
                  console.log('this is working');
                
                  console.log("Message sent: %s", info.messageId);
                  
                }
                
                main().catch(console.error);

                resolve({status : true})
            }
        } catch(err) {
            console.error(err,'inviting error');
        }
    })

}

module.exports = {
    doctorSignup,
    docOtpVerify,
    docLogin,
    addDoctorProfile,
    fetchDoctorProfile,
    doctorTimeschedule,
    fetchDoctorTimeSchedule,
    fetchBookingDetails,
    invitingPatient
}