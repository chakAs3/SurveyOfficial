// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies

var mongoose = require('mongoose'),
	report = mongoose.model('Report'),
	Location = mongoose.model('Location'),
	Response = mongoose.model('Response'),
	ReportMonthlyParticipationRate = mongoose.model('ReportMonthlyParticipationRate');
	//Name = mongoose.model('ReportMonthlyParticipationRate');
	//ReportMonthlyParticipationPercentage = mongoose.model('ReportMonthlyParticipationPercentage');

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

exports.generateMonthlyParticipationRate = function(req, res){

var o = {};
o.map = function () { emit(this.locationId, 1); }
o.reduce = function (locationId, count) { return Array.sum(count); }
o.out = { replace: 'report_participation_rate' }
o.verbose = true;
Response.mapReduce(o, function (err, model, stats) {
	model.find().exec(function(err, docs){
		console.log(docs);
	});
	console.log('map reduce took %d ms', stats.processtime);
});

    /**
     * generate Report  (Count of response choices ) params:[Question (id,title,content)  , set of Choices ] .
     *
      */
    exports.generateCountByQuestionAndChoices = function(req,res){

        // this type of object should be sent in request
        var objectParam = {questionId:"550009d453d5f66d42fc99e8",choices:[{id:111,value:"first",name:"First"},
                                                    {id:222,value:"second",name:"Second"},
                                                    {id:333,value:"many",name:"Many"}]};

        //  create map and reduce
        var object = new Object();
        object.map = function(){

            emit(this.locationId,this.responses.data.questionId);
        }
        object.reduce = function(key,questions){

            var reduce = 0 ;
            for ( var i=0 ; i < questions.length ; i++){

                if(questions[i] == objectParam.questionId ){
                    reduce++;
                }
            }
            return reduce;
        }
        object.out = { replace: 'report_gen_rate' }
        object.verbose = true;
        Response.mapReduce(object, function (err, model, stats) {
            console.log('receive model chakir');
            model.find().exec(function (err, docs) {
                console.log(docs);
            });
            console.log('map reduce took %d ms', stats.processtime);

        });

    }


/*
	ReportMonthlyParticipationRate.find().populate('_id').exec(function(err, docs){

	 	if(err) console.log(err);

		console.log(docs);
		// Send a JSON representation of the reports
		res.json(docs);

	});*/

};

/*exports.generateMonthlyParticipationPercentage = function(req, res){

var o = {};
o.map = function () { emit(this.locationId, 1); }
o.reduce = function (locationId, count) { return Array.sum(count); }
o.out = { replace: 'report_participation_rate' }
o.verbose = true;
Response.mapReduce(o, function (err, model, stats) {
	console.log('map reduce took %d ms', stats.processtime);
/*
	model.find().exec(function(err, docs) {
		for(var d in docs)
		{
			//console.log('ObjectId(\'' + docs[d]._id + '\')');
var id = docs[d]._id;
			Location.where({"_id": id}).findOne(function(err, loc){
				if(err)
					console.log(getErrorMessage(err));
				else
					console.log(loc);
			});

		}
	});


	// Send a JSON representation of the reports
	//res.json(model);

});



	var mapper = function () {
		emit(this.x, 1);
	};

	var reducer = function(x, count){
	 	return Array.sum(count);
	};

	response.mapReduce(
		mapper,
		reducer,
		{
			out : "report_participation_rate"
		}
	 );


	// populates a single object
	ReportMonthlyParticipationPercentage.find().populate('_id', 'name').exec(function(err, docs) {

	 	if(err) console.log(err);

		// Send a JSON representation of the reports
		res.json(docs);

	 });




};*/


// Create a new controller method that retrieves a list of reports
exports.list = function(req, res) {
	// Use the model 'find' method to get a list of reports
	report.find().exec(function(err, reports) {
		if (err) {
			// If an error occurs send the error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {


var rep =reports;
var count = 0;
						for(var r in rep){
							//console.log("count: " + count++ + rep[r]._id);
							//console.log(location.locationByID(rep[r]._id));

		var query = Location.where({"_id": rep[r]._id});
		console.log(rep[r]._id);
query.findOne(function(err, loc){
	if(err)
		console.log(getErrorMessage(err));
	else
		console.log(loc);
});

			}
			// Send a JSON representation of the reports
			res.json(reports);
		}
	});
};


