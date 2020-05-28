var id_chartDict = {};

var options = {
    animation: false,
}

var data = {
    datasets: [{
        
        lineTension: 0,
        showLine: true,
        spanGaps: true,

        label: '',
        //backgroundColor: 'rgb(80, 80, 300)',
        borderColor: 'rgb(255, 0, 0)',
        data: []
    }]
}

var ctx = document.getElementById('44').getContext('2d');
var Chart1 = new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: options
});
Chart1.data.datasets[0].label = "asdf1"

id_chartDict[44] = Chart1;// id: 44

//place for more Chart objects

function addValue(message)
{
    let id = message.id;
    let xval = Date.parse(message.time);
    let yval = message.value;
    id_chartDict[id].data.datasets[0].data.push({x: xval, y: yval});

    id_chartDict[id].update();
}