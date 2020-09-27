const bcrypt = require("bcryptjs");
//const User = require("../models/user");
const mysql = require("../models/mysql");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	mysql.findOne('users', {id:id}, (err, user) => {
		done(null, user);
	});
});

passport.use(
	new LocalStrategy({
		usernameField: "email"
	}, (email, password, done) => {
		mysql.findOne('users', {email: email}, (err, user) => {
			if(err) {
				return done(null, false, {message:err});
			}

			// get existing user
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if(err) throw err;
				if(isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message:"Incorrect password"});
				}
			})
		});
	}));
module.exports = passport;