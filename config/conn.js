const mongoose = require('mongoose');

const connection = mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then( (result)=>{
    console.log("Connection establishedd");
}).catch((e)=>{
    console.log("error while connecting DB ",e);
})

module.exports = connection;