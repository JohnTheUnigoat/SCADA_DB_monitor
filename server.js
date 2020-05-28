const mysql = require("mysql");

const express = require('express');
const socket = require('socket.io')

const path = require('path');

const app = express();

const server = app.listen(3000);

const io = socket(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/test.html'));
});

var conn = mysql.createConnection({
    host: "localhost",
    database: "simplescadademo",
    user: "root",
    password: "",
    dateStrings: true
});


var scadaVarIds = [44, 45, 46];
var initVarValuesCount = 30;


var initVarValuesSql = (function() {
    let res = ""

    scadaVarIds.forEach(id => {
        res += `(
            SELECT *
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
