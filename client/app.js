// API urls
const varialbesDataFetchUrl = "/variableData";
const staticReportFetchUrl = "/StaticGraph/:id/:time";

// Chart options
const chartType = 'line';

const chartOptions = {
    elements: {
        point: {
            radius: 0
        },
        line: {
            borderWidth: 1.5
        }
    },
    legend: {
        display: false
    },
    tooltips: {
        enabled: false
    },
    animation: false,
    scales: {
        xAxes: [{
            type: 'time'
        }]
    }
};

// Dynamic graph time limit
const dynamicTimespanSec = 60;
const dynamicExactSecOffset = 100;


var socket = io();

// DOM elements
var select = document.getElementById("chart-select");

var varDescText = document.getElementById("var-description");

var staticGraphTimespan = document.getElementById("static-timeperiod");

var loadStaticChartBtn = document.getElementById("load-static-btn");
var saveToFileStaticBtn = document.getElementById("static-save-file-btn");

// Chart objects
var dynamicChart;
var staticChart;

// Data dictionaries for charts, (id: data[])
var dynamicData = {};
var staticData = {};

// Variable descriptions dictionaly (id: description)
var varsDesc = {};

// Event listeners
select.addEventListener("change", onSelectChange);

loadStaticChartBtn.addEventListener("click", onLoadStaticChartButton);

saveToFileStaticBtn.addEventListener("click", onSaveStaticFileBtn);

socket.on('report', handleSocketReport);

// Page entry point
generatePage();


// Functions

// fetches variable data and generates page based on it
async function generatePage() {
    let varsNameDesc = await (await fetch(varialbesDataFetchUrl)).json();

    console.log(varsNameDesc);

    varsNameDesc.forEach(varNameDesc => {
        let id = varNameDesc.id;

        // creating select options
        let option = document.createElement("option");
        option.value = id;
        option.innerText = varNameDesc.name;
        select.appendChild(option);

        // init data arrays
        dynamicData[id] = [];
        staticData[id] = [];

        // save variavle descriptions
        varsDesc[id] = varNameDesc.description;
    });

    // creating charts
    dynamicChart = createChartForCanvas("dynamic-chart");
    staticChart = createChartForCanvas("static-chart");

    select.selectedIndex = 0;
    onSelectChange();
}

// creates Chart object for specified canvas id
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

// Switches graph data and description
function onSelectChange() {
    let id = select.value;
    
    varDescText.textContent = varsDesc[id];

    dynamicChart.data.datasets[0].data = dynamicData[id];
    dynamicChart.update();

    staticChart.data.datasets[0].data = staticData[id];
    staticChart.update();
}

// fetches data for the given timespan, loads in into correct data array
async function onLoadStaticChartButton() {
    let id = select.value;
    let time = staticGraphTimespan.value;

    let url = staticReportFetchUrl;
    url = url.replace(":id", id).replace(":time", time);

    let staticChartReport = await (await fetch(url)).json();

    let chartData = staticData[id];
    chartData.length = 0;

    for (const record of staticChartReport) {
        chartData.push({
            t: moment(record.time),
            y: record.value
        });
    }

    staticChart.update();
}

// generated and downloads a csv file with current static data
function onSaveStaticFileBtn() {
    let id = select.value;

    let content = "Time,Value\n";

    staticData[id].forEach(point => {
        content = content + `"${point.t.format("DD/MM/YYYY HH:mm:ss")}","${point.y}"\n`;
    });

    let fileName = `${id} - ${select.options[select.selectedIndex].text}.csv`;

    let blob = new Blob([content], {type: "text/csv"});

    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');

    a.setAttribute('href', url);
    a.setAttribute('download', fileName);

    a.click();
}

// Converts report to valid graph data, updates dynamic graph
function handleSocketReport(report) {
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
}