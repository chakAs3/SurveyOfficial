var mongojs = require('mongojs');
var db = mongojs('mean-development', ['testData', 'example1_results'])


var mapper = function () {
	emit(this.x, 1);
};

var reducer = function(x, count){
 	return Array.sum(count);
};

db.testData.mapReduce(
	mapper,
	reducer,
	{
		out : "example1_results"
	}
 );
 
 db.example1_results.find(function (err, docs) {
 	if(err) console.log(err);
 	console.log(docs);
 });
