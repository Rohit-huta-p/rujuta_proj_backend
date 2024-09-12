const UserModel = require('./model')
// ENCRYPTION PASSWORD
const bcrypt = require('bcryptjs')
const encryptPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.log('Error hashing the password', error);
        throw error;
    }
}
const comparePass = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if(isMatch) return true
    } catch (error) {
        console.log("Password does not match", error);
        throw error;
    }
}

// Token
const jwt = require('jsonwebtoken');
const generateToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn: "3h"})
}

const login = async (req, res) => {

    const {email, password} = req.body;

    const user = await UserModel.findOne({email});
    if(user){
        const isPassChecked = await comparePass(password, user.password);
        if(isPassChecked){
            console.log(isPassChecked);
            const token = generateToken(user);
    
            
            res.cookie('token', token, {httpOnly: true});
            // res.cookie('token', token, productionCookieConfig);
            return res.status(200).json({token, message: "You are logged In"});
        }else{
            return res.status(401).json({error: 'Password does not match'});
        }
    }else{
        return res.status(404).json({error: 'Email Not Found!'});
    }
   
}

const register = async  (req, res) => {

    try {
         const {name, email, password} = req.body;
         const user = await UserModel.findOne({email});
         if(user){
             return res.status(400).json({error: 'User already exists'});
         }else{
             const hashedPassword = await encryptPassword(password);
             const newUser = new UserModel({name, email, password: hashedPassword});
             await newUser.save();
             return res.status(201).json({message: 'User created successfully'});
         }   
    } catch (error) {
     console.log(error);
     return res.status(500).json({ error: 'Internal server error' }); // Respond with an error 
    }
 }

 const logout = (req, res) => {
    if(req.cookies.token){
        res.clearCookie('token');
        return res.json({status: true, message: "Logeed out"});
    }else{
        return res.json({status: true, message: "No token"});
    }
}


const fetchUserDetails = (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const addToCart = async (req, res) => {
    const { productId } = req.body;
    const { userId } = req.user;

    try {
        // Find the user by userId
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the product is already in the user's cart
        const productInCart = user.cart.find(item => item.productId.toString() === productId.toString());
        if (productInCart) {
            return res.status(400).json({ message: 'Product is already in the cart' });
        }

        // Add the product to the user's cart
        user.cart.push({ productId });
        
        // Save the user after adding the product
        await user.save();

        return res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const fetchCartItems = async (req, res) => {
    const {userId} = req.user;
    const user = await UserModel.findById(userId)
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }else{

        if(user.cart.length == 0){
            console.log(user.cart.length == 0);
            
            return res.status(200).json({message: 'empty', cartItems: user.cart});
        }
        return res.status(200).json({cartItems: user.cart});
    }
}

const placeOrder = async (req, res) => {
    const {orderIds} = req.body;
    console.log(orderIds);
    
    const {userId} = req.user;
    const user = await UserModel.findById(userId)
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }else{
        orderIds.map(id => user.orders.push({
            productId: id,  
            orderDate: new Date()
        }))
        user.cart = [];
        await user.save();
        return res.status(200).json({success: true,message: 'Order placed'});
    }
}

const fetchorders = async (req, res) => {
    const {userId} = req.user;
    const user = await UserModel.findById(userId)
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }else{
       console.log(user.orders);
       
        return res.status(200).json({orders: user.orders});
    }
}


const removeCartItem = async (req, res) => {
    try {
        const userId = req.user._id; 
        const productId = req.body; 


        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        user.cart = user.cart.filter(item => item.productId !== Number(productId));


        await user.save();

        res.status(200).json({ message: 'Item removed from cart', cart: user.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {login, register, logout, fetchUserDetails, addToCart, fetchCartItems, removeCartItem, placeOrder, fetchorders}