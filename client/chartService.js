var id_chartDict = {};

var ctx = document.getElementById('Chart1').getContext('2d');
        var Chart1 = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    
                    lineTension: 0,
                    showLine: true,
                    spanGaps: true,

                    label: 'asdf',
                    backgroundColor: 'rgb(80, 80, 300)',
                    borderColor: 'rgb(255, 0, 0)',
                    data: []
                }]
            },
            options: {}
        });
id_chartDict[44] = Chart1;// id: 44

//place for more Chart objects

function addValue(message)
{
    let id = message.id;
    let xval = message.value;
    let yval = message.time.getTime();
    id_chartDict[id].data.datasets[0].push({x: xval, y: yval});

    id_chartDict[id].update();
}