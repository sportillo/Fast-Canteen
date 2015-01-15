var socket = io();
var ID = Math.floor(Math.random() * 200) + 1;
var API_KEY = "AIzaSyBNiXguGFrJYf7fvYCKn_JzeSvklwXxLrQ";

var ETA = {};
/*
Canteen
*/

var Canteen = Backbone.Model.extend({
	idAttribute: 'name',
});

var CanteenView = Backbone.View.extend({
	tagName: 'div',
	className: 'canteen item',
	template: _.template( $('#_tpl_canteen').html() ),
	initialize: function() {
		this.listenTo(this.model, 'change', this.change);
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	change: function() {
		var self = this;
		_.each(this.model.attributes, function(val, key) {
			var $val_dom = self.$el.find('[data-' + key + ']');
			if ($val_dom.attr('role') === 'progressbar') {
				$val_dom.css('width', val + '%');
			} else {
				$val_dom.html(val);
			}
		});
		_.each(this.model.attributes.seats, function(seat) {
			self.$el.find('.canteen-seats').find('[data-id="'+seat.id+'"]').attr('data-value', ~~seat.value);
		});
	}
});

var CanteenList = Backbone.Collection.extend({
	model: Canteen
});


/*
App
*/

var Canteens = new CanteenList();

var AppView = Backbone.View.extend({
	el: $('#canteens'),
	initialize: function() {
		this.listenTo(Canteens, 'add', this.add);
		this.$el.owlCarousel({
			singleItem: true
		});
	},
	add: function(canteen) {
		var view = new CanteenView({ model: canteen });
		this.$el.data('owlCarousel').addItem( view.render().el );
   },
});

/*
Socket listeners
*/

socket.on('update.canteen', function(canteen_json) {
	if (Canteens.get(canteen_json.name)) {
		Canteens.get(canteen_json.name).set(canteen_json);
	} else {
		Canteens.add(new Canteen(canteen_json));
	}
});

socket.emit('start.update.position', JSON.stringify({
		ID: ID
	})
);

var App = new AppView();
var geocoder = new google.maps.Geocoder();

$(document).bind('touchmove', false);

function calculateDistances(lat, lon) {
	var service = new google.maps.DistanceMatrixService();
	var origin = new google.maps.LatLng(lat, lon);

	Canteens.each(function(canteen) {
		var destination = new google.maps.LatLng(canteen.get('location').latitude, canteen.get('location').longitude);

		service.getDistanceMatrix(
		{
			origins: [origin],
			destinations: [destination],
			travelMode: google.maps.TravelMode.WALKING,
			unitSystem: google.maps.UnitSystem.METRIC,
			avoidHighways: false,
			avoidTolls: false
		}, function(response, status) {
				if (status != google.maps.DistanceMatrixStatus.OK) {
					console.log('Error was: ' + status);
				} else {
					var cnt_name = canteen.get('name');
					console.log(cnt_name);
					console.log(response.rows[0].elements[0].duration.value);
					ETA[cnt_name] = Math.round(response.rows[0].elements[0].duration.value / 60);
					$.find('[data-'+ cnt_name + '-distance]')[0].textContent = ETA[cnt_name];
				}
		});
	});
}

function goHere(canteen) {
	var lat = Canteens.get(canteen).get('location').latitude;
	var lon = Canteens.get(canteen).get('location').latitude;
	try{

		window.webkit.messageHandlers.notification.postMessage({ 'id' : ID, 'canteen_lat': canteen, 'canteen_lat': lat, 'canteen_lon': lon,});

	} catch(err) {

	}

}

$(document).ready(function(){

	/* START For testing */
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
			latitude: 43.7152325,
			longitude: 10.4121704,
			address: "Via Betti"
		},
		rosellini : {
			latitude: 43.708745,
			longitude: 10.4163141,
			address: "Via Rosellini"
		}
	};
	Canteens.add({name: 'cammeo', available_seats : 1, occupied_seats: 2, queue: 0, percentage_seats: 10, seats: [], location:locations['cammeo'], arrivals: {}});
	//Canteens.add({name: 'martiri', available_seats : 1, occupied_seats: 2, queue: 0, percentage_seats: 10, seats: [], location:locations['martiri'], arrivals: {}});
	//Canteens.add({name: 'betti', available_seats : 1, occupied_seats: 2, queue: 0, percentage_seats: 10, seats: [], location:locations['betti'], arrivals: {}});
	//Canteens.add({name: 'rosellini', available_seats : 1, occupied_seats: 2, queue: 0, percentage_seats: 10, seats: [], location:locations['rosellini'],arrivals: {}});
	/* END For Testing */

});

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;
			calculateDistances(lat, lon);
		});
}

