// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var users = require('../../app/controllers/users.server.controller'),
	reports= require('../../app/controllers/reports.server.controller');

// Define the routes module' method
module.exports = function(app) {
	// Set up the 'articles' base routes
	app.route('/api/reports')
	   .get(reports.list);


	app.route('/api/reports/monthly/participationRate')
		   .get(reports.generateMonthlyParticipationRate);


    app.route('/api/reports/dynamic')
        .post(reports.dynamicGenerateReport)
        .get(reports.dynamicGenerateReport);



    app.route('/api/reports/monthly/testing')// test report by question ( avg , count)
				   .get(reports.testing);

    app.route('/api/reports/monthly/testing1') // test report by stuff
        .get(reports.testing1);

    app.route('/api/reports/monthly/testing2') // test report delivery by questions (avg)
        .get(reports.testing2);






    app.route('/api/reports/monthly/dataexports') // responses data export
        .get(reports.dataexports);

   // app.route('/api/reports/monthly/testing')
     //   .get(reports.generateCountByQuestionAndChoices);

		//	app.route('/api/reports/monthly/participationPercentage')
			//			.get(reports.generateMonthlyParticipationPercentage);

};
