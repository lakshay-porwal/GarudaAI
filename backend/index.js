const express = require('express');
const app = express();
require('dotenv').config();
const database_mongo = require('./database/db_mongo');
const AI_layer = require('./models/AI_layer')
const User_data = require('./database/Users_data')
const mongoose = require('mongoose')
const Hashing = require('./Security_layer/password')
const bcrypt = require('bcrypt')
const validator = require('validator');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Verify_user = require('./middleware/auth');
const { client, redis_cache } = require('./database/redis')
const ChatSession = require('./database/ChatSession');
const Chat = require('./database/Chat');



const cors = require('cors');

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

async function startServer() {
    try {

        await database_mongo();
        await redis_cache();
        app.listen(3000, async () => {
            console.log("Server is running on port 3000");
        })



    }
    catch (err) {
        console.log(err);
    }
}
startServer();


//-------------------Chat API
app.post('/chat', Verify_user, async (req, res) => {
    try {

        const userId = req.userId;
        const { userPrompt } = req.body;
        const chatId = req.body.chatId;

        if (!mongoose.Types.ObjectId.isValid(userId)) { //check id is in Object_id format or not
            return res.status(400).json({
                message: "Invalid User ID"
            });
        }

        if (!userPrompt?.trim()) {
            return res.status(400).json({
                message: "Prompt required"
            });
        }

        const user = await User_data.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }



        const result = await AI_layer(userId, userPrompt, chatId);

        res.send(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

//----------------------------------------login api
app.post('/login', async (req, res) => {
    try {

        const { emailID, password } = req.body

        if (!validator.isEmail(emailID)) {
            return res.status(400).json({
                message: "Invalid Email"
            });
        }
        //first check that user is already exist or not
        const user = await User_data.findOne({ emailID });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }


        // now check password


        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Password"
            })
        }



        //now genrate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_secret_key,
            { expiresIn: '1h' }
        )
        // console.log(user._id);
        // add cookies for user use in login 
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000

        });

        // if everything is correct
        res.status(200).json({
            message: "Login successful",
            user
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

//----------------------------------signUP
app.post('/signup', async (req, res) => {
    try {

        const { name, emailID, password } = req.body;

        //check user is already exist or not
        const user = await User_data.findOne({ emailID });
        if (user) {
            return res.status(400).json({
                message: "User already exist"
            })
        }
        if (!validator.isEmail(emailID)) {
            return res.status(400).json({
                message: "Invalid Email"
            });
        }


        // if user is not exist
        const newUser = new User_data({
            name,
            emailID,
            password: await Hashing(password)
        });

        await newUser.save();

        res.status(200).json({
            message: "User created successfully",
            user: newUser
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})
//------------------------------logout
app.post('/logout', async (req, res) => {
    try {
        //use redis for blacklisting the token 
        const token = req.cookies.token;

        await client.set(
            `blacklist:${token}`,
            "true",
            {
                EX: 3600
            }
        );

        res.clearCookie("token");

        res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "Error during logout"
        });
    }
});

//------------------------------------new-chat
app.post('/create-chat', async (req, res) => {
    try {

        const { userId } = req.body;

        const session = await ChatSession.create({
            userId
        });

        res.json({
            success: true,
            chatId: session._id
        });


    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

//-------------------------------fetch all chat sessions for user
app.get('/get-sessions', Verify_user, async (req, res) => {
    try {
        const userId = req.userId;
        const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
        res.json(sessions);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

//-------------------------------fetch old chats to display
app.get('/get-chats', Verify_user, async (req, res) => {
    try {

        const userId = (req.body && req.body.userId) || req.query.userId || req.userId;
        const chatId = (req.body && req.body.chatId) || req.query.chatId;

        // check Object ID's are valid or not
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(chatId)) {
            return res.send([]);
        }

        const data = await Chat.find({ userId, chatId }).sort({ createdAt: 1 });
        res.send(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

//---------------------count the chat created by user
app.get('/count-chats', Verify_user, async (req, res) => {
    try {

        const userId = req.userId;
        const count = await ChatSession.countDocuments({
            userId
        });
        res.json({
            chatCount: count
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})