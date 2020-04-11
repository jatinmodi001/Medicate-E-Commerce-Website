const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
	username : {type:String},
	password : {type : String}
})

const AdminModel = mongoose.model("admin",adminSchema);

module.exports = AdminModel;