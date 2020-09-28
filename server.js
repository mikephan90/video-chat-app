const express = require('express');
const app = express();
const server = require('http').Server(app);
// creates server based on express server. allows socket know which server we are using
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid')

// sets up server - how we render our view. we use EJS here
app.set('view engine', 'ejs');
// sets up static folder - our javascript and css here
app.use(express.static('public'));

// redirect to unique random ID
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

// route to create a room. get room parameter from :room
app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room });
});

// whenever we connect we set up socket with roomId and userId
// join=join the roomId with current user
// to = broadcast to everyone in room new user joined
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
    })
})

server.listen(3000);
