const varialbeDataUrl = "/variableData";

const chartType = 'line';

const chartOptions = {
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
};

var select = document.getElementById("chart-select");

var dynamicChart;
var staticChart;

var dynamicData = {};
var staticData = {};

(async () => {
    let variableDescriptions = await (await fetch(varialbeDataUrl)).json();

    console.log(variableDescriptions);

    generatePage(variableDescriptions);
})();

function generatePage(variableDescriptions) {
    variableDescriptions.forEach(varDesc => {
        let id = varDesc.id;

        // creating select options
        let option = document.createElement("option");
        option.value = id;
        option.innerText = varDesc.name;
        select.appendChild(option);

        // init data arrays
        dynamicData[id] = [];
        staticData[id] = [];
    });

    // creating charts
    dynamicChart = createChartForCanvas("dynamic-chart");
    staticChart = createChartForCanvas("static-chart");

    dynamicChart.data.datasets[0].data = dynamicData[select.value];
    staticChart.data.datasets[0].data = staticData[select.value];

    select.children[0].setAttribute("selected", "selected");
}

function createChartForCanvas(canvasId) {
    let ctx = document.getElementById(canvasId).getContext("2d");

    let chart = new Chart(ctx, {
        type: chartType,
        data: {
            datasets: [{
                lineTension: 0,
                borderColor: 'rgb(255, 0, 0)',
                data: []
            }]
        },
        options: chartOptions
    });

    return chart;
}