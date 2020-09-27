const bcrypt = require("bcryptjs");
const mysqlc = require('mysql');
const mysqljson = require('mysql-json');
const fs = require('fs');
var options = {
    host:'127.0.0.1',
    port: 3306,
    user:'classbot',
    password:'@Bv)~St=@,gB9(gV',
    database:'classbot',
    multipleStatements:true
};

var db = new mysqlc.createConnection(options);
var json = new mysqljson(options);
var mysql = {
	options:options,
	db: db,
	json: json,
	getHash:(password) => {
		var salt = bcrypt.genSaltSync(10);
		return bcrypt.hashSync(password, salt);
	},
	find: function(table, criteria, callback) {
		var sql = "SELECT * FROM " + table;
		var first = true;
		var values = [];
		for(key in criteria){
		  sql += first? ' WHERE ' : ' AND ';
		  if(first) {
		  	first = false;
		  }
		  sql += key + "=?";
		  values.push(criteria[key]);
		}
		db.query(sql, values, (err, results, fields) => {
			callback(err, results);
		});
	},
	findOne: function(table, criteria, callback) {
		mysql.find(table, criteria, (err, result) => {
			if(err) throw err;
			callback(err, result[0]);
		});
	},
	update: json.update,
	delete: json.delete
};

mysql.init = () => {
	// set up database by creating tables if they don't already exist
	var sql = fs.readFileSync(__dirname + '/install.sql', {encoding:"utf8"});
	mysql.db.query(sql, (err, response) => {
	  if(err) {
	  	console.log("Error: ", err);
	  	return;
	  }
	  // get admin user
	  mysql.findOne("users", {email: "admin"}, (err, user) => {  
	  	// create admin user if it doesn't exist
	  	if(!user) {
	  		mysql.json.insert("users", {
	  			email: "admin",
	  			password: mysql.getHash('ClassBotAdmin1'),
	  			firstname: "admin",
	  			lastname: "user",
	  			admin: true
	  		}, (err, response) => {
	  			console.log("Admin user created (admin / ClassBotAdmin1)");
	  		});
	  	} else {
	  		console.log("Admin user found in database");
	  	}
	  });	  
	});
}
mysql.init();
module.exports = mysql;