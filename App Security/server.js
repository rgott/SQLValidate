var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {

    fs.readFile('./public/index.html', function (err, html) {
        if (err) {
            throw err;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
}).listen(process.env.PORT || 8080);

   