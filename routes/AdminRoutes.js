const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')

const AdminModel = require('../models/admin')
const UserModel = require('../models/users')
const MedicineModel = require('../models/products')
require('dotenv').config();

router.get('/userData',(req,res)=>{
	UserModel.find({},function(err,docs){
        if(err){
            res.sendStatus(500);
        }
        else
        {
            res.json(docs)
        }
    })
})

router.get('/medicines',(req,res)=>{
	MedicineModel.find({},(err,docs)=>{
		if(err)
		{
			res.sendStatus();
		}
		else{
			res.json(docs);
		}
	})
})

router.get('/count',async (req,res)=>{
	let users = 0;
	let products = 0;
	let earnings = 0;
	await UserModel.find({},(err,docs)=>{
		if(err)
		{
			res.send(err);
		}
		else{
			for(var i=0;i<docs.length;i++)
			{
				for(var j=0;j<docs[i].orderHistory.length;j++)
				{
					earnings += docs[i].orderHistory[j].price
				}
			}
			users = docs.length;
			MedicineModel.find({},(err,docs)=>{
			if(err){
				res.send(err);
			}
			else{
				products = docs.length
				res.send({users,products,earnings})
			}
			})
		}
	})
	
})

router.post('/addProduct',(req,res)=>{
	let product = new MedicineModel;
    product.type = req.body.type;
    MedicineModel.find({type:req.body.type})
    .then(docs=>{
        if(docs.length)
        {
            res.send('exist')
        }
        else{
            product.save()
            .then(()=>{
            	res.json('Added');
            })
    		.catch(err=>{
        		res.sendStatus(500);
    		})
        }
    })
    .catch(err=>res.send(err))
})


router.post('/deleteProduct',(req,res)=>{
	MedicineModel.deleteOne({type:req.body.type})
    .then(res.send('Deleted'))
    .catch(err=>console.log(err))
})

router.post('/blockUser',(req,res)=>{
	UserModel.updateOne({email : req.body.email},{$set:{isBlocked:true}})
	.then(data=>{
		res.send('Blocked');
	})
	.catch(err=>{
		res.send(err)
	})
})
router.post('/unBlockUser',(req,res)=>{
	UserModel.updateOne({email : req.body.email},{$set:{isBlocked:false}})
	.then(data=>{
		res.send('Blocked');
	})
	.catch(err=>{
		res.send(err)
	})
})

router.post('/userDetails',(req,res)=>{
	UserModel.findOne({_id : req.body.id})
	.then(docs=>{
		res.send(docs);
	})
	.catch(err=>{
		res.send(err)
	})
})

module.exports = router