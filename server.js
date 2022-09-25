const nodeMailer = require('nodemailer');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');

const mailService = require('./mailService')

//user model
const User = require('./config/model/user')

//user verification model
const UserVerification = require('./config/model/userVerification')

//random string 
const {v4: uuidv4} = require('uuid');


require(`dotenv`).config();

require('./config/conn');


const {validation} = require('./config/middleware/auth.middleware')

app.use(cors());

const io = require('socket.io')(server,{
    cors: {
        origin: "*",
      }
});

const users = {};

app.use(express.json());

app.post("/api/signIn", async (req,res)=>{
    console.log(req.body.email)
    const user = await User.findOne({
        email:req.body.email
    })
    if(!user){
        return res.json({
            status:404,
            error:true,
            message:"Email not registered"
        })
    }
    if(req.body.password!==user.password){
        return res.json({
            status:400,
            error:true,
            message:"Wrong Credential"
        })
    }
    if(!user.isVerified){
        return res.json({
            status:401,
            error:true,
            message:"Verfication email has been sent to your email"
        })
    }
    // now login

    const token = await user.getAuthToken()

    res.json({
        status:200,
        token:token,
        username:user.username,
        isVerified: user.isVerified
    })
});
app.post("/api/signUp",async (req,res)=>{
    
    try{
        
        const email = req.body.email.toLowerCase();
        const username = req.body.username;
        const password = req.body.password;

        const result = await User.findOne({email});

        if(result && result.isVerified){
            return res.json({
                status:400,
                error:true,
                message:"User already exist"
            })
        }
        

        // const user = new User({
        //         email:email,
        //         username: username,
        //         password: password,
        //         isVerified:false
        // })
        // 
        await User.updateOne({email:email},
                            {$set:{
                                    username:username,
                                    password:password,
                                    isVerified:false
                                }}, {upsert: true})

        // const token = await user.getAuthToken();

        // send verification email
        

        res.json({
            status:200,
        })
    }
    catch(e){
        console.log(e);
        res.json({
            status:500,
            error:true,
            message:"Internal server error"
        })
    }
    
});
app.post("/api/sendOtp",validation, (req,res)=>{
    try {
        const email = req.body.email;
        const username = req.body.userName;
        console.log("Email :" + email+" Username : "+username);
        sendVerificationMail(email)
        res.send("done");

    } catch (error) {
        console.log("Error happens ", error);
        res.send("error");
    }
    
});

const sendVerificationMail = async (email)=>{
    
    try{

        otp = "32423";
        await mailService.sendEmail(email,otp,"OTP-Verification for Stranger-Chat");
        
    }
    catch(err){
        console.log("error occured "+err);
    }

}

io.on("connection", (socket) => {
    
    socket.on('new-user-joined',(userName)=>{
        
        console.log("new user joined ", userName);
        users[socket.id] = userName;
        socket.broadcast.emit("user-joined",userName);

    });

    socket.on('chat', (message)=>{
        console.log(message);
        io.emit("chat",message);
    })
});

server.listen(5000,()=>{
    console.log("server is listening in 5000...")
});