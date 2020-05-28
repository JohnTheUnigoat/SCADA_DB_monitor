var id_chartDict = {};

var id_label = {44: "one", 45: "two", 46: "three"}
function createCharts()// for all canvases
{
    let canvases = Array.prototype.slice.call(document.getElementsByTagName("canvas"));// turn to js array
    canvases.forEach(canvas => {
        console.log("I am alive!");
        let ctx = document.getElementById(canvas.id).getContext('2d');
        let newChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    lineTension: 0,
                    showLine: true,
                    spanGaps: true,
                    label: '',
                    borderColor: 'rgb(255, 0, 0)',
                }]
            },
            options: {
                animation: false,
                scales: {
                    xAxes: [{
                        type: 'linear',
                        display: true,
                    }],
                    yAxes: [{
                        display: true,
                    }]
                }
            }
        });

        newChart.data.datasets[0].label = id_label[canvas.id];
        console.log("I am alive!!!!!!!!!!!!!!!");
        id_chartDict[canvas.id] = newChart;
    });
}
createCharts();

function addValue(message)
{
    let id = message.id;
    let date = new Date(message.time);
    // let time = date.customFormat("#hhhh#:#mm#:#ss#");
    // console.log(time);
    let xval = date;
    let yval = message.value;

    id_chartDict[id].data.datasets[0].data.push({x: xval, y: yval});

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
