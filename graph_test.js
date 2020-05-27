const express = require('express');
const socket = require('socket.io')

const app = express();

const server = app.listen(3000);

const io = socket(server);

app.use(express.static('./client'));

// io.on('connection', socket => {
//     setInterval(() => {
//         socket.emit('asdf', 'hello');
//     }, 1000);
// });

setInterval(() => {
    io.sockets.emit('asdf', {
        id: 44,
        time: new Date(),
        value: Math.random() * 100 
    });
}, 1000);
