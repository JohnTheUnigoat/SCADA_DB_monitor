var id_chartDict = {};

var id_label = {44: "one", 45: "two", 46: "three"}
function createCharts()// for all canvases
{
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
                    }],
                }
            }
        });

        newChart.data.datasets[0].label = id_label[canvas.id];
        id_chartDict[canvas.id] = newChart;
    }
}
createCharts();

function addValue(message)
{
    let id = message.id;
    let xval = moment(message.time);
    let yval = message.value;

    id_chartDict[id].data.datasets[0].data.push({t: xval, y: yval});

    id_chartDict[id].update();
}

function switchToCanvas(option)
{
    hideAllCanvases();

    let toShow = document.getElementById(option.value);
    toShow.style.display = 'block';
}

function hideAllCanvases()
{
    let canvases = Array.prototype.slice.call(document.getElementsByTagName("canvas"));// turn to js array
    canvases.forEach(element => element.style.display = 'none');
}
hideAllCanvases();
