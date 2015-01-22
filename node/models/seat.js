function Seat(id, value) {
	this.id = id;
	this.value = value;
}

Seat.prototype.getValue = function() {
	return this.value;
};

Seat.prototype.toJSON = function() {
	return {
		id: this.id,
		value: this.getValue()
	};
};

module.exports = Seat;