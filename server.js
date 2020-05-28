var mysql = require("mysql");

var conn = mysql.createConnection({
    host: "localhost",
    database: "simplescadademo",
    user: "root",
    password: "",
    dateStrings: true
});


var scadaVarIds = [44, 45, 46];
var initVarValuesCount = 5;


var initVarValuesSql = (function() {
    let res = ""

    scadaVarIds.forEach(id => {
        res += `(SELECT * FROM trends_data WHERE ID = ${id} ORDER BY Timestamp DESC LIMIT ${initVarValuesCount})
        UNION`;
    });

    res = res.slice(0, res.lastIndexOf("UNION"));
    res = `SELECT * FROM (${res}) AS u ORDER BY Timestamp ASC`;

    return res;
})();


var scadaVarValues = (function() {
    let res = {};

    scadaVarIds.forEach(id => {
        res[id] = {
            lastTimestamp: new Date(0),
            records: []
        };
    });

    return res;
})();


// Load initial variable values, save latest timestamps
conn.query(initVarValuesSql, (err, res) => {
    if (err) throw err;

    saveData(res);

    setInterval(() => {
        loadNewData();
    }, 1000);
});


function loadNewData() {
    let condition = "";

    scadaVarIds.forEach(id => {
        let varData = scadaVarValues[id];
        condition += `(ID = ${id} AND Timestamp > '${varData.lastTimestamp}') OR `;
    });

    condition = condition.slice(0, condition.lastIndexOf(' OR'));

    let sql = `SELECT ID, Timestamp, Value FROM trends_data WHERE ${condition}`;

    conn.query(sql, (err, res) => {
        if (err) throw err;

        console.log(`${res.length} records loaded`);

        saveData(res);
    });
}

function saveData(queryRes) {
    if (queryRes.length == 0) return;

    queryRes.forEach(dbRecord => {
        scadaVarValues[dbRecord.ID].records.push({
            time: dbRecord.Timestamp,
            value: dbRecord.Value
        });
    });

    for (const id in scadaVarValues) {
        let varData = scadaVarValues[id];
        varData.lastTimestamp = varData.records[varData.records.length - 1].time;

        console.log(id);
        varData.records.forEach(record => {
            console.log(record);
        });
    }
}
