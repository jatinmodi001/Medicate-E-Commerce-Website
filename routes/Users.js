const express = require('express');
const router = express.Router();
const UserModel = require('../models/users')
const OtpModel = require('../models/otps')
const otplib = require('otplib')
const mailSender = require('../mailSender')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY


router.post('/login',function(req,res){
    UserModel.findOne({email:req.body.email})
    .then(docs=>{
        if(docs)
        {
            if(docs.isBlocked)
            {
                res.send('Your Account Has Been Blocked')
            }
            bcrypt.compare(req.body.pass,docs.pass,(err,isMatch)=>{
                if(err)
                {
                    res.sendStatus(500);
                }
                else if(isMatch)
                {
                    jwt.sign(req.body.email,SECRET_KEY,(err,token)=>{
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
            res.send("User doesn't exist")
        }
    })
})









router.post('/resendotp',async (req,res)=>
{
	console.log('Sending Email');
	const secret = otplib.authenticator.generateSecret();
    const token = otplib.authenticator.generate(secret);

    await mailSender(req.body.email,'Verify your Medicate Account','Here is your OTP : '+token)

    OtpModel.find({email : req.body.email},function(err,docs){
        if(err)
        {
            console.log(err);
        }
        if(docs.length)
        {
            OtpModel.update({email:req.body.email},{$set:{token:token}})
            .then(()=>{res.json('Mail Sent')})
            .catch(err=>res.sendStatus(500));
        }
        else
        {
            let usertoken = new OtpModel;
            usertoken.email = req.body.email;
            usertoken.token = token;
            usertoken.save()
            .then(()=>{
                res.json('Mail Sent')
            })
            .catch(err=>{
                console.log(err);
                res.sendStatus(500);
            })
        }
    })

})
router.post('/verify',function(req,res){
    UserModel.find({email:req.body.email},function(err,docs){
        if(err)
        {
            res.sendStatus(500)
        }
        if(docs.length)
        {
            res.json('exists');
        }
        else
        {
        	console.log('Sending Email')
        	const secret = otplib.authenticator.generateSecret()
            const token = otplib.authenticator.generate(secret);
            mailSender(req.body.email,'Verify your Medicate Account','Here is your OTP : '+token);

            OtpModel.find({email : req.body.email},function(err,docs){
                if(err)
                {
                    console.log(err);
                }
                if(docs.length)
                {
                    OtpModel.update({email:req.body.email},{$set:{token:token}})
                    .then(()=>{
                    	res.json('OK')
                    })
                    .catch(err=>res.sendStatus(500));
                }
                else
                {
                    let usertoken = new OtpModel;
                    usertoken.email = req.body.email;
                    usertoken.token = token;
                    usertoken.save()
                    .then(()=>{
                    	res.json('OK');
                    })
                    .catch(err=>{
                        console.log(err);
                        res.sendStatus(500);
                    })
                }
            })
        }
    })
})



router.post('/validateotp',function(req,res){

    OtpModel.find({email:req.body.email},function(err,docs){
        if(err)
        {
            console.log(err)
            res.sendStatus(500);
        }
        else if(docs.length == 0) 
        {
            res.json('ERROR');
        }
        else{
            console.log(req.body);    
            if(req.body.inputOtp === docs[0].token)
            {
                OtpModel.deleteOne({email:req.body.email})
                .catch(err=>{
                    console.log(err)
                    res.sendStatus(500)
                })
                let user = new UserModel;
                user.Fname = req.body.Fname;
                user.Lname = req.body.Lname;
                user.email = req.body.email;
                user.mobile = req.body.mobile;
                bcrypt.hash(req.body.pass, 10, (err, hash) => {
                    user.pass = hash
                    user.save().
                    then(()=>{
                        console.log(user);
                        res.json('submitted');
                    })
                    .catch(err=>{
                        console.log(err);
                    })
                })
            }
            else{
                res.json('INCORRECT');
            }
        }
    })
})



module.exports = router;