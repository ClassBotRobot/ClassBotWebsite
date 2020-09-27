const express = require("express");
const router = express.Router();
const fs = require('fs');
const passport = require("passport");
const mysql = require("../models/mysql");

// home page
router.get('/', function (req, res) {
	var u = -1;
	try {
			u = req.session.passport.user;
	} catch(e){
	};

	if(u > 0) {
			mysql.findOne("users", {id: u}, (err, user) => {
				if(!user.schoolid) { user.schoolid=-1};
				mysql.db.query(`SELECT cb.*, s.name AS schoolname, s.logo
					FROM classbots AS cb
					JOIN schools AS s on cb.schoolid=s.id
					WHERE cb.schoolid=?`, user.schoolid, (err, classbots) => {
					if(err) throw err;
					var html = '';
					res.render('home', { title: 'Welcome to ClassBot Online', main: html, user:user, classbots:classbots });
				});
		});	
	} else {
		var html = '<div class="center"><img class="img-fluid" src="/img/logo.png" alt="ClassBot"></div>';
		res.render('index', { title: 'Welcome to ClassBot Online', main: html });
	}
});

// view classbot
router.get('/classbot', function(req, res) {
	if(req.query.id) {
		mysql.db.query(`SELECT cb.*, s.logo FROM classbots AS cb
			JOIN schools AS s ON cb.schoolid=s.id
			WHERE cb.id=?`, req.query.id, (err, cb) => {
			res.render('classbot', {cb: cb[0]});
		});
	} else {
		res.render('error', {message: 'No classbot specified'});
	}
});

// manage users (admin only)
router.get('/users', function(req, res) {
	mysql.findOne("users", {id: req.session.passport.user}, (err, user) => {
		if(user.admin) {
			mysql.db.query(`SELECT u.*, s.name AS schoolname FROM users AS u
				LEFT JOIN schools AS s ON u.schoolid=s.id
				ORDER BY schoolname, lastname, firstname`, (err, users) => {
					console.log(err, users);
				res.render('users', { title: 'All users', users: users});		
			});
		}
	});
});

// manage schools (admin only)
router.get('/schools', function(req, res) {
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
		if(user.admin) {
			mysql.find("schools", {}, (err, schools) => {
				res.render('schools', { title: 'All schools', schools: schools});		
			});
		}
	});
});

// manage classbots (admin only)
router.get('/classbots', function(req, res) {
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
		if(user.admin) {
			mysql.db.query(`SELECT cb.*, s.name AS schoolname, s.logo 
				FROM classbots AS cb
				JOIN schools AS s ON cb.schoolid=s.id`, {}, (err, classbots) => {
				res.render('classbots', { title: 'All classbots', classbots: classbots});		
			});
		}
	});
});

// manage your account
router.get('/account', function (req, res) {
  try {
  	var user = req.session.passport.user;
  	mysql.db.query(`SELECT 
		(SELECT COUNT(id) FROM users) as users,
		(SELECT COUNT(id) FROM schools) as schools,
		(SELECT COUNT(id) FROM classbots) as classbots
		`, (err, stats) => {
	  	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
	  	var error = req.query.error;
	  	var success = req.query.success?"User details updated":undefined;
			res.render('user', { title: 'Manage your account', user: user, error:error, success:success, stats: stats[0] })
		});
	});
  } catch (e) {
  	res.render('index', { title: 'Manage your account', main: 'You must be logged in to manage your account' })
  }  
});

// about ClassBot
router.get('/about', function (req, res) {
  var html = fs.readFileSync(__dirname + '/../public/about.html');
  
  res.render('index', { title: 'About ClassBot', main: html });
});

module.exports = router;