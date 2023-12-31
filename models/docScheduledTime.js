const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const docTimeSchema = new Schema({
    dateObject : {
        type : String,
        required : true
    },

    timeFromObject : {
        type : String,
        required : true
    },

    timeToObject: {
        type : String,
        required : true
    },

    dateOfWeek : {
        type : String,
        required : true
    },

    slots : {
        type : String,
        required : true
    },

    doctorId : {
        type : String,
        required : true
    },

    presentDate : {
        type : String,
        required : true
    },

})

module.exports = mongoose.model('DoctorTime', docTimeSchema)