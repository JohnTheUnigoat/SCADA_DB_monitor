var idChartData = {};

var select = document.getElementById("chart-select");

select.addEventListener("change", () => {
    switchToCanvas(select.value);
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
    let flag = 0;
    let staticChart;
    let dynamicChart;
    let indiv = div.children;
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
            if(flag === 0) {
                dynamicChart = newChart;
                flag = 1;
            }
            else {// flag === 1
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
