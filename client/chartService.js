var socket = io();

var loadStaticChartBtn = document.getElementById("load-static-btn");

loadStaticChartBtn.addEventListener("click", async () => {
    let time = document.getElementById("static-timeperiod").value;
    let id = select.value;

    let response = await fetch(`/StaticGraph/${id}/${time}`);
    let jsonRes = await response.json();

    fillStaticChart(id, jsonRes);
});

function fillStaticChart(id, report) {
    let chartData = staticData[id];
    chartData.length = 0;

    for (const record of report) {
        chartData.push({
            t: moment(record.time),
            y: record.value
        });
    }

    staticChart.update();
}

select.addEventListener("change", () => {
    let id = select.value;
    
    dynamicChart.data.datasets[0].data = dynamicData[id];
    dynamicChart.update();

    staticChart.data.datasets[0].data = staticData[id];
    staticChart.update();
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
