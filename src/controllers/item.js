const config = require("../config/config.js");
const client  = require("../server/server.js");

//const db = require("../models");
//const User = require("../models/user.js");
//const Role = require("../models/role.js");
//const ToDo = require("../models/todo.js");
//const Op = db.Sequelize.Op;

const auth = require("../controllers/auth.js");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { request } = require("express");

exports.home = async(req, res) => {
  var query = `
    SELECT * FROM users WHERE id='${auth.getUserId()}';
    `
    client.getClient().query(query, (err, response) => {
      if (err) {
          console.error("error", err);
          return;
      }

      if(response.rows[0] == undefined){
        res.render("login");
      } else if(response.rows[0].role === 2){
        // admin view
        this.getAdminView(req, res);
      } else if(response.rows[0].role === 1){
        // tutor view
        this.getTutorView(req, res);
      } else {
        // user view
        this.getUserView(req, res);
      }
    });

}

exports.getAdminView = async(req, res) => {
  var arguments = {
    userId: auth.getUserId()
  }

  // grab all current items
  var query = `
  SELECT * FROM items ORDER BY title asc;
  `
  await client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    arguments.items = response.rows;
  
  // grab all users
  var query = `
  SELECT * FROM users ORDER BY id asc;
  `
  client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    arguments.users = response.rows;

  // grab currently logged user info
  var query = `
  SELECT * FROM users WHERE id=${auth.getUserId()} ORDER BY id asc;
  `
  client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    arguments.user_fname = response.rows[0].fname;
    arguments.user_lname = response.rows[0].lname;


  // grab all current users
  var query = `
  SELECT * FROM users WHERE id!=${auth.getUserId()} and role=0 ORDER BY id asc;
  `
  client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    arguments.current_users = response.rows;

  // grab all current tutors
  var query = `
  SELECT * FROM users WHERE id!=${auth.getUserId()} and role=1 ORDER BY id asc;
  `
  client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    arguments.current_tutors = response.rows;
  
  // grab all current admins
  var query = `
  SELECT * FROM users WHERE id!=${auth.getUserId()} and role=2 ORDER BY id asc;
  `
  client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    arguments.current_admins = response.rows;

  // grab all current assignments
  var query = `
  SELECT tutor.id AS tutor_id, 
         tutor.fname AS tutor_fname,
         tutor.lname AS tutor_lname,
         tuttee.id AS tuttee_id, 
         tuttee.fname AS tuttee_fname,
         tuttee.lname AS tuttee_lname
         FROM assignments 
         INNER JOIN users tutor ON tutor_id=tutor.id 
         INNER JOIN users tuttee ON tuttee_id=tuttee.id
         ORDER BY tutor.id asc;
  `
  client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    arguments.assignments = response.rows;
    res.render("admin_home", arguments);
  });
  });
  });
  });
  });
  });
  });

  
}

exports.getTutorView = async(req, res) => {
    var args = {}
    var query = `
    SELECT i.id AS item_id,
           tuttee_id,
           tuttor_id,
           title,
           description,
           iscomplete,
           u.fname,
           lname
           FROM items i
           INNER JOIN users u
           ON i.tuttee_id=u.id
           WHERE i.tuttor_id=${auth.getUserId()} 
           ORDER BY title asc;
    `
    client.getClient().query(query, (err, response) => {
      if (err || response == undefined) {
          console.error("error", err);
          return;
      }
      args.items=response.rows;

      var query = `
        SELECT * FROM users WHERE id=${auth.getUserId()} ORDER BY id asc;
      `
      client.getClient().query(query, (err, response) => {
        if (err || response == undefined) {
            console.error("error", err);
            return;
        }
        args.user_fname = response.rows[0].fname;
        args.user_lname = response.rows[0].lname;

      var query = `
         SELECT tutor.id AS tutor_id, 
         tutor.fname AS tutor_fname,
         tutor.lname AS tutor_lname,
         tuttee.id AS tuttee_id, 
         tuttee.email AS tuttee_email,
         tuttee.fname AS tuttee_fname,
         tuttee.lname AS tuttee_lname
         FROM assignments 
         INNER JOIN users tutor ON tutor_id=tutor.id 
         INNER JOIN users tuttee ON tuttee_id=tuttee.id
         WHERE tutor_id=${auth.getUserId()}
         ORDER BY tutor.id asc;
         `

      client.getClient().query(query, (err, response) => {
      if (err || response == undefined) {
          console.error("error", err);
          return;
      }
      args.assignments=response.rows;
      
      res.render("tutor_home", args);
    });
    });
    });
}

