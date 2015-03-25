// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
    Survey = mongoose.model('Survey'),
    Location = mongoose.model('Location'),
    moment = require('moment-timezone');

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

    console.log(req.body.questions[0].prompt);
    // Create a new survey object
    var survey = new Survey(req.body);

    // Set the survey's 'createdBy' property
    survey.createdBy = req.user;

    // Set the survey's 'createdOn' property
    survey.createdOn = moment.tz(Date.now(), 'Asia/Dubai');
    /*
     Location.find({"_id": { $in : survey.locationIds }}, 'validations', function(err, loc){
     console.log(loc);



     });
     */

    /*
     for(var i = 0; i < survey.locationIds.length; i++) {

     }

     for(var i=0; i<survey.questions[0].prompt.length; i++)
     {
     survey.questions[0].prompt
     }
     */
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

// Create a new controller method that retrieves a list of survey types
exports.listTypes = function(req, res) {
    // Use the model 'find' method to get a list of surveys
    console.log('List Types Called');
    Survey.aggregate().group({ _id: "$type" })
        .exec(function(err, surveyTypes) {
            if (err) {
                // If an error occurs send the error message
                return res.status(400).send({
                    message: getErrorMessage(err)
                });
            } else {
                // Send a JSON representation of the surveyTypes
                res.json(surveyTypes);
                console.log(surveyTypes);
            }
        });
};

// Create a new controller method that retrieves a list of all questions
exports.questions = function(req, res) {
    // Use the model 'find' method to get all the questions
    console.log('Questions Called');
    Survey.aggregate().group({ _id: "$questions" })
        .exec(function(err, ques) {
            if (err) {
                // If an error occurs send the error message
                return res.status(400).send({
                    message: getErrorMessage(err)
                });
            } else {
                // Send a JSON representation of the Questions
                res.json(ques);
                console.log(ques);
            }
        });
};


exports.listByLocationId = function(req, res) {

//	Survey.find({ locationIds: req.params.locationId }).populate('validation').exec(function(err, surveys){
    Survey.find({ locationIds: req.params.locationId }).exec(function(err, surveys){

        // If an error occurs continue to the next middleware
        if (err) {
            return next(err);
        } else {

            // If a survey could not be found, send a failure message
            if(surveys.length < 1) {
                res.send({state: 'failure', surveys: null, message: "No survey found"});
            }
            else {

                for(var s in surveys) {
                    Location.findOne({"_id": req.params.locationId}).exec(function(err, loc){

                        for(var i=0; i < surveys[s].questions[0].prompt.length; i++) {

                            for(var j = 0; j < loc.validations.length; j++){

                                if(loc.validations[j].name == surveys[s].questions[0].prompt[i].validation){
                                    surveys[s].questions[0].prompt[i].validation = JSON.parse(JSON.stringify(loc.validations[j]));
                                }
                            }
                        }

                        res.send({state: 'success', surveys: surveys ? surveys : null});

                    });

                }


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
