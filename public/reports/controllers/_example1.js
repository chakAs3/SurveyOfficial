var mongojs = require('mongojs');
var db = mongojs('mean-development', ['responses', 'example_results', 'locations'])


var mapper = function () {
	emit( this.locationId,this.location 1);
};
 
var reducer = function(key, values){
 	return Array.sum(values);
};

db.responses.mapReduce(
	mapper,
	reducer,
	{
		out : "example_results"
	}
 );
 


 db.example_results.find(function (err, docs) {
 	if(err) console.log(err);
 	console.log(docs);
 });


