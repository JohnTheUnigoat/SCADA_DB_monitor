var idChartData = {};

var select = document.getElementById("chart-select");

select.addEventListener("change", () => {
    switchToCanvas(select.value);
});

// create charts for each canvas
let canvases = document.getElementsByTagName("canvas");
for (let canvas of canvases) {
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
        options: {
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
    });

    idChartData[canvas.id] = {
        chart: newChart,
        data: newChart.data.datasets[0].data,
        canvas: canvas
    };
}

function chartReport(report) {
    for (const id in report) {
        let varRecords = report[id];

        let chartData = idChartData[id];

        varRecords.forEach(record => {
            let time = moment(record.time);
            let value = record.value;
            chartData.data.push({t: time, y: value});
        })

        chartData.chart.update();
    }
}

function switchToCanvas(id) {
    let canvases = document.getElementsByTagName("canvas");

    for (let canvas of canvases) {
        canvas.style.display = 'none';
    }

    document.getElementById(id).style.display = 'block';
}

switchToCanvas(select.value);
