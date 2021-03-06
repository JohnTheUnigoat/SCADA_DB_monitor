const mysql = require("mysql");

const express = require('express');
const socket = require('socket.io')

const path = require('path');

const app = express();

const server = app.listen(3000);
const io = socket(server);

app.use(express.static('client'));

var conn = mysql.createConnection({
    host: "localhost",
    database: "simplescadademo",
    user: "root",
    password: "",
    dateStrings: true
});

app.get('/StaticGraph/:varId/:forTime', function (req, response) {// get request for static chart
    var id = req.params.varId;
    var timespan = req.params.forTime;

    let condition = `ID=${id} AND Timestamp >= NOW() - INTERVAL ${timespan} MINUTE`;
    let sql = `SELECT Timestamp AS time, Value AS value FROM trends_data WHERE ${condition}`;

    conn.query(sql, (err, res) => {
        if (err) throw err;

        console.log(`${res.length} records loaded`);
        console.log(res);

        response.json(res);
    });
});

var scadaVarIds = [44, 45, 46];


var varDescriptionsSql = (function () {
    let idsStr = "";
    scadaVarIds.forEach(id => {
        idsStr += `${id}, `;
    });

    idsStr = idsStr.slice(0, idsStr.lastIndexOf(','));

    return `SELECT ID id, Name name, Description description FROM variables_data WHERE ID IN (${idsStr})`;
})();

app.get('/variableData', (request, response) => {
    conn.query(varDescriptionsSql, (err, res) => {
        if (err) throw err;

        response.json(res);
    });
});

var initVarValuesCount = 30;

var initVarValuesSql = (function() {
    let res = ""

    scadaVarIds.forEach(id => {
        res += `(
            SELECT ID, Timestamp, Value
            FROM trends_data
            WHERE ID = ${id} ORDER BY Timestamp DESC LIMIT ${initVarValuesCount}
            ) UNION `;
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


var currentReportTime = new Date(0);

// Load initial variable values, save latest timestamps
conn.query(initVarValuesSql, (err, res) => {
    if (err) throw err;

    currentReportTime = new Date(res[0].Timestamp);
    currentReportTime.setSeconds(currentReportTime.getSeconds() + 5);

    saveData(res);

    setInterval(() => {
        loadNewData();
        sendReport();
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
    }
}

function sendReport() {
    currentReportTime.setSeconds(currentReportTime.getSeconds() + 1);

    let report = {};
    scadaVarIds.forEach(id => {
        let varRecords = scadaVarValues[id].records;

        if (varRecords.length == 0)
            return;

        let varReport = [];

        let i = 0;

        for (i = 0; i < varRecords.length; i++) {
            let record = varRecords[i];

            if (new Date(record.time) > currentReportTime)
                break;

            varReport.push(record);
        }

        scadaVarValues[id].records = varRecords.slice(i);

        console.log(`${id}: ${varReport.length} records sent\n`);

        report[id] = varReport;
    });

    io.sockets.emit('report', report);
}