exports.dynamicGenerateReport = function(req, res) {


    // this type of object should be sent in request

    // questionId :5502cd1d53d5f66d42fc99e9  for food quality

    // questionId :550009d453d5f66d42fc99e8  for visiting
    console.log(req.body);
    var objectParam  =  req.body ;

    /*objectParam = {brandId:"54f722f59a66644803c12897",
     questionId: "550009d453d5f66d42fc99e8",
     //shifts:[{value:"breakfast",from:5,to:12},{value:"lunch",from:12,to:18},{value:"dinner",from:18,to:23},{value:"brunch",from:0,to:4}] ,
     choices:["first","second"]
     //days:["Thu","Wed","Mon","Sun","Fri","Sat"]
     // type:"avg"
     };*/



    var query ={};

    if(objectParam.brandId)
        query.brandId = {"$in":objectParam.brandId};
    if(objectParam.questionId)
        query["responses.data.questionId"] = objectParam.questionId;

    //  create map and reduce
    var object = new Object();
    var mapper = function() {

        var res = this.responses ;

        for (var idx = 0; idx < res[0].data.length; idx++) {
            //var key = this.items[idx].sku;
            var value = {
                value: res[0].data[idx].value,
                questionId: res[0].data[idx].questionId,
                timeTaken:res[0].data[idx].timeTaken

            };
            //if(this.brandId == questionObject.brandId || questionObject.brandId == null )
            if(value.questionId == questionObject.questionId)
                emit(this.locationId, value);
        }

    };
    object.map = mapper  ;

    object.query  = query ;//{brandId:ObjectId(objectParam.brandId)};//{brandId:{$in:[ObjectId(objectParam.brandId)]}};

    object.scope={questionObject:objectParam};

    object.reduce = function(key,questions){

        var reduce = {count:0,values:[]} ;

        var series ;

        for ( var i=0 ; i < questions.length ; i++){

            //  if(questions[i].questionId == questionObject.questionId){ // only on selected question

            if(questionObject.type == "avg"){

                reduce.values.push(questions[i].value);
            }else if(questionObject.choices){
                series = questionObject.choices
                if(questionObject.choices.length == 0 || questionObject.choices.indexOf(questions[i].value)>-1)

                    reduce.values.push(questions[i].value);

            }else if(questionObject.days){ // pass days checking
                series = questionObject.days
                var day = questions[i].timeTaken.substr(0,3);
                if( questionObject.days.indexOf(day)>-1)
                    reduce.values.push(day);

            }else if(questionObject.shifts){ // pass shift time in day

                var d = new Date(questions[i].timeTaken)
                series = []
                for (var j=0 ; j < questionObject.shifts.length ; j++ ){
                    series.push(questionObject.shifts[j].value);
                    if(questionObject.shifts[j].from < d.getHours() && d.getHours() <= questionObject.shifts[j].to )
                        reduce.values.push(questionObject.shifts[j].value );
                }

            }
            reduce.count++;
            // }
        }
        // reduce.valuesNrate = countValues(reduce.values);
        /*   calculate occurences */
        //  var countValues= function (arr) {
        var arr =  reduce.values ;
        if(questionObject.type == "avg"){
            var sum=0;
            for (var i = 0; i < arr.length; i++) {
                sum +=  Number(arr[i]);
            }
            reduce.sum = sum ;
        }else {
            var a = series, b = [], prev;
            for ( var t in series)
            b[t] = 0

            arr.sort();
            for (var i = 0; i < arr.length; i++) {
                var index = a.indexOf(arr[i])
                if (index > -1 ) {

                    b[index]++;
                }
            }

            reduce.valuesNrate = [a, b];
        }
        // };
        /*                               ***/



        return reduce;
    }

    object.out = { replace: 'report_gen_rate' }
    object.verbose = true;

    Response.mapReduce(object, function (err, model, stats) {
            console.log('receive model chakir ');
        if(err) {
            console.log(err);
        }else
            model.find().exec(function (err, docs) {
                if(err){
                    console.log(err);
                }else {
                    console.log(JSON.stringify(docs));
                    res.send(docs);
                }
            });
            console.log('map reduce took %d ms', stats.processtime);
        }
    );


//res.end(" is DOne");
};

