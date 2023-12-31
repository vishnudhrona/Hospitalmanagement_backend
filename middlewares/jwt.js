const jwt = require('jsonwebtoken')
const env = require('dotenv').config()

module.exports = {

    autherizeRole : (requiredRole) => (req, res, next) => {
        const baererToken = req.headers.authorization
        console.log(baererToken,'got it');

        if(!baererToken) {
            return res.status(401).json({ message : "No token provided"})
        }
        const token = baererToken.split(" ")[1]
         
        if(!token) {
            return res.status(401).json({ message : "Invalide token format" })
        }
        const jwtKey = process.env.JWT_TOKEN;

        jwt.verify(token, jwtKey, (err, decodedToken) => {
            req.token = token;
            if(err) {
                return res.status(401).json({ message : err.message})
            }

            const { role } = decodedToken

            if(!role || role !== requiredRole) {
                return res.status(403).json({ message : 'Insufficient permission '})
            }
            next();
        })
    },


    signUser : (user) => {
        return new Promise((resolve, reject) => {
            const jwtKey = process.env.JWT_TOKEN;
            const payload = {
                userId : user._id,
                user : user.patientfirstname,
                number : user.number,
                role : 'user'
            }
            jwt.sign(payload, jwtKey, {expiresIn : '2h'}, (err, token) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(token)
                }
            })
        })
    },

    signDoctor : (doctor) => {
        console.log(doctor.firstname,'cccccfffffffqqqqqq');
        console.log(doctor.number,'cccccfffffffqqqqqq');
        console.log(doctor._id,'cccccfffffffqqqqqq');
        return new Promise((resolve, reject) => {
            const jwtKey = process.env.JWT_TOKEN;
            const payload = {
                doctorId : doctor._id,
                doctorName : doctor.firstname,
                doctorNumber : doctor.number,
                role : 'doctor'
            }
            jwt.sign(payload, jwtKey, {expiresIn : '2h'}, (err, token) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(token)
                }
            })
        })
    }
}