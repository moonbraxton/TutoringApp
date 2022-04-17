const express = require("express");
const cors = require("cors");
const path = require("path");
const pug = require("pug");

//const db = require("../models");
//const user = require("../models/user.js");
//const role = require("../models/role.js");
//const todo = require("../models/todo.js");

/*
db.define('user_roles', { });

role.belongsToMany(user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
user.belongsToMany(role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

todo.belongsTo(user, {
  foreignKey: "userId"
});
user.hasMany(todo, { as: "tasks" })

db.ROLES = ["user", "admin", "moderator"];
*/

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

var corsOptions = {
  origin: "http://localhost:8081"
};



var app = express();

app.use(cors( ));

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// database
const { Client } = require('pg');
const config = require("../config/config.js");

const client = new Client({
    user: config.dbSettings.user,
    host: config.dbSettings.server,
    database: config.dbSettings.database,
    password: config.dbSettings.password,
    port: 5432
});

client.connect();

function make_query(query){
  client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Table is successfully created');
  });
}

query = `
CREATE TABLE IF NOT EXISTS "roles" ("id" INTEGER , 
                                    "name" VARCHAR(255), 
                                PRIMARY KEY ("id"));
`
make_query(query);

var query = `
CREATE TABLE IF NOT EXISTS "users" ("id"   SERIAL , 
                                    "username" VARCHAR(255), 
                                    "fname" VARCHAR(255), 
                                    "lname" VARCHAR(255), 
                                    "email" VARCHAR(255) UNIQUE, 
                                    "password" VARCHAR(255), 
                                    "role" INTEGER REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE DEFAULT 0, 
                                PRIMARY KEY ("id"));
`
make_query(query);


query = `
CREATE TABLE IF NOT EXISTS "assignments" ("tutor_id" INTEGER  REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE DEFAULT -1, 
                                         "tuttee_id" INTEGER  REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, 
                                      PRIMARY KEY ("tutor_id","tuttee_id"));
`
make_query(query);

query = `
CREATE TABLE IF NOT EXISTS "items" ("id"   SERIAL , 
                                    "tuttee_id" INT,
                                    "tuttor_id" INT,
                                    "title" VARCHAR(255) NOT NULL, 
                                    "description" VARCHAR(255) NOT NULL, 
                                    "iscomplete" BOOLEAN NOT NULL, 
                                    CONSTRAINT fk_tuttee_id FOREIGN KEY(tuttee_id) REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
                                    CONSTRAINT fk_tuttor_id FOREIGN KEY(tuttor_id) REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
                                PRIMARY KEY ("id"));
`
make_query(query);

query=`
INSERT INTO roles(id, name) VALUES (0,'tuttee') ON CONFLICT DO NOTHING; 
`
make_query(query);

query=`
INSERT INTO roles(id, name) VALUES (1,'tutor') ON CONFLICT DO NOTHING; 
`
make_query(query);

query=`
INSERT INTO roles(id, name) VALUES (2,'admin') ON CONFLICT DO NOTHING; 
`
make_query(query);

query=`
INSERT INTO users(username, email, fname, lname, password, role) VALUES ('brax', 'brax@gmail.com', 'braxton', 'moon', 'pass', 2) ON CONFLICT DO NOTHING;
`
make_query(query);

/*
query=`
INSERT INTO users(username, email, fname, lname, password, role) VALUES ('cj_walker', 'CJ@gmail.com', 'cj', 'walker', 'pass', 0) ON CONFLICT DO NOTHING;
`
make_query(query);

query=`
INSERT INTO users(username, email, fname, lname, password, role) VALUES ('hunter_king', 'hunter@gmail.com', 'hunter', 'king', 'pass', 1) ON CONFLICT DO NOTHING;
`
make_query(query);

query=`
INSERT INTO assignments(tutor_id, tuttee_id) VALUES (3, 2) ON CONFLICT DO NOTHING;
`
make_query(query);
*/

// routes
require('../routes/auth')(app);
require('../routes/users')(app);
require('../routes/items')(app);

const start = async () => {
  try {
    const PORT = process.env.PORT || 80;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
    console.log(`Running on port${PORT}`);
  } catch (error) {
    console.log("error", error);
  }
};

start();

exports.getClient = () =>{
  return client;
}