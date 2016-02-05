
// ---------------------------------------------------------------------------------------
// Set up server locally

// Directive to load http module and store returned HTTP instance
var http = require('http');
// Create server instance and bind it at port 8081 using listen. Waits for request over 8081
http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   response.end('Hello World\n');
}).listen(8081);
// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');
// ----------------------------------------------------------------------------------------
// Event handling

// Import events module
var events = require('events');
// Create an eventEmitter object.
// eventEmitter.on('eventname','action (function)')
// eventEmitter.emit('eventname')
var eventEmitter = new events.EventEmitter();
// ------------------------------------------------------------------------------------------

