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

	io.emit('update.canteen', canteens['cammeo'].toJSON());
	io.emit('update.canteen', canteens['martiri'].toJSON());
	io.emit('update.canteen', canteens['betti'].toJSON());
	io.emit('update.canteen', canteens['rosellini'].toJSON());

	socket.on('update.seat', function(data) {
		canteens[ data.canteen ] = canteens[ data.canteen ] || new Canteen(data.canteen);
		canteens[ data.canteen ].updateSeatAt(data.id, data.value);
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
		canteens[ data.canteen ].updateETA(data.id, data.ETA);
		io.emit('update.canteen', canteens[ data.canteen ].toJSON());
	});

});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

http.listen(8080, '0.0.0.0');

/* FOR TESTING */
canteens['cammeo'] = new Canteen('cammeo');
canteens['martiri'] = new Canteen('martiri');
canteens['betti'] = new Canteen('betti');
canteens['rosellini'] = new Canteen('rosellini');

for (var c in canteens)
{
	canteens[c].updateQueue(0, Math.round(Math.random() * 30)+10);

	for (var i = 0; i < 100; i++)
		canteens[c].updateSeatAt(i, Math.round(Math.random()));

	var numPers = Math.round(Math.random() * 50);
	for (var i = 0; i < numPers; i++)
		canteens[c].ETA[i] = Math.round(Math.random() * 3600);
}

/* SIMULATE USERS AND SEAT UPDATE */
setInterval( function() {
	for(var c in canteens) {
		var queueRemove = (Math.random() < 0.1);
		var queueInsert = (Math.random() < 0.1);
		var freeSeat = (Math.random() < 0.15);

		if (queueRemove)
		{
			canteens[c].queue[0] -= 1;

			var randomSeatId = Math.round(Math.random() * 99);
			while (canteens[c].seats[randomSeatId].getValue() === 0)
			{
				randomSeatId = Math.round(Math.random() * 99);
			}

			canteens[c].updateSeatAt(randomSeatId, 0);
		}

		if (freeSeat) {

			var randomSeatId = Math.round(Math.random() * 99);
			while (canteens[c].seats[randomSeatId].getValue() === 1)
			{
				randomSeatId = Math.round(Math.random() * 99);
			}

			canteens[c].updateSeatAt(randomSeatId, 1);
		}

		if (queueInsert)
			canteens[c].queue[0] += 1;

		io.emit('update.canteen', canteens[ c ].toJSON());
	}
}, 1000);
