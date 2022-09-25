const mongoose = require('mongoose');

const userVerificationSchema = new mongoose.Schema({
    userId: String,
    uniqueString: String,
    createdAt:Date,
    expiresAt: Date
    
});

const UserVerification =  mongoose.model("UserVerification",userVerificationSchema);
module.exports = UserVerification;
