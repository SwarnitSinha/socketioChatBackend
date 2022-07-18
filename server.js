const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server,{
    cors: {
        origin: "*",
      }
});

const users = {};


io.on("connection", (socket) => {
    
    // console.log);
    console.log(socket); // ojIckSD2jqNzOqIrAGzL
    
    
    socket.on('new-user-joined',(userName)=>{
        
        console.log("new user joined ", userName);
        users[socket.id] = userName;
        socket.broadcast.emit("user-joined",userName);

    });
    
    socket.on("send",message=>{
        socket.broadcast.emit('receive',{message:message, name: users[socket.id]});
    });
    
    socket.on('chat', (message)=>{
        console.log(message);
        io.emit("chat",message);
    })
});

server.listen(5000,()=>{
    console.log("server is listening in 5000...")
});