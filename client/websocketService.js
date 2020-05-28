var socket = io();
    
socket.on('report', (report) => {// add point to graph
    chartReport(report);
});
