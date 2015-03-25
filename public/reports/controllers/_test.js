
var mongojs = require('mongojs');
var db = mongojs('mean-development', ['responses',  'locations', 'users_comments','testing']);


var mapRes, mapLoc, reduce;

// end sample data setup

mapRes = function(key, val) {
    /*var values = {
        locationId: this.locationId,
        //status : this.status


        //gender: this.gender,
        //age: this.age
    };*/
    emit(this.locationId, {count: 1});

};
mapLoc = function() {
    var values = {
        locId: this._id,
        name: this.name

        //created: this.created
    };
    emit(this._id, values);
};



reduce =    function(key, values) {

    var result = {count : 0} ,commentFields = {
        "name": '',
        "counts": 0
      };


    values.forEach(function(value) {





     if ("name" in value) {
         if (!("names" in result)) {
           result.names = [];
         }
         result.names.push(value);
};


        result.part = [];
        result.count += value.count;
        result.part.push(value);




      //  result.names.push.apply(count);



    //  result.likes += value.likes;
    });




    return result;
  }



db.responses.mapReduce(mapRes, reduce, {out: "users_comments"});
db.locations.mapReduce(mapLoc, reduce, {"out": {"reduce": "users_comments"}});
//db.locations.mapReduce(mapper, reduce, {"out": {"reduce": "users_comments"}});
db.users_comments.find(function (err, docs) {
    if(err) console.log(err);
    console.log(docs);
 });
