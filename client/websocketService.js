var socket = io();
    
socket.on('asdf', (message) => {// add point to graph
    addValue(message);
});