const { authJwt } = require("../middleware");
const controller = require("../controllers/item.js");
const auth = require("../controllers/auth.js");

module.exports = function (app) {
    app.get('/', controller.home );

    app.get('/create', function(request, response){
        response.render("create",  { userId: auth.getUserId() });
    });

    app.post('/items/create', controller.createToDoItem);
    app.post('/items/complete', controller.markAsComplete);
    app.post('/items/create_item_admin', controller.createAdminToDoItem);
    app.post('/items/create_item_tutor', controller.createTutorToDoItem);
    app.post('/items/removeTask', controller.removeTask);
}