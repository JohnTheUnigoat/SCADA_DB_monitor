var socket = io();

select.addEventListener("change", () => {
    let id = select.value;

    dynamicChart.data.datasets[0].data = dynamicData[id];
    staticChart.data.datasets[0].data = staticData[id];
})

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
