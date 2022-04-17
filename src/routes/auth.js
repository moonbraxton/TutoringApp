const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.js");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/signup", controller.signup);
  app.post("/api/auth/adminSignup", controller.adminSignup);
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/removeUser", controller.removeUser);
  app.post('/api/auth/createAssignment', controller.createAssignment);
  app.post("/api/auth/removeAssignment", controller.removeAssignment);

};