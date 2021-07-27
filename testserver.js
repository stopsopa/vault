
const path      = require('path');

const fs        = require('fs');

const express   = require('express');

const log       = require('inspc');

const host      = process.env.HOST;

const port      = process.env.PORT;

const web       = path.resolve(__dirname, 'public');

const app       = express();

app.use(express.urlencoded({extended: false}));

app.use(express.json());

app.use(express.static(web, { // http://expressjs.com/en/resources/middleware/serve-static.html
    // maxAge: 60 * 60 * 24 * 1000 // in milliseconds
    maxAge: '356 days', // in milliseconds max-age=30758400
    setHeaders: (res, path) => {

        if (/\.bmp$/i.test(path)) { // for some reason by default express.static sets here Content-Type: image/x-ms-bmp

            res.setHeader('Content-type', 'image/bmp')
        }

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        // res.setHeader('Cache-Control', 'public, no-cache, max-age=30758400')
        // res.setHeader('Cache-Control', 'public, only-if-cached')
    }
}));

app.all('/test', (req, res) => {

    res.json({
        test: true,
        query: req.query,
    })
});


app.all('/raw', (req, res) => {

    res.end('raw response')
});

app.all('/wrongjson', (req, res) => {

    res.set('content-type', 'application/json; charset=utf-8');

    const data = JSON.stringify({
        a: 'b'
    });

    res.end(data.substring(0, data.length - 3));
});

app.all('/timeout', (req, res) => {

    setTimeout(() => {

        res.end('too late');
        
    }, 2000);
});

app.all('/jsonobj', (req, res) => {
    
    res.json({
        headers: req.headers,
        body: req.body,
    })
});

app.listen(port, host, () => {

    console.log(`\n 🌎  Server is running ` + `http://${host}:${port}\n`)
});