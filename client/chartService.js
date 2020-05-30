var socket = io();

var loadStaticChartBtn = document.getElementById("load-static-btn");

var dynamicTimespanSec = 60;
var dynamicExactSecOffset = 100;

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
        let data = dynamicData[id];

        varRecords.forEach(record => {
            data.push({
                t: moment(record.time),
                y: record.value
            });
        });

        let deleteLimit = data[data.length - 1].t.clone().startOf('s');
        deleteLimit.subtract({
            s: dynamicTimespanSec,
            ms: dynamicExactSecOffset
        });

        let i;

        for (i = 0; i < data.length; i++) {
            if (data[i].t > deleteLimit)
                break;
        }


        data.splice(0, i);
    }

    dynamicChart.update();
});
