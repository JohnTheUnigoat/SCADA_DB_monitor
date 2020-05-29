var idChartData = {};

var select = document.getElementById("chart-select");

select.addEventListener("change", () => {
    switchToCanvas(select.value);
});

var staticChartButton = document.getElementById("btn44");

staticChartButton.addEventListener("click", async () => {
    let time = document.getElementById("time").value;
    let id =  document.getElementById("chart-select").value;
    let response = await fetch(`/StaticGraph/${id}/${time}`);
    let jsonRes = await response.json();
    fillStaticChart(id, jsonRes);
});

// create charts for each canvas
let options = {
    legend: {
        display: false
    },
    tooltips: {
        enabled: false
    },
    animation: false,
    scales: {
        xAxes: [{
            type: 'time',
        }]
    }
}
let canvasContainer = document.getElementById("container");
let canvases = canvasContainer.children;
for (const div of canvases) {
    let flag = false;
    let staticChart;
    let dynamicChart;
    let indiv = div.getElementsByTagName("canvas");
    for(const canvas of indiv) {
        let ctx = canvas.getContext('2d');
        let newChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    lineTension: 0,
                    borderColor: 'rgb(255, 0, 0)',
                    data: []
                }]
            },
            options: options
        });
        if(flag == false) {
            dynamicChart = newChart;
            flag = true;
        }
        else {
            staticChart = newChart;
        } 
    }
    idChartData[div.id] = {
        div: div,
        staticChart: staticChart,
        staticData: staticChart.data.datasets[0].data,
        dynamicChart: dynamicChart,
        dynamicData: dynamicChart.data.datasets[0].data
    }
}

function fillStaticChart(id, report) {
    let chartData = idChartData[id];
    chartData.staticData.length = 0;
    for (const record of report) {
        let time = moment(record.time);
        let value = record.value;
        chartData.staticData.push({t: time, y: value});
    }
    chartData.staticChart.update();
}

function chartReport(report) {// for dynamic chart only
    for (const id in report) {
        let varRecords = report[id];

        let chartData = idChartData[id];

        varRecords.forEach(record => {
            let time = moment(record.time);
            let value = record.value;
            chartData.dynamicData.push({t: time, y: value});
        })

        chartData.dynamicChart.update();
    }
}

function switchToCanvas(id) {
    for (const key in idChartData) {
        idChartData[key].div.style.display = 'none';
    }

    idChartData[id].div.style.display = 'block';
}

switchToCanvas(select.value);
