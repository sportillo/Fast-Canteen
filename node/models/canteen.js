var Seat = require('./seat');
var _ = require('underscore');

function Canteen(name) {
	this.name = name;
	this.seats = {};
	this.queue = {};
	this.temperature = null;
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

Canteen.prototype.toJSON = function() {
	return {
		name: this.name,
		seats: this.getSeats(),
		available_seats: this.getAvailableSeats(),
		occupied_seats: this.getOccupiedSeats(),
		temperature: this.getTemperature(),
		percentage_seats: this.getPercentageSeats(),
		queue: this.getQueue()
	};
};

module.exports = Canteen;