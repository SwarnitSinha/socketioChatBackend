const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required:true,
        lowercase: true,
    },
    password:{
        type: String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    link{
        
    }
    
});
userSchema.methods.getAuthToken = async function(){
    return token = await jwt.sign({_id:this._id},process.env.SECRET_KEY);
}
const User =  mongoose.model("User",userSchema);
module.exports = User;
