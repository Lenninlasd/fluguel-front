var express = require('express'),
 	app = express(),
 	cors = require('cors'),
 	port = 3000;

var http = require('http').Server(app);

// app.use(cors());
app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

http.listen(port, function(){
	console.log('Listen on Port ' + port);
});
