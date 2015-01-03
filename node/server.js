var app = require('express')();
var _ = require('underscore');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var color = 'red';
var queue = {};
var queue_len = 0;

app.use('/public', require('express').static(__dirname+'/public/'));

io.on('connection', function(socket){
	socket.on('updateSeat', function (data) {
		io.emit('updateSeat', data);
	});

	socket.on('updateTemp', function (data) {
		//console.log(data);
		var nodeID = data.id;
		var canteen = data.canteen;
		var temperature = data.value;
		var type = data.type;

		var jsonText = JSON.stringify({
			canteen: canteen,
			id: nodeID,
			temperature: temperature
		});
		console.log(jsonText);
		var obj = JSON.parse(jsonText);
		io.emit('updateTemp', obj);
	});

	socket.on('updateQueue', function (data) {
		var nodeID = data.id;
		var canteen = data.canteen;
		var value = data.value;
		queue[nodeID] = value;
		queue_len = _.reduce(queue, function(memo, value){
			return memo + value;
		},0);
		var jsonText = JSON.stringify({
			canteen: canteen,
			queue: queue_len
		});
		var obj = JSON.parse(jsonText);
		io.emit('updateQueue', obj);
	});
});

/*
setInterval(function(){
	if(color == 'red')
		color = 'green';
	else
		color = 'red';
	var id = Math.floor(Math.random()*100);
	var canteen = Math.floor(Math.random()*4);
	var jsonText = '{"canteen": "cnt'+canteen+'", "id":"'+id+'", "color":"'+color+'"}';
	var obj = JSON.parse(jsonText);
	io.emit('update', obj);
},200);
*/
app.get('/', function(req, res){
   res.sendFile(__dirname + '/public/index.html');
});


http.listen(8080, '0.0.0.0');