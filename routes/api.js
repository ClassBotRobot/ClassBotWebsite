// todo: https://medium.com/swlh/set-up-an-express-js-app-with-passport-js-and-mongodb-for-password-authentication-6ea05d95335c
const express = require("express");
const router = express.Router();
const passport = require("passport");
//const User = require("../models/user");
const mysql = require('../models/mysql');

router.post('/login', (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
  	if(err) {
  		return res.status(400).json({errors:err});
  	}
  	if(!user) {
  		return res.status(400).json({errors:"No user found"});
  	}
  	req.login(user, (err) => {
  		if (err) {
  			return res.status(400).json({errors:err});
  		} 
  		return res.status(200).json({success: `logged in ${user.id}`});
  	})
  })(req, res, next);
});

// reset test account password
router.get('/backdoor', (req, res, next) => {
	mysql.update('users', {
			password: mysql.getHash("ClassBotAdmin1")
		}, {'email': {operator:'=', value:'admin'}}, (err, user) => {
		return res.status(200).send("Reset");
	});
});

// recreate db tables (admin only - useful for upgrading)
router.get('/reset', (req, res, next) => {
	mysql.findOne('users', {id:req.session.passport.user}, (err, user) => {
		if(user.admin) {
			mysql.db.query("DROP TABLE users; DROP TABLE schools; DELETE FROM sessions;",  (err, response) => {
				mysql.init();
				return res.redirect('/');
			});
		}
	})
	
});

// request admin access
router.post('/admin', (req, res, next) => {
	if(req.session.passport.user && req.body.password == "ClassBotAdmin@871!") {
		mysql.update("users", {admin: 1}, {id:{value:req.session.passport.user, operator: "="}}, (err, user) => {
			res.redirect('/account?success=1');
		});
	} else {
		res.redirect('/account?error=' + encodeURI("Access denied"));
	}
});

router.post('/user', (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if(err || !user) {
			req.session.error = info;
			res.redirect('/account?error=' + info.message);
		} else {
			user.firstname = req.body.firstname;
			user.lastname = req.body.lastname;

			// change password
			if(req.body.newpassword) {
				if(req.body.newpassword == req.body.newpassword2) {
					user.password = mysql.getHash(req.body.newpassword);
					mysql.json.update("users", user, {id: {operator: "=", value:user.id}}, (err) => {
						if(err) {
							res.redirect('/account?error=' + encodeURI("Could not change password"));
						} else {
							res.redirect('/account?success=1');	
						}
					})
				} else {
					res.redirect('/account?error=' + encodeURI("Passwords don't match"));
				}

				// don't change password - just update user details
			} else  {
				mysql.json.update("users", user, {id: {operator: "=", value:user.id}}, (err) => {
					if(!err) {
						res.redirect('/account?success=1');	
					}
				});
			}
		}
	})(req, res, next);
	//
});

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
})

router.get('/user', (req, res) => {
	if(req.session && req.session.passport && req.session.passport.user) {
		mysql.findOne("users", {id: req.session.passport.user}, (err, user) => {
			res.status(200).json({
				loggedIn: true,
				email: user.email
			});	
		});
	} else {
		res.status(200).json({
			loggedIn: false
		});		
	}
	
});

router.post("/upload", function (req, res) {
	console.log(req.file)
})
module.exports = router;
