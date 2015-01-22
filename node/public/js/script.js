var socket = io();
/* Google Maps API KEY */
var API_KEY = "AIzaSyBNiXguGFrJYf7fvYCKn_JzeSvklwXxLrQ";
/* Structure containing user ETA to the canteens */
var ETA = {};
var canteenTarget = null;

var ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});
/*
Canteen
*/

var Canteen = Backbone.Model.extend({
	idAttribute: 'name',
	/* Return the HTML View of the relative canteen */
	getMasterView: function() {
		return $('.canteen[data-id=' + this.id + ']');
	},
	/* Button function */
	goHere: function() {
		if(window.webkit){
			/* I'm on a iOS WebView */
			try {
				/* Trigger the notification event on the application
				 	with a JSON containing target canteen information */
				window.webkit.messageHandlers.notification.postMessage({
					canteen: this.id,
					canteen_lat: this.get('location').latitude,
					canteen_lon: this.get('location').longitude
				});

			} catch(err) {}
		} else {
			/* I'm on Android, probably */
			if(canteenTarget !== null)
				canteenTarget = this.id;
			else if(canteenTarget == this.id)
				canteenTarget = null;
		}
	}
});

var CanteenView = Backbone.View.extend({
	tagName: 'div',
	className: 'canteen item',
	template: _.template( $('#_tpl_canteen').html() ),
	initialize: function() {
		/* When the model changes, call change() function */
		this.listenTo(this.model, 'change', this.change);
	},
	render: function() {
		/* Find the relative HTML View */
		this.$el.attr('data-id', this.model.id);
		/* Populates the View with the model information */
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
		this.$el.on('click', '[data-go-here]', function() {
			Canteens.get( $(this).data('go-here') ).goHere();
			App.$el.find('[data-go-here].active').removeClass('active');
			$(this).addClass('active');
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

		Canteens.get(canteen_json.name).getMasterView().find('[data-arrivals]').text(calculateArrivals(canteen_json.name));
		Canteens.get(canteen_json.name).getMasterView().find('[data-timetoeat]').text(calculateTTE(canteen_json.name));
	} else {
		Canteens.add(new Canteen(canteen_json));
	}
});

var App = new AppView();
var geocoder = new google.maps.Geocoder();

$(document).bind('touchmove', false);

/* Compute the number of person going to the canteen, with an ETA less then the user one */
function calculateArrivals(canteen) {
	var res = 0;
	var myETA = ETA[canteen];
	var etas = Canteens.get(canteen).get('ETA');
	for(var e in etas) {
		if(etas[e] < myETA)
			res++;
	}
	return res;
}

function calculateTTE(canteen) {
	var arrivals = ~~Canteens.get(canteen).getMasterView().find('[data-arrivals]').text();
	var queue = ~~Canteens.get(canteen).getMasterView().find('[data-queue]').text();
	var eta = ETA[canteen];

	return Math.round(((arrivals + queue)*15 + eta)/60) + "\nmins";
}


function calculateETA(lat, lon) {
	var service = new google.maps.DistanceMatrixService();
	var origin = new google.maps.LatLng(lat, lon);

	Canteens.each(function(canteen) {
		var destination = new google.maps.LatLng(canteen.get('location').latitude,
																canteen.get('location').longitude);

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
					ETA[canteen.id] = response.rows[0].elements[0].duration.value;
					canteen.set('user-ETA', Math.round(ETA[canteen.id]/60));
					canteen.set('arrivals', calculateArrivals(cnt_name));
					if(canteenTarget !== null && canteenTarget == canteen.id ) {
						socket.emit("update.ETA", {id: ID, canteen: canteenTarget, ETA: ETA[canteenTarget]});
					}

				}
		});
	});
}

$(document).ready(function(){
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(
			function(position) {
					calculateETA(position.coords.latitude, position.coords.longitude);
			},
			function(err) {
				console.error('ERROR(' + err.code + '): ' + err.message);
			}, {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0
			}
		);
	}

});


