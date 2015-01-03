var socket = io();


/*
Canteen model
*/

var Canteen = function(name) {
	this.name = name;
	this.seats = {};
};

Canteen.prototype._template =  _.template( $('#_tpl_canteen').html() );

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

Canteen.prototype.getTemperature = function() {
	return 52;
};

Canteen.prototype.render = function() {
	return this._template({
		name: this.name
	});
};

Canteen.prototype.toJSON = function() {
	return {
		available_seats: this.getAvailableSeats(),
		occupied_seats: this.getOccupiedSeats(),
		temperature: this.getTemperature(),
		percentage_seats: this.getPercentageSeats()
	};
};

Canteen.prototype.updateSeatAt = function(id, data) {
	this.seats[id] = new Seat(id, data);
};

Canteen.prototype.getSeats = function() {
	return this.seats;
};

/*
Seat model
*/

var Seat = function(id, data) {
	this.id = id;
	this.data = data;
};

Seat.prototype._template =  _.template( $('#_tpl_seat').html() );

Seat.prototype.getValue = function() {
	return this.data.value;
};

Seat.prototype.toJSON = function() {
	return {
		value: this.getValue()
	};
};

Seat.prototype.render = function() {
	return this._template({
		id: this.id
	});
};



/*
App
*/

var App = {

	canteens: {},
	canteensDOMContainer: null,

	render: function() {
		App.renderCanteens();
		// App.canteensDOMContainer.owlCarousel({
		// 	navigation : true,
		// 	singleItem:true
		// });
	},

	renderCanteens: function() {
		_.each(App.canteens, function(canteen) {
			var $dom = App.canteensDOMContainer.find('#canteen-'+canteen.name);
			if ($dom.length === 0) {
				App.canteensDOMContainer.append( canteen.render() );
				$dom = App.canteensDOMContainer.find('#canteen-'+canteen.name);
			}

			_.each(canteen.toJSON(), function(val, key) {
				var $valDom = $dom.find('[data-' + key + ']');
				if ($valDom.attr('role') === 'progressbar') {
					$valDom.css('width', val + '%');
				} else {
					$valDom.html(val);
				}
			});

			App.renderSeats(canteen);
		});
	},

	renderSeats: function(canteen) {
		var $domCanteenContainer = App.canteensDOMContainer.find('#canteen-'+canteen.name).find('[data-seats]');
		if ($domCanteenContainer.length === 0) $domCanteenContainer = $domCanteenContainer.append( seat.render() );

		_.each(canteen.getSeats(), function(seat) {
			var $dom = $domCanteenContainer.find('#seat-'+seat.id);
			if ($dom.length === 0) {
				$domCanteenContainer.append( seat.render() );
				$dom = $domCanteenContainer.find('#seat-'+seat.id);
			}

			$dom.attr('data-value', ~~seat.getValue());
		});
	}

};


/*
Socket listeners
*/



// socket.on('updateTemp', function(data) {
// 	var nodeID = data.id;
// 	var temperature = data.temperature;
// 	var canteen = data.canteen;
// 	if($('#'+canteen).length !== 0) {
// 		$('#temp-'+canteen).text('Temperature: '+ Math.round(temperature*100) /100);
// 	}
// });

// socket.on('updateQueue', function(data) {
// 	var queue = data.queue;
// 	var canteen = data.canteen;
// 	if($('#'+canteen).length !== 0) {
// 		$('#queue-'+canteen).text('Queue: '+ queue + ' m');
// 	}
// });

socket.on('updateSeat', function(data) {
	App.canteens[ data.canteen ] =  App.canteens[ data.canteen ] || new Canteen(data.canteen);
	App.canteens[ data.canteen ].updateSeatAt(data.id, data);
});

/*
DOM READY
 */

$(function() {
	App.canteensDOMContainer = $('#canteens');

	setTimeout(function() {
		App.canteensDOMContainer.owlCarousel({
			navigation : true,
			singleItem:true
		});
	}, 2000);

	socket.on('updateSeat', App.render);

})