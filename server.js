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