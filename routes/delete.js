const express = require("express");
const router = express.Router();
const passport = require("passport");
const mysql = require("../models/mysql");

// get details of object to delete
router.get('/delete', (req, res, next) => {
	// get current user
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
		switch(req.query.object) {
			case 'user':
				// only admin users can delete a user
				if(user.admin) {

					mysql.findOne("users", {id:req.query.id}, (err, u) => {
						res.status(200).json({ 
							confirm: {type: 'label', val: "Are you sure you want to delete the account for " + u.firstname + " " + u.lastname + "? This action cannot be undone"},
							id: {type: 'hidden', val: u.id}
						});		
					});
					
				}					
			break;

			case 'school':
				// only admin users can delete a school
				if(user.admin) {

					mysql.findOne("schools", {id:req.query.id}, (err, s) => {
						res.status(200).json({ 
							confirm: {type: 'label', val: "Are you sure you want to delete the account for " + s.name + "? This action cannot be undone"},
							id: {type: 'hidden', val: s.id}
						});		
					});
					
				}					
			break;

			case 'classbot':
				// only admin users can delete a classbot
				if(user.admin) {

					mysql.findOne("classbots", {id:req.query.id}, (err, cb) => {
						res.status(200).json({ 
							confirm: {type: 'label', val: "Are you sure you want to delete the classbot " + cb.name + "? This action cannot be undone"},
							id: {type: 'hidden', val: cb.id}
						});		
					});
					
				}					
			break;
		}
	});	
});

// delete objcet
router.post('/delete', (req, res, next) => {
	// get current user
	mysql.findOne("users", {id:req.session.passport.user}, (err, user) => {
		switch(req.body.object) {
			case 'user':
				// only admin users can delete a user
				if(user.admin) {
					mysql.delete("users", {id:{operator:"=", value: req.body.id}}, (err, result) => {
						res.status(200).send("deleted");		
					});
				}					
			break;

			case 'school':
				// only admin users can delete a school
				if(user.admin) {
					mysql.delete("schools", {id:{operator:"=", value: req.body.id}}, (err, result) => {
						res.status(200).send("deleted");		
					});
				}					
			break;

			case 'classbot':
				// only admin users can delete a classbot
				if(user.admin) {
					mysql.delete("classbots", {id:{operator:"=", value: req.body.id}}, (err, result) => {
						res.status(200).send("deleted");		
					});
				}					
			break;
		}
	});	
});

module.exports = router;
