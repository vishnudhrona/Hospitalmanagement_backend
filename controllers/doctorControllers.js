const express = require("express");
const cors = require("cors");
const router = express.Router();
const user = require('../models/user')
const doctorHelpers = require('../helpers/doctorHelpers')
const {signUser, signDoctor, autherizeRole} = require('../middlewares/jwt')
const { S3Client, PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const jwt = require('jsonwebtoken')
// const env = require('dotenv').config()
const env = require('dotenv').config({path: __dirname + '/../.env'})
const crypto = require('crypto');
const sharp = require('sharp');

const randomNameImage = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const bucketName = process.env.BUCKET_NAME
const region = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials : {
        accessKeyId: accessKey,
        secretAccessKey:secretAccessKey,
    },
    region: region
})



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
        console.log(doc,'ffffffffyyyyyyqqqq');
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
            if(response.signupStatus === "Approved") {
                const token = await signDoctor(response)
                console.log(token,'ccccccccccccccccccccccccccccc');
                res.status(200).json({ status : true, message : "Login Successful", user : response, auth : token })
            } else {
                res.status(200).json({ status : true, message : 'Approval pending', user : response, auth : token })
            }
        } else {
            res.status(200).json({status: false, error: 'Login failed. Invalid credentials.'});
        }
    } catch(err) {
        console.log(err,'xdxdxdxd');
        res.status(500).json({ status: false, message: 'Internal server error.' });
    }
   
}

let doctorAddProfile = async(req, res) => {
    let docprof = null
    try {
        const buffer = await sharp(req.file.buffer).resize({ height : 386, width : 271, fit : 'inside'}).toBuffer()
        const imageName = randomNameImage() 
        const params = {
            Bucket : bucketName,
            Key : imageName,
            Body : buffer,
            ContentType : req.file.mimetype,
        }
    
        const command = new PutObjectCommand(params)
        await s3.send(command)

        docprof = req.body
        docprof.imageName = imageName

        console.log(docprof,'i got every details of doctor');
        let doctorProfileAddedStatus = await doctorHelpers.addDoctorProfile(docprof)
        console.log(doctorProfileAddedStatus,'voooooooooopppppppppppppp');
        if(doctorProfileAddedStatus) {
            res.status(200).json({ status : true, message : 'Your profile added successfully'})
        } else {
            res.status(200).json({ status : false, message : 'Something went to wrong'})
        }
    } catch(err) {
        console.error(err,'vtyyyyyy');
    }
    
}

let fetchDoctorProfile = async (req, res) => {
  const token = req.token;
  const jwtKey = process.env.JWT_TOKEN;
  let docId = null;

  jwt.verify(token, jwtKey, async (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const payload = decoded;
    docId = payload.doctorId;
    console.log("Decoded payload:", docId);
  });

  try {
    let response = await doctorHelpers.fetchDoctorProfile(docId);
    console.log(docId, "i got docId");
    console.log(response, "i got doctor profile in database");

    const getIbjectParams = {
      Bucket: bucketName,
      Key: response.imageName,
    };

    const command = new GetObjectCommand(getIbjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    response.imageUrl = url
    let docImageUrl = response.imageUrl
    console.log(docImageUrl,'image url');
    if(docImageUrl) {
        res.status(200).json({message : 'profile added successfully', doctor : response, imageUrl : docImageUrl})
    } else {
        res.status(401).json({message : 'something went to wrong'})
    }

  } catch (err) {
    console.error(err, "doc profile fetch error");
  }
};

let doctorTimeschedule = (req, res) => {
    console.log(req.body.date,'hhhhhhuuuuuuuuhhhhhhaaaaa');

    const week = new Date(req.body.date)
    const options = { weekday : 'long' };
    const dateOfWeek = new Intl.DateTimeFormat('en-US', options).format(week)

    console.log(dateOfWeek,'cccccccccqqqqqeeee');

    let dateObject = new Date(req.body.date)
    dateObject = dateObject.toLocaleDateString()

    console.log(dateObject,'hai dear i got date of doctor');

    let timeFromObject = new Date(req.body.formattedTimeFrom)
    timeFromObject = timeFromObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

    console.log(timeFromObject,'i got time without seconds')

    let timeToObject = new Date(req.body.formattedTimeTo)
    timeToObject = timeToObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

    let slots = req.body.slots
    let doctorId = req.body.doctorId
    let presentDate = new Date()
    console.log(presentDate,'vvvvyyyyaaaapaarrr');

    let body = {
        presentDate,
        dateObject,
        timeFromObject,
        timeToObject,
        dateOfWeek,
        slots,
        doctorId
    }

    doctorHelpers.doctorTimeschedule(body).then((docTime) => {
        console.log(docTime,'bbbbbuuuuuttttt');
        if(docTime) {
            res.status(200).json({ message : 'Time added successfully'})
        } else {
            res.status(401).json({ message : "something went to wrong"})
        }
    })
}

let fetchDoctorTimeSchedule = async (req, res) => {
    console.log(req.query.docId,'fetch is working');
    let docId = req.query.docId
    try {
        let timeSchedule = await doctorHelpers.fetchDoctorTimeSchedule(docId)
        if(timeSchedule) {
            res.status(200).json({timeSchedule})
        } else {
            res.status(401).json({messege : 'something went to wrong'})
        }
    } catch(err) {
        console.error(err);
    }
}

const fetchBookingDetails = (req, res) => {
    console.log(req.query,'cccccc');
    doctorHelpers.fetchBookingDetails(req.query).then((response) => {
        console.log(response,'qaaatttttttttttttttttt');
        if(response) {
            res.status(200).json({ response })
        } else {
            res.status(401).json({ message : 'You have no bookings'})
        }
    })
}

const invitingPatient = (req, res) => {
    const { peerId, bookinguseremail } = req.query
    console.log(peerId,'bbbbbbbbbbb');

    const { URLSearchParams } = require('url');

    const baseUrl = 'http://localhost:5173/doctors/remoteuservideo'
    const params = new URLSearchParams({ peerId : peerId})
    const urlWithData = `${baseUrl}?${params.toString() || ''}`

    console.log(urlWithData,'url with dataaaa');

    doctorHelpers.invitingPatient({bookinguseremail,urlWithData})

}





module.exports = {
    doctorSignup,
    doctorOtpVerification,
    doctorLogin,
    doctorAddProfile,
    doctorTimeschedule,
    fetchDoctorProfile,
    fetchDoctorTimeSchedule,
    fetchBookingDetails,
    invitingPatient,
}