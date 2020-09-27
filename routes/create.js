const express = require("express");
const router = express.Router();
const passport = require("passport");
const mysql = require("../models/mysql");

// get new object ready to create
router.get('/create', (req, res, next) => {
	// get current user
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
		switch(req.query.object) {
			case 'user':
				// only admin users can add a new user
				if(user.admin) {
						var titles = ["", "Mr", "Mrs", "Ms", "Prof", "Dr", "Rev"];
						var options = [];
						for(var i = 0; i < titles.length; i++) {
							options.push({id:titles[i], value: titles[i]});
						}
						mysql.db.query("SELECT id, name AS value FROM schools", (err, schools) => {
							res.status(200).json({ 
								title: {type:'select', options: options},
								firstname: {},
								lastname: {},
								email: {},
								schoolid: {name: 'School', type: 'select', options: schools},
								admin: {type: 'checkbox'},
								teacher: {type: 'checkbox'},
								manager: {type: 'checkbox'},
								password: {type: 'password'},
								confirm: {type: 'password', desc: 'Please enter the same password again'}
							});	
						});
					}					
			break;

			case 'school':
				// only admin users can add a new school
				if(user.admin) {
					
						res.status(200).json({ 
							name: {},
							website: {},
							logo: {}
						});	
					}					
			break;

			case 'classbot':
			// only admin users can add a new classbot
			if(user.admin) {
				mysql.db.query("SELECT id, name AS value FROM schools", (err, schools) => {
					res.status(200).json({
						name: {},
						schoolid: {name: 'School', type: 'select', options: schools},
						password: {},
						macaddress: {}
					});
				});
			}
			break;
		}
	});	
});

// create a new object
router.post('/create', (req, res, next) => {
	// get current user
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
		switch(req.body.object) {
			case 'user':
				// only admin users can add a new user
				if(user.admin) {
					if(req.body.data.password == req.body.data.confirm) {
						var u = {
							title: req.body.data.title,
							firstname: req.body.data.firstname,
							lastname: req.body.data.lastname,
							email: req.body.data.email,
							admin: req.body.data.admin?true:false,
							manager: req.body.data.manager?true:false,
							teacher: req.body.data.teacher?true:false,
							schoolid: parseInt(req.body.data.schoolid),
							password: mysql.getHash(req.body.data.password)
						};
						if(u.firstname.length > 0 && u.lastname.length > 0 && u.email.length > 0) {
							if(req.body.data.password.length > 4) {
								mysql.findOne("users", {email:u.email}, (err, existing) => {
									if(existing) {
										res.status(401).send("User already exists with that email address");
									} else {
										mysql.json.insert("users", u, (err) => {
											res.status(200).send("Saved");
										});		
									}
								})
								
							} else {
								res.status(401).send("Password must be 5 or more characters");
							}
						} else {
							res.status(401).send('Firstname, lastname and email must be complete');
						}
					} else {
						res.status(401).send("Passwords do not match");
					}
				}
			break;

			case 'school':
				// only admin users can add a new school
				if(user.admin) {
					var s = {
						name: req.body.data.name,
						website: req.body.data.website,
						logo: req.body.data.logo
					};
					if(s.name.length > 0) {
						mysql.json.insert("schools", s, (err) => {
							res.status(200).send("Saved");
						});
					} else {
						res.status(401).send('School name is missing');
					}
				} else {
					res.status(401).send("Access denied");
				}
			break;

			case 'classbot':
				// only admin users can add a new classbot
				if(user.admin) {
					var cb = {
						name: req.body.data.name,
						schoolid: req.body.data.schoolid,
						password: req.body.data.password,
						macaddress: req.body.data.macaddress
					};
					if(cb.name.length > 0) {
						mysql.json.insert("classbots", cb, (err) => {
							res.status(200).send("Saved");
						});
					} else {
						res.status(401).send('ClassBot name is missing');
					}
				} else {
					res.status(401).send("Access denied");
				}
			break;

		}
	});	
});

module.exports = router;
