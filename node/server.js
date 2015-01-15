var app	= require('express')();
var https = require('https');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var _ = require('underscore');

var Canteen = require('./models/canteen');
var canteens = [];

var API_KEY = "AIzaSyBNiXguGFrJYf7fvYCKn_JzeSvklwXxLrQ";

app.use('/public', require('express').static(__dirname+'/public/'));

io.on('connection', function(socket) {

	socket.on('update.seat', function(data) {
		//console.log(data);
		canteens[ data.canteen ] = canteens[ data.canteen ] || new Canteen(data.canteen);
		canteens[ data.canteen ].updateSeatAt(data.id, data);
		io.emit('update.canteen', canteens[data.canteen].toJSON());
	});

	socket.on('update.temperature', function(data) {
		canteens[ data.canteen ] = canteens[ data.canteen ] || new Canteen(data.canteen);
		canteens[ data.canteen ].updateTemperature(data.value);
		io.emit('update.canteen', canteens[ data.canteen ].toJSON());
	});

	socket.on('update.queue', function(data) {
		canteens[ data.canteen ] = canteens[ data.canteen ] || new Canteen(data.canteen);
		canteens[ data.canteen ].updateQueue(data.id, data.value);
		io.emit('update.canteen', canteens[ data.canteen ].toJSON());
	});

	socket.on('update.ETA', function(data) {
		console.log(data);
		//var value = computeDistace(data.canteen, data.lon, data.lat);
		canteens[ data.canteen ].updateETA(data.id, data.ETA);
		//io.emit('update.canteen', canteens[ data.canteen ].toJSON());
	});
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

http.listen(8080, '0.0.0.0');

/*var url =  "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" +
			43.72832382851462 + "," +
			10.388503021991607 + "&destinations=" + 
			43.723917 + "," +
			10.391706  + "&mode=walinkg&language=en-EN&key=AIzaSyBNiXguGFrJYf7fvYCKn_JzeSvklwXxLrQ";

https.get(url, function(res) {
	res.on("data", function(chunk) {
		json = JSON.parse(chunk);
		value = json['rows'][0]['elements'][0]['duration']['value'];
		canteens[ data.canteen ].updateETA(data.id, value);
	});
}).on('error', function(e) {
	console.log("Got error: " + e.message);
});*/

/*
function calculateDistances(canteen, lon, lat) {
	var url =  "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" +
					data.lon + "," +
					data.lat + "&destinations=" + 
					canteens[ canteen].location.lon + "," +
					canteens[ canteen].location.lat  + "&mode=walinkg&language=en-EN&key=" + API_KEY;

	https.get(url, function(res) {
		res.on("data", function(chunk) {
			var json = JSON.parse(chunk);
			var value = json['rows'][0]['elements'][0]['duration']['value'];
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});

	return value;
}
*/