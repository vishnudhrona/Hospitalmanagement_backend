const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorProfileSchema = new Schema({
    firstname : {
        type : String,
        required : true
    },

    lastname : {
        type : String,
        required : true
    },

    department : {
        type : String,
        required : true
    },

    gender : {
        type : String,
        required : true
    },

    number : {
        type : String,
        required : true
    },

    email : {
        type : String,
        required : true
    },

    house : {
        type : String,
        required : true
    },

    village : {
        type: String,
        required: true
    },

    city : {
        type: String,
        required: true
    },

    year : {
        type: String,
        required: true
    },

    degree : {
        type: String,
        required: true 
    },

    college : {
        type: String,
        required: true
    },

    experiencedyear : {
        type: String,
        required: true 
    },

    workeddepartment : {
        type: String,
        required: true 
    },

    position : {
        type: String,
        required: true
    },

    hospital : {
        type: String,
        required: true
    },

    description : {
        type: String,
        required: true
    },

    imageName : {
        type: String,
        required: true
    }, 

    fee : {
        type : String,
        required : true
    },

    doctorId : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema)