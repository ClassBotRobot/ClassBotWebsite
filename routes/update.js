const express = require("express");
const router = express.Router();
const mysql = require("../models/mysql");
const passport = require("passport");

// get object ready to edit it
router.get('/edit', (req, res, next) => {
	// get current user
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
		switch(req.query.object) {
			case 'user':
				// only admin users can get other user's data
				if(user.admin) {
					mysql.findOne("users", {id:req.query.id}, (err, u) => {
						mysql.db.query("SELECT id, name AS value FROM schools", (err, schools) => {
							var titles = ["", "Mr", "Mrs", "Ms", "Prof", "Dr", "Rev"];
							var options = [];
							for(var i = 0; i < titles.length; i++) {
								options.push({id:titles[i], value: titles[i]});
							}
							res.status(200).json({ 
								id: {val: u.id, type: 'hidden'},
								title: {val: u.title, type: 'select', options: options},
								firstname: {val: u.firstname},
								lastname: {val: u.lastname},
								email: {val: u.email},
								school: {val: u.schoolid, type: 'select', options: schools},
								admin: {val: u.admin, type: 'checkbox'},
								manager: {val: u.manager, type: 'checkbox'},
								teacher: {val: u.teacher, type: 'checkbox'},
								password: {type: 'password'},
								confirm: {type: 'password', desc: 'Please enter the same password again'}
							});		
						});
						
					});
						
				}					
			break;

			case 'school':
					// only admin users can get school data
					if(user.admin) {
							mysql.findOne("schools", {id:req.query.id}, (err, s) => {
								res.status(200).json({ 
									id: {val: s.id, type: 'hidden'},
									name: {val: s.name},
									website: {val: s.website},
									logo: {val: s.logo}
								});	
							});
							
					}					
			break;
		}
	});	
});

// receive edited object data
router.post('/edit', (req, res, next) => {
	// get current user
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {		
		switch(req.body.object) {
			case 'user':
					// only admin users can edit other user's data
					if(user.admin) {
						mysql.findOne("users", {id:req.body.id}, (err, u) => {
							if(err) throw err;
							u.title = req.body.data.title;
							u.firstname = req.body.data.firstname;
							u.lastname = req.body.data.lastname;
							u.email = req.body.data.email;
							u.admin = parseInt(req.body.data.admin)?1:0;
							u.manager = parseInt(req.body.data.manager)?1:0;
							u.teacher = parseInt(req.body.data.teacher)?1:0;
							if(req.body.data.password.length > 0 && req.body.data.password == req.body.data.confirm) {
								u.password = mysql.getHash(req.body.data.password);
							}
							mysql.update("users", u, {id:{operator:"=", value:u.id}}, (err) => {
								if(err) throw err;
								res.status(200).send("OK");
							});
						});
					}					
			break;

			case 'school':
					// only admin users can edit school data
					if(user.admin) {
						mysql.findOne("schools", {id:req.body.id}, (err, s) => {
							if(err) throw err;
							s.name = req.body.data.name;
							s.website = req.body.data.website;
							s.logo = req.body.data.logo;
							mysql.update("schools", s, {id:{operator:"=", value:s.id}}, (err) => {
								if(err) throw err;
								res.status(200).send("OK");
							});
						});
						
					}					
			break;
		}
	});	
});

module.exports = router;