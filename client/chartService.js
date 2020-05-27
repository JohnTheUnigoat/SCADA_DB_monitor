var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    
                    lineTension: 0,
                    showLine: true,
                    spanGaps: true,

                    label: 'Temperatures',
                    backgroundColor: 'rgb(80, 80, 300)',
                    borderColor: 'rgb(255, 0, 0)',
                    data: []
                }]
            },
            options: {}
        });