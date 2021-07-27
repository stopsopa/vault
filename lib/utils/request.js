
const URL = require('url').URL;

const https = require('https');

const http = require('http');

const querystring = require('querystring');

const se = require('nlab/se');

const th = msg => new Error(`request: ${String(msg)}`);

const log = console.log;

const isObject = require('nlab/isObject');

module.exports = function request(url, opt = {}) {

    let {
        method = 'GET',
        body = undefined,
        query = {},
        headers = {},
        timeout = 30 * 1000, // 30 sec
        verbose = false,
        decodejson = true,
    } = opt;

    if (typeof method !== 'string') {

        throw th(`method is not a string`);
    }

    method = method.toUpperCase();

    let rq;

    return new Promise((resolve, reject) => {

        const uri = new URL(url);

        const lib = (uri.protocol === 'https:') ? https : http;

        query = querystring.stringify(query);

        rq = {
            hostname: uri.hostname,
            port: uri.port || ((uri.protocol === 'https:') ? '443' : '80'),
            path: uri.pathname + uri.search + (query ? (uri.search.includes('?') ? '&' : '?') + query : ''),
            method,
            headers,
        };

        if (Array.isArray(body) || isObject(body)) {

            if (method === 'GET') {

                throw th(`body looks like json payload but request method is GET`);
            }

            // modyfying original 'rq' by reference            
            headers['Content-type'] = 'application/json; charset=utf-8';
        }

        if (verbose) {

            log({
                'request.js': rq,
            })
        }

        var req = lib.request(rq, res => {

            res.setEncoding('utf8');

            let body = '';

            res.on('data', chunk => {

                body += chunk
            });

            res.on('end', () => {

                try {

                    if (decodejson && (res.headers['content-type'] || '').includes('application/json')) {

                        body = JSON.parse(body);
                    }

                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body,
                    })
                }
                catch (e) {

                    if (verbose) {

                        log({
                            request_resolve_exception_catch: se(e),
                        })
                    }

                    reject({
                        type: 'endevent',
                        data: se(e),
                    });                    
                }
            });
        });

        req.on('socket', function (socket) { // uncomment this to have timeout

            socket.setTimeout(timeout);

            socket.on('timeout', () => { // https://stackoverflow.com/a/9910413

                try {
                    req.destroy();
                }
                catch (e) {
                    try {
                        req.abort(); // since v14.1.0 Use request.destroy() instead
                    }
                    catch (e) { }
                }

                reject({
                    type: 'timeout',
                    data: `timeout (${timeout}ms)`,
                })
            });
        });

        req.on('error', e => reject({
            type: 'error',
            data: se(e)
        }));

        if (Array.isArray(body) || isObject(body)) {

            req.write(JSON.stringify(body));
        }

        req.end();
    });
}