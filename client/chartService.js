var socket = io();

socket.on('report', (report) => {
    for (const id in report) {
        let varRecords = report[id];

        varRecords.forEach(record => {
            dynamicData[id].push({
                t: moment(record.time),
                y: record.value
            });
        });

    }

    dynamicChart.update();
});
