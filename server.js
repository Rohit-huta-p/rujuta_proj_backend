const express = require('express');
const app = express();

// CORS
const cors = require('cors')
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    }
));


app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser())
// ENV
require('dotenv').config();
const mongoose = require('mongoose');

// USER Route
const userRoute = require('./user/routes');
app.use('/api/user',userRoute )


// CONNECTION
const PORT = process.env.PORT
const startServer  = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")

        app.listen(PORT, () => {
            console.log("Server Started at", PORT);
        });

    } catch (error) {
        console.log(error);
    }
    
}


startServer();