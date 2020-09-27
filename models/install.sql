/* set up database */
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(10) NULL,
  firstname VARCHAR(128) NULL,
  lastname VARCHAR(128) NULL,
  email VARCHAR(128) NULL,
  password VARCHAR(60) NULL,
  admin INT(1) NULL,
  schoolid INT NULL,
  teacher INT(1) NULL,
  manager INT(1) NULL,
  PRIMARY KEY (id));
/* 
roles:
admins can do anything to any school
managers can create and remove classes in their own school
teachers can view students' data
students can connect to classbot video but can't see other students
*/

CREATE TABLE IF NOT EXISTS schools (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NULL,
  website VARCHAR(128) NULL,
  logo VARCHAR(128) NULL,
  PRIMARY KEY (id));

CREATE TABLE IF NOT EXISTS classes(
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(128) NULL,
	subject VARCHAR(128) NULL,
	schoolid INT,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS lessons(
	id INT NOT NULL AUTO_INCREMENT,
	classid INT NULL,
	started DATETIME NULL,
	createdby INT NULL,
	lastupdated DATETIME NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS classbots(
	id INT NOT NULL AUTO_INCREMENT,
	password VARCHAR(128) NULL,
	schoolid INT NULL,
	name VARCHAR(128) NULL,
	macaddress VARCHAR(20) NULL,
	lastonline DATETIME NULL,
	ipaddress VARCHAR(128) NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS classmembers(
	id INT NOT NULL AUTO_INCREMENT,
	userid INT NULL,
	classid INT(1) NULL,
	teacher INT(1) NULL,
	admin INT(1) NULL,
	PRIMARY KEY (id)
);