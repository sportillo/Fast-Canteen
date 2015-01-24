/* FOR TESTING */
canteens['cammeo'] = new Canteen('cammeo');
canteens['martiri'] = new Canteen('martiri');
canteens['betti'] = new Canteen('betti');
canteens['rosellini'] = new Canteen('rosellini');

	io.emit('update.canteen', canteens['cammeo'].toJSON());
	io.emit('update.canteen', canteens['martiri'].toJSON());
	io.emit('update.canteen', canteens['betti'].toJSON());
	io.emit('update.canteen', canteens['rosellini'].toJSON());

for (var c in canteens)
{
	canteens[c].updateQueue(0, Math.round(Math.random() * 30)+10);

	for (var i = 0; i < 100; i++)
		canteens[c].updateSeatAt(i, Math.round(Math.random()));

	var numPers = Math.round(Math.random() * 50);
	for (var i = 0; i < numPers; i++)
		canteens[c].ETA[i] = Math.round(Math.random() * 3600);
}

/* SIMULATE USERS AND SEAT UPDATE */
setInterval( function() {
	for(var c in canteens) {
		var queueRemove = (Math.random() < 0.1);
		var queueInsert = (Math.random() < 0.1);
		var freeSeat = (Math.random() < 0.15);

		if (queueRemove)
		{
			canteens[c].queue[0] -= 1;

			var randomSeatId = Math.round(Math.random() * 99);
			while (canteens[c].seats[randomSeatId].getValue() === 0)
			{
				randomSeatId = Math.round(Math.random() * 99);
			}

			canteens[c].updateSeatAt(randomSeatId, 0);
		}

		if (freeSeat) {

			var randomSeatId = Math.round(Math.random() * 99);
			while (canteens[c].seats[randomSeatId].getValue() === 1)
			{
				randomSeatId = Math.round(Math.random() * 99);
			}

			canteens[c].updateSeatAt(randomSeatId, 1);
		}

		if (queueInsert)
			canteens[c].queue[0] += 1;

		io.emit('update.canteen', canteens[ c ].toJSON());
	}
}, 1000);