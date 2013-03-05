#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

var clients = new Array();

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');

      return;
    }

    var connection = request.accept('osc', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    //console.log(request.remoteAddress);
    clients.push(connection.remoteAddress);
    console.log(clients);
    var dgram = require('dgram');

    var message2 = new Buffer("0,0,"+(clients.indexOf(connection.remoteAddress)+0)+",add");
            console.log(message2);
            var client = dgram.createSocket('udp4');
            client.send(message2, 0, message2.length, 8899, '127.0.0.1', function(err, bytes) {
                if (err) throw err;
                //console.log('UDP message sent');
                client.close();
    });


    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);
			//console.log(connection.socket.remoteAddress);

            var PORT = 8899;
			var HOST = '127.0.0.1';

			var dgram = require('dgram');

			var message2 = new Buffer(message.utf8Data+","+(clients.indexOf(connection.remoteAddress)+0));
            //console.log(message2);
			var client = dgram.createSocket('udp4');
			client.send(message2, 0, message2.length, PORT, HOST, function(err, bytes) {
				if (err) throw err;
				//console.log('UDP message sent to ' + HOST +':'+ PORT);
				client.close();
			});
            
			//connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        clients.splice(clients.indexOf(connection.remoteAddress), 1);
        console.log(clients);
    });
});

var connect = require('connect');
connect.createServer(function (request, response) {
 
    console.log('request starting...');
     
    fs.readFile('./hero_cl/hero1.html', function(error, content) {
        if (error) {
            response.writeHead(500);
            response.end();
        }
        else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(content, 'utf-8');
        }
    });
     
}).listen(80);