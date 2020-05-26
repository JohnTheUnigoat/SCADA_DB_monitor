var mysql = require("mysql");

var conn = mysql.createConnection({
    host: "localhost",
    database: "simplescadademo",
    user: "root",
    password: ""
});


var scadaVarIds = [44, 45, 46];
var initValuesCount = 5;

var initVarValuesSql = (() => {
    let res = ""

    scadaVarIds.forEach(id => {
        res += `
            (SELECT ID, Timestamp, Value
            FROM trends_data
            WHERE ID = ${id}
            ORDER BY Timestamp DESC
            LIMIT ${initValuesCount})
            UNION`;
    });

    res = res.slice(0, res.lastIndexOf("UNION"));
    res = `SELECT * FROM (${res}) AS u ORDER BY Timestamp`;

    return res;
})();
