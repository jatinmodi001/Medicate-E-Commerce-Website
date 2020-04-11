const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    type : String,
    isAvailable : {type : Boolean,default:true}
})

const ProductModel = mongoose.model("products",productSchema);

module.exports = ProductModel;