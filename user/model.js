const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    cart: [
        {
            productId: Number,
        }
    ],
    orders: [
        {
            
                    productId: Number,
                    orderDate: { type: Date, default: Date.now },  
              
        }
    ]

},{
    timestamps: true
})


const UserModel = mongoose.model('users', UserSchema);


module.exports = UserModel;