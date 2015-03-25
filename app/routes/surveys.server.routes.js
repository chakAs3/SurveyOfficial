// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var users = require('../../app/controllers/users.server.controller'),
    surveys = require('../../app/controllers/surveys.server.controller');

// Define the routes module' method
module.exports = function(app) {
    // Set up the 'surveys' base routes
    app.route('/api/surveys')
        .get(surveys.list)
//	   .post(users.requiresLogin, surveys.create);
        .post(surveys.create);

    app.route('/api/device/surveys/:locationId')
        .get(surveys.listByLocationId);

    app.route('/api/surveys/types')
        .get(surveys.listTypes);

    app.route('/api/surveys/questions')
        .get(surveys.questions);


    // Set up the 'surveys' parameterized routes
    app.route('/api/surveys/:surveyId')
        .get(surveys.read)
        .put(users.requiresLogin, surveys.hasAuthorization, surveys.update)
        .delete(users.requiresLogin, surveys.hasAuthorization, surveys.delete);

    // Set up the 'surveyId' parameter middleware
    app.param('surveyId', surveys.surveyByID);
};
