function Seat(id, data) {
	this.id = id;
	this.data = data;
}

Seat.prototype.getValue = function() {
	return this.data.value;
};

Seat.prototype.toJSON = function() {
	return {
		id: this.id,
		value: this.getValue()
	};
};

module.exports = Seat;