exports.testing = function(req, res) {


    // this type of object should be sent in request

    // questionId :5502cd1d53d5f66d42fc99e9  for food quality

    // questionId :550009d453d5f66d42fc99e8  for visiting
    var objectParam  =  req.body.reportParam ;

    objectParam = {brandId:null,
                      questionId:"5502cd1d53d5f66d42fc99e9",
                      //shifts:[{value:"breakfast",from:5,to:12},{value:"lunch",from:12,to:18},{value:"dinner",from:18,to:23},{value:"brunch",from:0,to:4}] ,
                      choices:["first","many"],
                      //days:["Thu","Wed","Mon","Sun","Fri","Sat"]
                      type:"avg"
                     };



    var query ={};

    if(objectParam.brandId)
        query.brandId = ObjectId(objectParam.brandId);
    if(objectParam.questionId)
        query["responses.data.questionId"] = objectParam.questionId;

    //  create map and reduce
    var object = new Object();
    var mapper = function() {

            var res = this.responses ;

            for (var idx = 0; idx < res[0].data.length; idx++) {
                //var key = this.items[idx].sku;
                var value = {
                    value: res[0].data[idx].value,
                    questionId: res[0].data[idx].questionId,
                    timeTaken:res[0].data[idx].timeTaken

                };
                //if(this.brandId == questionObject.brandId || questionObject.brandId == null )
                if(value.questionId == questionObject.questionId)
                emit(this.locationId, value);
            }

    };
    object.map = mapper  ;

    object.query  = query ;//{brandId:ObjectId(objectParam.brandId)};//{brandId:{$in:[ObjectId(objectParam.brandId)]}};

    object.scope={questionObject:objectParam};

    object.reduce = function(key,questions){

        var reduce = {count:0,values:[]} ;

        for ( var i=0 ; i < questions.length ; i++){

          //  if(questions[i].questionId == questionObject.questionId){ // only on selected question

                if(questionObject.type == "avg"){

                    reduce.values.push(questions[i].value);
                }else if(questionObject.choices){

                    if(questionObject.choices.length == 0 || questionObject.choices.indexOf(questions[i].value)>-1)

                        reduce.values.push(questions[i].value);

                }else if(questionObject.days){ // pass days checking

                    var day = questions[i].timeTaken.substr(0,3);
                    if( questionObject.days.indexOf(day)>-1)
                      reduce.values.push(day);

                }else if(questionObject.shifts){ // pass shift time in day

                    var d = new Date(questions[i].timeTaken)
                    for (var j=0 ; j < questionObject.shifts.length ; j++ ){
                        if(questionObject.shifts[j].from < d.getHours() && d.getHours() <= questionObject.shifts[j].to )
                            reduce.values.push(questionObject.shifts[j].value );
                    }

                }
                reduce.count++;
           // }
        }
       // reduce.valuesNrate = countValues(reduce.values);
        /*   calculate occurences */
      //  var countValues= function (arr) {
        var arr =  reduce.values ;
        if(questionObject.type == "avg"){
            var sum=0;
            for (var i = 0; i < arr.length; i++) {
                sum +=  Number(arr[i]);
            }
            reduce.sum = sum ;
        }else {
            var a = [], b = [], prev;

            arr.sort();
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] !== prev) {
                    a.push(arr[i]);
                    b.push(1);
                } else {
                    b[b.length - 1]++;
                }
                prev = arr[i];
            }

            reduce.valuesNrate = [a, b];
        }
       // };
        /*                               ***/



        return reduce;
    }

    object.out = { replace: 'report_gen_rate' }
    object.verbose = true;

    Response.mapReduce(object, function (err, model, stats) {
            console.log('receive model chakir ');
             model.find().exec(function (err, docs) {
              console.log(docs);
                 res.send(docs);
                });
            console.log('map reduce took %d ms', stats.processtime);
        }
    );


//res.end(" is DOne");
};

