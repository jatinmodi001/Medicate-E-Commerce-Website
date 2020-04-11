const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Fname : String,
    Lname : String,
    email : {type : String, unique : true},
    pass : String,
    mobile : Number,
    isBlocked : {type : Boolean,default:false},
    address : {type : Array},
    cart : [{id:Number, qty:Number}],
    orderHistory : [{products:[{id:Number,qty:Number}],price : Number,address : String,paymentMode : String}]
})

const UsersModel = mongoose.model("users",userSchema);

module.exports = UsersModel;