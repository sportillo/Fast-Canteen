var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var _ = require('underscore');

var Canteen = require('./models/canteen');
var canteens = [];


app.use('/public', require('express').static(__dirname+'/public/'));

io.on('connection', function(socket) {

	socket.on('update.seat', function(data) {
		canteens[ data.canteen ] = canteens[ data.canteen ] || new Canteen(data.canteen);
		canteens[ data.canteen ].updateSeatAt(data.id, data);
		io.emit('update.canteen', canteens[data.canteen].toJSON());
	});

	socket.on('update.temperature', function(data) {
		//console.log(data);
		canteens[ data.canteen ] = canteens[ data.canteen ] || new Canteen(data.canteen);
		canteens[ data.canteen ].updateTemperature(data.value);
		io.emit('update.canteen', canteens[ data.canteen ].toJSON());
	});

	socket.on('update.queue', function(data) {
		canteens[ data.canteen ] = canteens[ data.canteen ] || new Canteen(data.canteen);
		canteens[ data.canteen ].updateQueue(data.id, data.value);
		io.emit('update.canteen', canteens[ data.canteen ].toJSON());
	});

});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

http.listen(8080, '0.0.0.0');