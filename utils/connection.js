const mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'practice'
});

connection.connect(function(err){
    if(err){
        console.log("Error");
    }else{
        console.log("connected");
    }
});

module.exports = connection;