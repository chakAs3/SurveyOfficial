// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
	Location = mongoose.model('Location'),
	Brand = mongoose.model('Brand'),
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

// Create a new controller method that creates new locations
exports.create = function(req, res) {
	// Create a new location object
	var location = new Location(req.body);

	// Set the location's 'createdBy' property
	location.createdBy = req.user;

	// Set the location's 'createdOn' property
	location.createdOn = moment.tz(Date.now(), 'Asia/Dubai');

console.log(location);

	// Try saving the location
	location.save(function(err) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the location
			res.json(location);
		}
	});
};

// Create a new controller method that retrieves a list of locations
exports.list = function(req, res) {
	// Use the model 'find' method to get a list of locations
	Location.find().exec(function(err, locations) {
//	Location.find().sort('-created').populate('createdBy', 'firstName lastName fullName').exec(function(err, locations) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the location
			res.json(locations);
		}
	});
};

// Create a new controller method that retrieves a list of locations with status 'active'
exports.listActiveLocations = function(req, res) {
	// Use the model 'find' method to get a list of brands
	Location.where('status').equals('active').populate('brand', 'bgImage').exec(function(err, locations) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {

			console.log(" > locations " + locations);

			for(var i=0; i < locations.length; i++)
			{
                if(locations[i].brand.bgImage.split("/").length<= 1)
                 locations[i].brand.bgImage = brandImagePath +locations[i].brand.bgImage;
			}

			// Send a JSON representation of the location
			res.json(locations);
		}
	});
};

// Create a new controller method that returns an existing location
exports.read = function(req, res) {
	res.json(req.location);
};

// Create a new controller method that updates an existing location
exports.update = function(req, res) {
	// Get the location from the 'request' object
	var location = req.location;

	console.log(req.body);

	if(req.body.request_type == "update_location") {
		// Update the location fields
		location.name = req.body.name;
		location.status = req.body.status;
		location.country = req.body.country;
		location.state = req.body.state;
		location.postalCode = req.body.postalCode;
		//	location.timezone = req.body.timezone;
		location.phoneManager = req.body.phoneManager;
		// Always store coordinates longitude, latitude order.
		location.coords = req.body.coords;
		location.contactPerson.name = req.body.contactPerson.name;
		location.contactPerson.email = req.body.contactPerson.email;
		location.contactPerson.phoneOffice = req.body.contactPerson.phoneOffice;
		location.contactPerson.phoneCell = req.body.contactPerson.phoneCell;

		location.brand = req.body.brand;
		location.modifiedOn = moment.tz(Date.now(), 'Asia/Dubai');
		//location.modifiedBy = req.user;
	}
	else if(req.body.request_type == "update_validation_table")	{
			location.validations = req.body.validations;
			//location.validations.modifiedOn = moment.tz(Date.now(), 'Asia/Dubai');
	}

	// Try saving the updated location
	location.save(function(err) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the location
			res.json(location);
		}
	});
};

// Create a new controller method that delete an existing location
exports.delete = function(req, res) {
	// Get the location from the 'request' object
	var location = req.location;

	// Use the model 'remove' method to delete the location
	location.remove(function(err) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// Send a JSON representation of the location
			res.json(location);
		}
	});
};

// Create a new controller middleware that retrieves a single existing location
exports.locationByID = function(req, res, next, id) {
	// Use the model 'findById' method to find a single location
	Location.findById(id).exec(function(err, location) {
//	Location.findById(id).populate('createdBy', 'firstName lastName fullName').exec(function(err, location) {
		if (err) return next(err);
		if (!location) return next(new Error('Failed to load location ' + id));

		// If an location is found use the 'request' object to pass it to the next middleware
		req.location = location;

		// Call the next middleware
		next();
	});
};

exports.byBrands = function(req, res){

		var brands = req.params.brandIds.split(',');
          brands.pop()
		console.log(brands);

		for (var b in brands){
			console.log(mongoose.Types.ObjectId.isValid(brands[b]));
			brands[b] = brands[b];
		}


		Location.find({
    	'brand': { $in: brands}}, 'name brand', function(err, docs){
					res.json(docs);
		});

}


// Create a new controller middleware that is used to authorize an location operation
exports.hasAuthorization = function(req, res, next) {
	// If the current user is not the creator of the location or current user is not 'admin' role send the appropriate error message
	if (req.user.role !== 'admin') { //|| req.location.createdBy.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}

	// Call the next middleware
	next();
};
