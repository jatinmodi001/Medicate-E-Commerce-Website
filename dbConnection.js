// const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/medicate',{
// 	useNewUrlParser : true,
// 	useUnifiedTopology : true
// });

// var db = mongoose.connection;
// db.on('error',function(){
// 	console.log('Error connecting to database')
// });
// db.once('open',function(){
// 	console.log('Connected to MongoDB');
// });
// mongoose.set('useCreateIndex', true);

const mongoose = require('mongoose');

const URI = 'mongodb+srv://medicate:medicatedb@medicate-bgxmv.mongodb.net/test?retryWrites=true&w=majority'

const connectDB = async()=>{
	await mongoose.connect(URI,{
		useNewUrlParser : true,
		useUnifiedTopology : true,
		 useCreateIndex: true
	});
	console.log('Connected to DB...!');
}

module.exports = connectDB