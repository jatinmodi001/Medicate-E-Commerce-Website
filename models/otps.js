const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    email : {type : String, unique : true},
    token : String
})

const otpModel = mongoose.model("user_otps",otpSchema);

module.exports = otpModel;