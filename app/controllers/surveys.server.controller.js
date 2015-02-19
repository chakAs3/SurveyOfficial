// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
	Survey = mongoose.model('Survey');

// Create a new error handling controller method
var getErrorMessage = function(err) {
	if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) return err.errors[errName].message;
		}
	} else {
		return 'Unknown server error';
	}
};

// Create a new controller method that creates new surveys
exports.create = function(req, res) {
	// Create a new survey object
	var survey = new Survey(req.body);

	// Set the survey's 'createdBy' property
	survey.createdBy = req.user;

	// Set the survey's 'createdOn' property
	survey.createdOn = Date.now;

	// Try saving the survey
	survey.save(function(err) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the survey
			res.json(survey);
		}
	});
};

// Create a new controller method that retrieves a list of surveys
exports.list = function(req, res) {
	// Use the model 'find' method to get a list of surveys
	Survey.find().sort('-created').populate('createdBy', 'firstName lastName fullName').exec(function(err, surveys) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the survey
			res.json(surveys);
		}
	});
};

exports.listByLocationId = function(req, res) {
	Survey.find({locationId: req.locationId}, function(err, surveys){

		// If an error occurs continue to the next middleware
		if (err) {
			return next(err);
		} else {
			// If an account could not be found, create a new account, otherwise, continue to the next middleware
			if(surveys.length < 1) {
				res.send({state: 'failure', surveys: null, message: "No survey found"});
			}
			else {
				res.send({state: 'success', surveys: req.surveys ? req.surveys : null});
			}
		}
	});
};

// Create a new controller method that returns an existing survey
exports.read = function(req, res) {
	res.json(req.survey);
};

// Create a new controller method that updates an existing survey
exports.update = function(req, res) {
	// Get the survey from the 'request' object
	var survey = req.survey;

	// Update the survey fields
	survey.title = req.body.title;
	survey.content = req.body.content;

	// Try saving the updated survey
	survey.save(function(err) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the survey
			res.json(survey);
		}
	});
};

// Create a new controller method that delete an existing survey
exports.delete = function(req, res) {
	// Get the survey from the 'request' object
	var survey = req.survey;

	// Use the model 'remove' method to delete the survey
	survey.remove(function(err) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the survey
			res.json(survey);
		}
	});
};

// Create a new controller middleware that retrieves a single existing survey
exports.surveyByID = function(req, res, next, id) {
	// Use the model 'findById' method to find a single survey
	Survey.findById(id).populate('createdBy', 'firstName lastName fullName').exec(function(err, survey) {
		if (err) return next(err);
		if (!survey) return next(new Error('Failed to load survey ' + id));

		// If an survey is found use the 'request' object to pass it to the next middleware
		req.survey = survey;

		// Call the next middleware
		next();
	});
};

// Create a new controller middleware that is used to authorize an survey operation
exports.hasAuthorization = function(req, res, next) {
	// If the current user is not the creator of the survey or current user is not 'admin' role send the appropriate error message
	if (req.user.role !== 'admin') { //|| req.survey.createdBy.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}

	// Call the next middleware
	next();
};
