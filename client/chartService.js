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

var saveToFieStaticBtn = document.getElementById("saveToFile-static-btn");

saveToFieStaticBtn.addEventListener("click", () =>{
    let id = select.value;

    let csvString = "Time,Value\n";

    staticData[id].forEach(point => {
        csvString = csvString + `"${point.t.format("DD/MM/YYYY HH:MM:SS")}","${point.y}"\n`;
    });

    let fileName = `${id} - ${select.options[select.selectedIndex].text}.csv`;

    download(fileName, csvString);
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

function download(filename, text) {
    let a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
  
    a.style.display = 'none';
    document.body.appendChild(a);
  
    a.click();
  
    document.body.removeChild(a);
}
