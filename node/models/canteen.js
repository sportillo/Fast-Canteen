var Seat = require('./seat');
var _ = require('underscore');

var locations = {
	cammeo : {
		latitude : 43.723917,
		longitude : 10.391706,
		address: "Via Cammeo Carlo Salomone"
	},
	martiri : {
		latitude : 43.7205854,
		longitude : 10.4002532,
		address: "Via Martiri"
	},
	betti : {
		latitute: 43.7150921,
		longitude: 10.4162794,
		address: "Via Betti"
	},
	rosellini : {
		latitude: 43.708745,
		longitude: 10.4163141,
		address: "Via Rosellini"
	}
};

function Canteen(name) {
	this.name = name;
	this.seats = {};
	this.queue = {};
	this.temperature = null;
	this.location = locations[name];
	this.arrivals = {};
}

Canteen.prototype.getSeatsCount = function() {
	return _.size(this.seats);
};

Canteen.prototype.getAvailableSeats = function() {
	return _.reduce(this.seats, function(memo, seat) {
		return memo + ~~seat.getValue();
	}, 0);
};

Canteen.prototype.getOccupiedSeats = function() {
	return _.reduce(this.seats, function(memo, seat) {
		return memo + (~~!seat.getValue());
	}, 0);
};

Canteen.prototype.getPercentageSeats = function() {
	return Math.round( 100 * this.getAvailableSeats() / this.getSeatsCount() );
};

Canteen.prototype.updateTemperature = function(temp) {
	this.temperature = Math.round(temp * 10) / 10;
};

Canteen.prototype.getTemperature = function() {
	return this.temperature;
};

Canteen.prototype.updateSeatAt = function(id, data) {
	this.seats[id] = new Seat(id, data);
};

Canteen.prototype.getSeats = function() {
	return _.map(this.seats, function(seat) {
		return seat.toJSON();
	});
};

Canteen.prototype.updateQueue = function(id, status) {
	this.queue[id] = status;
};

Canteen.prototype.getQueue = function() {
	return _.reduce(this.queue, function(memo, queue) {
		return memo + ~~queue;
	}, 0);
};

Canteen.prototype.getLocation = function() {
	return this.location;
};

Canteen.prototype.updateETA = function(id, eta) {
	this.arrivals[id] = eta;
};

Canteen.prototype.removeETA = function(id) {
	delete(this.arrivals[id]);
};

Canteen.prototype.toJSON = function() {
	return {
		name: this.name,
		seats: this.getSeats(),
		available_seats: this.getAvailableSeats(),
		occupied_seats: this.getOccupiedSeats(),
		temperature: this.getTemperature(),
		percentage_seats: this.getPercentageSeats(),
		queue: this.getQueue(),
		location: this.location,
		arrivals: this.arrivals
	};
};

module.exports = Canteen;