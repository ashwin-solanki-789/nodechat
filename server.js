const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMsg = require('./utils/msgLayout');
const bodyParser = require('body-parser');
const { userJoin, getCurrentUser, userLeave, getRoomUsers, userExist, router } = require('./utils/user');
const cookieParser = require('cookie-parser');
const room = require('./utils/room');

//set the static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/user', router);
app.use('/room', room);
app.use(cookieParser());

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server);
const botName = 'GroupChat Bot';

// Runs when client connect
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        if (userExist(username, room) == 1) {
            io.emit('exit',{
                username,
                message : 'User Already Exist in the selected room. Please Exit the browser.'
            })
        } else {
            const user = userJoin(socket.id, username, room);

            socket.join(user.room);

            // Message to a particulary client. Welcome the new user 
            socket.emit('message', formatMsg(botName, 'Welcome to GroupChat'));

            // Broadcast when user connects. Msg everyone except own.
            socket.broadcast.to(user.room).emit('message', formatMsg(botName, `${user.username} has join the chat`));
            //send user and room information
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })

    // Listen for chat msg.
    socket.on('chatMsg', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMsg(user.username, msg));
    })

    // Runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            // To Msg every client
            io.to(user.room).emit('message', formatMsg(botName, `${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})
app.get('*', (req, res) => {
    res.redirect('404.html')
    res.end();
})
server.listen(port, () => console.log(`Listening on Port ${port}.  Click Here : http://localhost:${port}`))