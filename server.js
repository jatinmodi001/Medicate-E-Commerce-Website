require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const UserModel = require('./models/users')
const products = require('./models/products')
const AdminModel = require('./models/admin')
const connectDB = require('./dbConnection')
const Users = require('./routes/Users')
const AdminRoutes = require('./routes/AdminRoutes')
const cors = require('cors')
const CurrentUser = require('./routes/CurrentUser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const path = require('path');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
connectDB();
const SECRET_KEY = process.env.SECRET_KEY
const ADMIN_KEY = process.env.ADMIN_KEY
var app = express();

var port = process.env.PORT || 8000

JwtValidator = (req,res,next)=>{
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    jwt.verify(token,SECRET_KEY,(err,authorizedData)=>{
        if(err){
            res.sendStatus(403).json('Session Expired');
        }
        else{
            req.user = authorizedData
            next(); 
        }
    })
}

AdminValidator = (req,res,next)=>{
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    jwt.verify(token,ADMIN_KEY,(err,authorizedData)=>{
        if(err){
            res.sendStatus(403).json('Session Expired');
        }
        else{
            req.user = authorizedData
            next(); 
        }
    })
}


app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.listen(port,function(){
    console.log('Listening at port 8000');
})

app.use(express.static(path.join(__dirname, 'build')));

app.use('/api/user',Users)
app.use('/api/userData',JwtValidator,CurrentUser)
app.use('/api/adminProtected',AdminValidator,AdminRoutes)

app.post('/api/admin/login',(req,res)=>{
    AdminModel.findOne({username:req.body.username})
    .then(docs=>{
        if(docs)
        {
            bcrypt.compare(req.body.password,docs.password,(err,isMatch)=>{
                if(err)
                {
                    res.sendStatus(500);
                }
                else if(isMatch)
                {
                    jwt.sign(req.body.username,ADMIN_KEY,(err,token)=>{
                        if(err){
                            res.send(500)
                        }
                        else{
                            res.send({token:token});
                        }
                    })
                }
                else{
                    res.send('Password Incorrect')
                }
            })
        }
        else{
            res.send("Invalid Username")
        }
    })
})

app.get('/products',(req,res)=>{
    products.find({})
    .then(docs=>{
        res.send(docs);
    })
    .catch(err=>{
        res.send(err)
    })
})

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
});
// app.post('/register',(req,res)=>{
//     console.log(req.body);
//     let admin = new AdminModel
//     admin.username = req.body.username;
//     bcrypt.hash(req.body.password,10,(err,hash)=>{
//         admin.password = hash
//         admin.save()
//     .then(()=>{
//         res.send('submiited')
//     })
//     })
    
// })

// app.post('/addProduct',function(req,res){
//     let product = new products;
//     product.type = req.body.type;
//     products.find({type:req.body.type})
//     .then(docs=>{
//         if(docs.length)
//         {
//             res.send('exist')
//         }
//         else{
//             product.save()
//     .catch(err=>{
//         res.sendStatus(500);
//     })
//     res.json('Added');
//         }
//     })
//     .catch(err=>console.log(err))
// })

// app.post('/deleteProduct',function(req,res){
//     products.deleteOne({type:req.body.type})
//     .then(res.send('Deleted'))
//     .catch(err=>console.log(err))
//})




// app.post('/check',function(req,res){
//     otps.find({email:req.body.email},function(err,docs){
//         if(err)
//         {
//             console.log(err)
//             res.sendStatus(500);
//         }
        
//         else if(docs.length == 0) 
//         {
//             res.json('ERROR');
//         }
//         else{
            
//             if(docs[0].token == req.body.inputOtp)
//             {
//                 otps.deleteOne({email:req.body.email})
//                 .catch(err=>{
//                     console.log(err)
//                     res.sendStatus(500)
//                 })
//                 let user = new users;
//                 user.Fname = req.body.Fname;
//                 user.Lname = req.body.Lname;
//                 user.email = req.body.email;
//                 user.pass = req.body.pass;
//                 user.mobile = req.body.mobile;
//                 user.save(function(err){
//                     if(err)
//                     {
//                         console.log(err);
//                     }
//                     else 
//                     {
//                         console.log('Submitted')
//                         console.log(user);
//                         res.json('submitted')
//                     }
//                 })
//             }
//             else{
//                 res.json('INCORRECT');
//             }
//         }
//     })
// })

// app.post('/verify',function(req,res){
//     console.log(req.body);
//     users.find({email:req.body.email},function(err,docs){
//         if(err)
//         {
//             res.sendStatus(500)
//         }
//         if(docs.length)
//         {
//             res.json('exists');
//         }
//         else
//         {
//             console.log('Sending Email')
//             const token = otplib.authenticator.generate(secret);

//             mailSender(req.body.email,'Verify your Medicate Account','Here is your OTP : '+token);

//             otps.find({email : req.body.email},function(err,docs){
//                 if(err)
//                 {
//                     console.log(err);
//                 }
//                 if(docs.length)
//                 {
//                     otps.update({email:req.body.email},{$set:{token:token}})
//                     .catch(err=>res.sendStatus(500));
//                 }
//                 else
//                 {
//                     let usertoken = new otps;
//                     usertoken.email = req.body.email;
//                     usertoken.token = token;
//                     usertoken.save()
//                     .catch(err=>{
//                         console.log(err);
//                         res.sendStatus(500);
//                     })
//                 }
//             })
//             res.json('OK');
//         }
//     })
// })


// app.post('/submitform',function(req,res){
//     let user = new users;
//     user.Fname = req.body.Fname;
//     user.Lname = req.body.Lname;
//     user.email = req.body.email;
//     user.pass = req.body.pass;
//     user.mobile = req.body.mobile;
//     user.save(function(err){
//         if(err)
//         {
//             console.log(err);
//         }
//         else 
//         {
//             console.log('Submitted')
//             console.log(user);
//             res.json('submitted')
//         }
//     })    
// })

// app.post('/login',function(req,res){
//     users.find({email : req.body.email,pass:req.body.pass},function(err,docs)
//     {
//         if(err)
//         {
//             console.log(err)
//         }
//         else if(docs.length)
//         {
//             console.log(docs);
//             res.json(docs[0].id);
//         }
//         else 
//         {
//             res.json('invalid')
//         }
//     })
// })
