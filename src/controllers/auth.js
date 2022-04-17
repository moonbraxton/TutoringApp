const client = require("../server/server.js") 
const controller = require("../controllers/item.js");
const config = require("../config/config.js");

//const db = require("../models");
//const User = require("../models/user.js");
//const Role = require("../models/role.js");
//const ToDo = require("../models/todo.js");
//const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var userId = -1;
exports.setUserId = (id) => {
  userId = id
};

exports.getUserId = function(){
  return userId
};

exports.signup = async(req, res) => {
  console.log("Creating user...", req);
  var query = `
  SELECT * FROM users WHERE username='${req.body.username}' OR email='${req.body.email}';
  `
  await client.getClient().query(query, (err, response) => {
    if(response.rows.length > 0)
      res.status(401).send("Email or username already in use.");

  });

  var query = `
  INSERT INTO users(username, email, password)
  VALUES ('${req.body.username}', '${req.body.email}', '${req.body.password}')
  RETURNING id;
  `

  await client.getClient().query(query, (err, response) => {
    if (err) {
        console.error("error", err);
        return;
    }
    this.setUserId(response.rows[0].id);
    controller.home(req, res);
  });
};

exports.adminSignup = async(req, res) => {
  console.log("Creating user...", req.body);
  var query = `
  SELECT * FROM users WHERE username='${req.body.username}' OR email='${req.body.email}';
  `
  await client.getClient().query(query, (err, response) => {
    if(response.rows.length > 0)
      res.status(401).send("Email or username already in use.");

  });

  var query = `
  INSERT INTO users(username, email, fname, lname, role, password)
  VALUES ('${req.body.username}', '${req.body.email}', '${req.body.fname}', '${req.body.lname}', ${req.body.role}, '${req.body.password}');
  `

  await client.getClient().query(query, (err, response) => {
    if (err) {
        console.error("error", err);
        return;
    }
    controller.home(req, res);
  });
};


exports.signin = async (req, res) => {
  console.log("Logging in user...", req.body);

  var query = `
    SELECT * FROM users WHERE username='${req.body.username}';
    `
  await client.getClient().query(query, (err, response) => {
    if (err) {
        console.error("error", err);
        return;
    }
    
    if(response.rows[0] == undefined){
      res.status(401).send("Incorrect Password.");
      return;

    }
      
    if(req.body.password === response.rows[0].password){
      this.setUserId(response.rows[0].id);
      controller.home(req, res);
    } else {
      res.status(401).send("Incorrect Password.");
    }
  });
};

exports.createAssignment = async(req, res) => {
  console.log("creating tutor tuttee assignment...", req.body)

  var query = `
    INSERT INTO assignments(tutor_id, tuttee_id) VALUES (${req.body.tutor_id}, ${req.body.tuttee_id}) ON CONFLICT DO NOTHING;
    `

    client.getClient().query(query, (err, response) => {
      if (err) {
          console.error("error", err);
          return;
      }

      controller.home(req, res);
    });
};

exports.removeAssignment = async(req, res) => {
  console.log("removing assignment...", req.body)

  var query = `
    DELETE FROM assignments WHERE tutor_id=${req.body.tutor_id} AND tuttee_id=${req.body.tuttee_id};
  `

    client.getClient().query(query, (err, response) => {
      if (err) {
          console.error("error", err);
          return;
      }

      controller.home(req, res);
    });
};

exports.removeUser = async(req, res) => {
  console.log("removing user...", req.body)

  var query = `
    DELETE FROM users WHERE id=${req.body.user_id};
  `

    client.getClient().query(query, (err, response) => {
      if (err) {
          console.error("error", err);
          return;
      }

      controller.home(req, res);
    });
};