exports.getUserView = async(req, res) => {
  var args = {}
  var query = `
  SELECT 
         i.id AS item_id,
         tuttee_id,
         tuttor_id,
         title,
         description,
         iscomplete,
         u.fname,
         lname

         FROM items i
         INNER JOIN users u
         ON i.tuttor_id=u.id
         WHERE i.tuttee_id=${auth.getUserId()}  AND i.iscomplete=false
         ORDER BY title asc;
  `
  client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    args.items=response.rows;

    var query = `
      SELECT * FROM users WHERE id=${auth.getUserId()} ORDER BY id asc;
    `
    client.getClient().query(query, (err, response) => {
      if (err || response == undefined) {
          console.error("error", err);
          return;
      }
      args.user_fname = response.rows[0].fname;
      args.user_lname = response.rows[0].lname;

    var query = `
       SELECT 
       tutor.id AS tutor_id, 
       tutor.email AS tutor_email,
       tutor.fname AS tutor_fname,
       tutor.lname AS tutor_lname,

       tuttee.id AS tuttee_id, 
       tuttee.email AS tuttee_email,
       tuttee.fname AS tuttee_fname,
       tuttee.lname AS tuttee_lname

       FROM assignments 
       INNER JOIN users tutor ON tutor_id=tutor.id 
       INNER JOIN users tuttee ON tuttee_id=tuttee.id
       WHERE tuttee_id=${auth.getUserId()}
       ORDER BY tutor.id asc;
       `

    client.getClient().query(query, (err, response) => {
    if (err || response == undefined) {
        console.error("error", err);
        return;
    }
    args.assignments=response.rows;
    
    res.render("user_home", args);
  });
  });
  });
}

exports.createToDoItem = async(req, res) => {
  console.log("adding to do item...", req.body)
  var query = `
    INSERT INTO items(tuttee_id, title, description, iscomplete)
    VALUES (${auth.getUserId()}, '${req.body.title}', '${req.body.description}', false);
    `

    client.getClient().query(query, (err, res) => {
      if (err) {
          console.error("error", err);
          return;
      }
    });

    this.home(req, res);
};

exports.createAdminToDoItem = async(req, res) => {
  console.log("adding to do item...", req.body)
  var query = `
    INSERT INTO items(tuttee_id, tuttor_id, title, description, iscomplete)
    VALUES (${req.body.tuttee_id}, ${req.body.tutor_id}, '${req.body.title}', '${req.body.description}', false);
    `

    client.getClient().query(query, (err, res) => {
      if (err) {
          console.error("error", err);
          return;
      }
    });

    this.home(req, res);
};

exports.createTutorToDoItem = async(req, res) => {
  console.log("adding to do item...", req.body)
  var query = `
    INSERT INTO items(tuttee_id, tuttor_id, title, description, iscomplete)
    VALUES (${req.body.tuttee_id}, ${auth.getUserId()}, '${req.body.title}', '${req.body.description}', false);
    `

    client.getClient().query(query, (err, res) => {
      if (err) {
          console.error("error", err);
          return;
      }
    });

    this.home(req, res);
};

exports.markAsComplete = async(req, res) => {
  console.log("marking item as complete...", req.body)

  var query = `
    UPDATE items SET iscomplete=true WHERE id=${req.body.task_id};
    `

    client.getClient().query(query, (err, response) => {
      if (err) {
          console.error("error", err);
          return;
      }
      console.log("marking item as complete...", req.response)

      this.home(req, res);
    });
};

exports.removeTask = async(req, res) => {
  console.log("removing task...", req.body)

  var query = `
    DELETE FROM items WHERE id=${req.body.task_id};
    `

    client.getClient().query(query, (err, response) => {
      if (err) {
          console.error("error", err);
          return;
      }

      this.home(req, res);
    });
};
