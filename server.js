var mysql = require("mysql");

var conn = mysql.createConnection({
    host: "localhost",
    database: "simplescadademo",
    user: "root",
    password: ""
});


var scadaVarIds = [44, 45, 46];
var initVarValuesCount = 5;

var initVarValuesSql = (() => {
    let res = ""

    scadaVarIds.forEach(id => {
        res += `
            (SELECT ID, Timestamp, Value
            FROM trends_data
            WHERE ID = ${id}
            ORDER BY Timestamp DESC
            LIMIT ${initVarValuesCount})
            UNION`;
    });

    res = res.slice(0, res.lastIndexOf("UNION"));
    res = `SELECT * FROM (${res}) AS u ORDER BY Timestamp`;

    return res;
})();

var scadaVarValues = [];

var timeLimit = new Date(0);

// Load initial variable values, save first time limit
conn.query(initVarValuesSql, (err, res) => {
    if (err) throw err;

    res.forEach(record => {
        scadaVarValues.push({id: record.ID, time: record.Timestamp, value: record.Value});
    });

    timeLimit = new Date(scadaVarValues[0].time.getTime() + 1000);
    console.log(scadaVarValues);
    console.log(timeLimit);
});
