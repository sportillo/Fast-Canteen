var socket = io();

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


var App = new AppView();

$(document).bind('touchmove', false);

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
	});
}