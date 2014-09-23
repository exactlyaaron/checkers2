var http = require('http');
var connect = require('connect'), serveStatic = require('serve-static');
var directory = 'public';
var logger = require('morgan');
var port = process.env.PORT;

var app = connect()
  .use(logger(':remote-addr -> :method :url [:status]'))
  .use(serveStatic(directory));

http.createServer(app).listen(port, function(){
  console.log('Node server listening. Port: ' + port + ', Directory: ' + directory);
});