exports.testing1 = function(req, res) {


    // this type of object should be sent in request

    // questionId :5502cd1d53d5f66d42fc99e9  for food quality

    // questionId :550009d453d5f66d42fc99e8  for visiting
    var objectParam = {brandId:null,
        questionId:"550009d453d5f66d42fc99e8",
        //shifts:[{value:"breakfast",from:5,to:12},{value:"lunch",from:12,to:18},{value:"dinner",from:18,to:0},{value:"brunch",from:0,to:4}] ,
         choices:[],
        // days:["Sun","Mon","Tue","Wed","Thu"]
       // type:"avg"
    };

    //  create map and reduce
    var object = new Object();
    var mapper = function(n) {
        function map() {
            // emit(this.locationId,this.surveyId);
            var res = this.responses ;
            print(" this.responses  "+this.responses)

            for (var idx = 0; idx < res[0].data.length; idx++) {
                //var key = this.items[idx].sku;
                var value = {
                    value: res[0].data[idx].value,
                    questionId: res[0].data[idx].questionId,
                    timeTaken:res[0].data[idx].timeTaken

                };
                if(this.brandId == questionObject.brandId || questionObject.brandId == null )
                    emit({"locationId":this.locationId,"staffId":res[0].prompt[0].value}, value);
            }
        }
        return map;
    };
    object.map = mapper(objectParam) ;

    //object.query  = {brandId:objectParam.brandId};

    object.scope={questionObject:objectParam};

    object.reduce = function(key,questions){


        var reduce = {count:0,values:[]} ;



        for ( var i=0 ; i < questions.length ; i++){

            if(questions[i].questionId == questionObject.questionId){ // only on selected question

                if(questionObject.type == "avg"){

                    reduce.values.push(questions[i].value);
                }else if(questionObject.choices){

                    if(questionObject.choices.length == 0 || questionObject.choices.indexOf(questions[i].value)>-1)
                        reduce.values.push(questions[i].value);

                }else if(questionObject.days){ // pass days checking

                    var day = questions[i].timeTaken.substr(0,3);
                    if( questionObject.days.indexOf(day)>-1)
                        reduce.values.push(day);

                }else if(questionObject.shifts){ // pass shift time in day

                    var d = new Date(questions[i].timeTaken)
                    for (var j=0 ; j < questionObject.shifts.length ; j++ ){
                        if(questionObject.shifts[j].from < d.getHours() && d.getHours() <= questionObject.shifts[j].to )
                            reduce.values.push(questionObject.shifts[j].value );
                    }

                }
                reduce.count++;
            }
        }
        // reduce.valuesNrate = countValues(reduce.values);
        /*   calculate occurences */
        //  var countValues= function (arr) {
        var arr =  reduce.values ;
        if(questionObject.type == "avg"){
            var sum=0;
            for (var i = 0; i < arr.length; i++) {
                sum +=  Number(arr[i]);
            }
            reduce.sum = sum ;
        }else {
            var a = [], b = [], prev;

            arr.sort();
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] !== prev) {
                    a.push(arr[i]);
                    b.push(1);
                } else {
                    b[b.length - 1]++;
                }
                prev = arr[i];
            }

            reduce.valuesNrate = [a, b];
        }
        // };
        /*                               ***/



        return reduce;
    }

    object.out = { replace: 'report_gen_rate' }
    object.verbose = true;

    Response.mapReduce(object, function (err, model, stats) {
            console.log('receive model chakir ');
            model.find().exec(function (err, docs) {
                console.log(docs);
                res.send(docs);
            });
            console.log('map reduce took %d ms', stats.processtime);
        }
    );


//res.end(" is DOne");
};

