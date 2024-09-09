const express = require('express')
const router = express.Router();
const {login, register, logout, fetchUserDetails ,addToCart, fetchCartItems, placeOrder, fetchorders} = require('./contoller');

const authenticate = require('./authenticate');
router.post('/login',login )
router.post('/register',register )
router.get('/logout',logout )
router.post('/cart/add',authenticate, addToCart )
router.get('/cart/allitems',authenticate, fetchCartItems )
router.post('/placeorder',authenticate, placeOrder )
router.get('/fetchorders',authenticate, fetchorders )
router.get('/fetchUserDetails',authenticate, fetchUserDetails )

module.exports = router;