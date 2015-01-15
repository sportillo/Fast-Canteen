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

var App = {

	canteens: null,
	canteensDOMContainer: null,

	render: function() {
		App.renderCanteens();
	},

	renderCanteens: function() {
		App.canteens.map(function(canteen) {

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

		_.each(canteen.seats, function(seat) {
			var $dom = $domCanteenContainer.find('#seat-'+seat.id);
			if ($dom.length === 0) {
				$domCanteenContainer.append( seat.render() );
				$dom = $domCanteenContainer.find('#seat-'+seat.id);
			}

			$dom.attr('data-value', ~~seat.value);
		});
	}

};