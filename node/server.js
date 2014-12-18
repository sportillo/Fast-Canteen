var http = require("http");
var parsed = '';

http.createServer(function(request, response){
	http.get('http://localhost:8080/proxy/coap://localhost:PORT/canteen', function(res){
		var data = '';
        var body = '';
        res.on('data', function(d) {
            data += d;
        });
        body += "<h2>Canteena</h2>";
        body += "<div style='width:600px; height:300px; border:1px solid #ccc'>";
        res.on('end', function() {
            var json = JSON.parse(data);
            for(var id in json.Sensors){
                var value = json.Sensors[id].Resource.Value;
                console.log(value);
                var color = 'red';
                if(value == 1)
                    color = 'green';
                body += "<svg height='100' width='100'><circle cx='50' cy='50' r='40' stroke='black' stroke-width='3' fill='"+color+"' /></svg>";
            }

        body+="</div>";
            // Data reception is done, do whatever with it!
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(body);

			response.end();
        });


	});
}).listen(8888);
