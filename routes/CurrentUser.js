const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const UserModel = require('../models/users')
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const SECRET_KEY = process.env.SECRET_KEY

router.get('/getEmail',(req,res)=>{
	res.send(req.user);
})


router.post('/stripe/payment',async (req,res)=>{
	try {
    	const charge = await stripe.charges.create({
	      	amount:req.body.amount,
	      	currency: 'inr',
	      	source : req.body.source,
	      	receipt_email : req.body.receipt_email
    	})

    if (!charge) throw new Error('charge unsuccessful')

    res.status(200).json({
      message: 'charge posted successfully',
      charge
    })
  } catch (error) {
    res.send(error)
    }
})

router.get('/',(req,res)=>{
	UserModel.findOne({email:req.user})
	.then(docs=>{
		if(docs)
		{
			res.send({
				address:docs.address,
				cart : docs.cart,
				Fname : docs.Fname,
				Lname : docs.Lname,
				email : docs.email,
				mobile : docs.mobile
			})
		}
		else{
			res.sendStatus(403);
		}
	})
	.catch(err=>{
		res.sendStatus(500)
	})
})

router.get('/address',(req,res)=>{
	UserModel.findOne({email:req.user},{address:1,_id:0})
	.then(docs=>{
		res.send(docs);
	})
	.catch(err=>{
		res.sendStatus(500);
	})
})

router.post('/addAddress',(req,res)=>{
	UserModel.update({email:req.user},{$push: { address: req.body.address} })
	.then(()=>{
		res.send('added')
	})
	.catch(err=>{
		res.send(err)
	})
})

router.get('/orderHistory',(req,res)=>{
	UserModel.findOne({email:req.user},{orderHistory:1,_id:0})
	.then(docs=>{
		res.send(docs);
	})
	.catch(err=>{
		res.send(err)
	})
})

router.get('/cartData',(req,res)=>{
	UserModel.findOne({email : req.user},{cart:1,_id:0})
	.then(docs=>{
		res.send(docs)
	})
	.catch(err=>{
		res.send(err)
	})
})

router.post('/codPayment',(req,res)=>{
	console.log(req.body.totalPrice)
	UserModel.update({email : req.user},{ $push : { orderHistory : { products : req.body.items,address : req.body.address, price : req.body.totalPrice, paymentMode : "COD"}}
						,$set : {cart : [] }})
	.then((docs)=>{
		res.json('Order placed')
	})
	.catch(err=>{
		res.send(err);
	})
})

router.post('/cardPayment',(req,res)=>{
	console.log(req.body.totalPrice)
	UserModel.update({email : req.user},{ $push : { orderHistory : { products : req.body.items,address : req.body.address, price : req.body.totalPrice, paymentMode : "PREPAID"}}
						,$set : {cart : [] }})
	.then((docs)=>{
		res.json('Order placed')
	})
	.catch(err=>{
		res.send(err);
	})
})

router.post('/getCurrentAddress',(req,res)=>{
	UserModel.findOne({email : req.user},{address:1,_id:0})
	.then(docs=>{
		res.send(docs.address[req.body.index])
	})
	.catch(err=>{
		res.send(500)
	})
})

router.post('/deleteFromCart',(req,res)=>{
	UserModel.updateOne({email:req.user},{$pull:{cart:{ id: req.body.id } } } )
	.then(docs=>{
		res.send('Deleted')
	})
	.catch(err=>{
		res.sendStatus(500)
	})
})

router.post('/addToCart',(req,res)=>{
	UserModel.findOne({email : req.user, 'cart.id':req.body.id})
	.then(docs=>{
		if(!docs)
		{
			UserModel.update({email:req.user},{$push:{'cart':{id:req.body.id,qty:req.body.qty}}})
			.then(docs=>{
				res.send('Item added in your cart')
			})
			.catch(err=>{
				res.sendStatus(500)
			})
		}
		else{
			res.send('The item is already in your cart')
		}
	})
})

router.post('/increaseQty',(req,res)=>{
	UserModel.updateOne({email : req.user,'cart.id':req.body.id },{$set : {'cart.$.qty' : req.body.qty}})
	.then(docs=>{
		res.json('increased')
	})
	.catch(err=>{
		console.log(err)
		res.sendStatus(500)
	})
})

module.exports = router