exports.testing2 = function(req, res) {


    // this type of object should be sent in request

    // questionId :5502cd1d53d5f66d42fc99e9  for food quality

    // questionId :550009d453d5f66d42fc99e8  for visiting
    var objectParam = {brandId:null,
        questionId:["5502cd1d53d5f66d42fc99e9","55045bbb53d5f66d42fc99ea","55045c9253d5f66d42fc99eb"],
        //shifts:[{value:"breakfast",from:5,to:12},{value:"lunch",from:12,to:18},{value:"dinner",from:18,to:0},{value:"brunch",from:0,to:4}] ,
        //choices:[],
        // days:["Sun","Mon","Tue","Wed","Thu"]
         type:"avg"
    };

    //  create map and reduce
    var object = new Object();
    var mapper = function(n) {
        function map() {
            // emit(this.locationId,this.surveyId);
            var res = this.responses ;
            print(" this.responses  "+this.responses)

            for (var idx = 0; idx < res[0].data.length; idx++) {
                //var key = this.items[idx].sku;
                var value = {
                    value: res[0].data[idx].value,
                    questionId: res[0].data[idx].questionId,
                    timeTaken:res[0].data[idx].timeTaken

                };
                if((this.brandId == questionObject.brandId || questionObject.brandId == null) && questionObject.questionId.indexOf(value.questionId) > -1 )
                    emit({"locationId":this.locationId,"questionId":value.questionId}, value);
            }
        }
        return map;
    };
    object.map = mapper(objectParam) ;

    //object.query  = {brandId:ObjectId(objectParam.brandId)};

    object.scope={questionObject:objectParam};

    object.reduce = function(key,questions){


        var reduce = {count:0,values:[]} ;



        for ( var i=0 ; i < questions.length ; i++){

            //if(questions[i].questionId == questionObject.questionId){ // only on selected question

                if(questionObject.type == "avg"){

                    reduce.values.push(questions[i].value);
                }else if(questionObject.choices){

                    if(questionObject.choices.length == 0 || questionObject.choices.indexOf(questions[i].value)>-1)
                        reduce.values.push(questions[i].value);

                }else if(questionObject.days){ // pass days checking

                    var day = questions[i].timeTaken.substr(0,3);
                    if( questionObject.days.indexOf(day)>-1)
                        reduce.values.push(day);

                }else if(questionObject.shifts){ // pass shift time in day

                    var d = new Date(questions[i].timeTaken)
                    for (var j=0 ; j < questionObject.shifts.length ; j++ ){
                        if(questionObject.shifts[j].from < d.getHours() && d.getHours() <= questionObject.shifts[j].to )
                            reduce.values.push(questionObject.shifts[j].value );
                    }

                }
                reduce.count++;
            //}
        }
        // reduce.valuesNrate = countValues(reduce.values);
        /*   calculate occurences */
        //  var countValues= function (arr) {
        var arr =  reduce.values ;
        if(questionObject.type == "avg"){
            var sum=0;
            for (var i = 0; i < arr.length; i++) {
                sum +=  Number(arr[i]);
            }
            reduce.sum = sum ;
        }else {
            var a = [], b = [], prev;

            arr.sort();
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] !== prev) {
                    a.push(arr[i]);
                    b.push(1);
                } else {
                    b[b.length - 1]++;
                }
                prev = arr[i];
            }

            reduce.valuesNrate = [a, b];
        }
        // };
        /*                               ***/



        return reduce;
    }

    object.out = { replace: 'report_gen_rate' }
    object.verbose = true;

    Response.mapReduce(object, function (err, model, stats) {
            console.log('receive model chakir ');
            model.find().exec(function (err, docs) {
                console.log(docs);
                res.send(docs);
            });
            console.log('map reduce took %d ms', stats.processtime);
        }
    );


//res.end(" is DOne");
};

var ObjectId = mongoose.Types.ObjectId

exports.dataexports = function(req, res) {

 var reqFields =  {locationId:1 ,locationName:1,"brandId" : 1,
     "surveyId" :1,
     "totalTimeTaken" : 1,
     "sourceOS" : 1,
     "createdOn" : 1 }// req.body.fields ;


 var reqQuery ={locationIds:[new ObjectId("54f7231d9a66644803c12899"),new ObjectId("550156759ec8d072cfb9beb6"),new ObjectId("550173482fad6fddd281ceb2")],startDate:new Date("2015-01-12"),endDate :new Date("2015-03-12")} //req.body.query


    reqFields["responses.data.questionId"]= 1
    reqFields["responses.data.value"]= 1

var query  ={locationId:{$in:reqQuery.locationIds}, createdOn:{"$lt":reqQuery.endDate,"$gt":reqQuery.startDate},hour :{$gt:10}} ;
var fields = reqFields;

   fields.hour = {"$hour" :"$createdOn" };
    Response.aggregate([
        {$project:fields},
        {$match :query}

    ])
        .exec(function(err,docs){

      if(docs){
          //res.send(docs);
          console.log(" DOCS "+docs);
          var opts =[  {
              path: 'surveyId'
              , select: 'questions.survey.titleEN'
              , options: { limit: 2 }
          }]
          if(reqFields.locationName){
              opts.push({
                  path: 'locationId'
                  , select: 'name'
                  , options: { limit: 2 }
              } )
          }
          if(reqFields.surveyName){
             opts [ 0 ] = {
                 path: 'surveyId'
                 , select: 'name questions.survey.titleEN'
                 , options: { limit: 2 }
             }

          }

          Response.populate(docs,opts,function(err, docs1) {
             // assert.ifError(err);
              console.log();
              console.log(docs1);
              res.send(docs1);
          });
      }

    });


//res.end(" is DOne");
};
