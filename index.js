const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const jwt = require('jsonwebtoken');

require(`dotenv`).config();

const mailService = require('./mailService')
const {hashPassword,correctPassword} = require('./config/utils/hashPassword')

//user model
const User = require('./config/model/user')

//user verification model
const UserVerification = require('./config/model/userVerification')

//random string 
const {v4: uuidv4} = require('uuid');

const port = process.env.PORT || 5000

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

app.get("/",(req,res)=>{
    res.json({
        message: "Welcome to Chat app"
    })
})

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

    const passCorrect = await correctPassword(req.body.password,user.password)
    if(!passCorrect){
        return res.json({
            status:400,
            error:true,
            message:"Wrong Credential"
        })
    }
    if(!user.isVerified){

        //LOGIC FOR SENDING VERIFICATION MAIL
        await sendVerificationMail(req,res);

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
        const password = await hashPassword(req.body.password);
        console.log(email, username, password)
        const result = await User.findOne({email});

        if(result && result.isVerified){
            return res.json({
                status:400,
                error:true,
                message:"User already exist"
            })
        }

        await User.updateOne({email:email},
                            {$set:{
                                    username:username,
                                    password:password,
                                    isVerified:false
                                }}, {upsert: true})

        // const token = await user.getAuthToken();

        // send verification email
        
        await sendVerificationMail({email,username});

        res.json({
            status:200,
            message:"Verfication link has been sent to your email. Confirm your email"
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

//for rough
// app.post("/api/sendOtp",async(req,res)=>{
//     try{
//         console.log("here");
//         const result = await sendVerificationMail(req,res);
//         // console.log(result.message)
//         res.json({
//             message:"mail has been sent"
//         });
//     }
//     catch(error){
//         console.log(error);
//     }
// })

const sendVerificationMail = async (data)=>{
    try {
        const email = data.email;
        const username = data.username;
        console.log("Email :" + email+" Username : "+username);

        const token = await jwt.sign({email,username},process.env.SECRET_KEY,{ expiresIn: 600 })

        const link = "https://randombatch.herokuapp.com/api/mailVerification?token="+token

        await mailService(email,username,link,"OTP-Verification for Stranger-Chat");

        return;
    } catch (error) {
        console.log("Error happens ", error);
        return;
    }
}

app.get("/api/mailVerification",async (req,res)=>{
    console.log(req.query);

    //things to do - JWT verify
    try{

        const result = await jwt.verify(req.query.token,process.env.SECRET_KEY);
        console.log(result);

        //verify the user in DB
        const email = result.email;

        //if the email will be wrong then it will throw an error
        const user = await User.updateOne({email:email},{$set:{isVerified:true}})

        res.send("You are verified. Now sign In")
    
    }
    catch(e){
        console.log(e.message)
        res.send("Sorry Token Expired");

    }
    


})

app.post("/api/verifyToken", async (req,res)=>{
    try{
        const token = req.body.token;
        const result =await jwt.verify(token,process.env.SECRET_KEY);
        console.log(result); //result has user_id
        const user = await User.findOne({_id:result},{password:0,isVerified:0});
        
        res.json({
            user:user
        })
    }
    catch(error){
        res.json({
            message:"Error happens"
        })
    }
})


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

server.listen(port,()=>{
    console.log("server is listening in "+port)
});



