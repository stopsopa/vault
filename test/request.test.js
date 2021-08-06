

const request = require('../lib/utils/request');

const se = require('nlab/se');

const log = require('inspc');

const origin = `http://${process.env.HOST}:${process.env.PORT}`;

describe('request.js - transport layer', () => {

    it('simple json', done => {

        (async () => {

            try {

                const data = await request(`${origin}/test`);

                // log(JSON.stringify(data, null, 4))

                delete data.headers.date;
                delete data.headers.etag;
                delete data.headers["content-length"];

                expect(data).toEqual({
                    "request": {
                        "hostname": process.env.HOST,
                        "port": process.env.PORT,
                        "path": "/test",
                        "method": "GET",
                        "headers": {}
                    },
                    "status": 200,
                    "headers": {
                        "x-powered-by": "Express",
                        "content-type": "application/json; charset=utf-8",
                        "connection": "close"
                    },
                    "body": {
                        "test": true,
                        query: {}
                    }
                });

                done()
            }
            catch (e) {
                
                log.dump({
                    se: se(e)
                });

                done(se(e))
            }
        })();
    });

    it('simple get in url', done => {

        (async () => {

            try {

                const data = await request(`${origin}/test?a=b&c=d`);

                // log(JSON.stringify(data, null, 4))

                delete data.headers.date;
                delete data.headers.etag;
                delete data.headers["content-length"];

                expect(data).toEqual({
                    "request": {
                        "hostname": process.env.HOST,
                        "port": process.env.PORT,
                        "path": "/test?a=b&c=d",
                        "method": "GET",
                        "headers": {}
                    },
                    "status": 200,
                    "headers": {
                        "x-powered-by": "Express",
                        "content-type": "application/json; charset=utf-8",
                        "connection": "close"
                    },
                    "body": {
                        "test": true,
                        query: {
                            a: 'b',
                            c: 'd',
                        }
                    }
                });

                done()
            }
            catch (e) {

                log.dump({
                    se: se(e)
                });

                done(se(e))
            }
        })();
    });

    it('simple get as query obj', done => {

        (async () => {

            try {

                const data = await request(`${origin}/test`, {
                    query: {
                        e: 'f'
                    }
                });

                // log(JSON.stringify(data, null, 4))

                delete data.headers.date;
                delete data.headers.etag;
                delete data.headers["content-length"];

                expect(data).toEqual({
                    "request": {
                        "hostname": process.env.HOST,
                        "port": process.env.PORT,
                        "path": "/test?e=f",
                        "method": "GET",
                        "headers": {}
                    },
                    "status": 200,
                    "headers": {
                        "x-powered-by": "Express",
                        "content-type": "application/json; charset=utf-8",
                        "connection": "close"
                    },
                    "body": {
                        "test": true,
                        query: {
                            e: 'f'
                        }
                    }
                });

                done()
            }
            catch (e) {

                log.dump({
                    se: se(e)
                });

                done(se(e))
            }
        })();
    });

    it('simple get as query and url', done => {

        (async () => {

            try {

                const data = await request(`${origin}/test?a=b&c=d`, {
                    query: {
                        e: 'f'
                    }
                });

                // log(JSON.stringify(data, null, 4))

                delete data.headers.date;
                delete data.headers.etag;
                delete data.headers["content-length"];

                expect(data).toEqual({
                    "request": {
                        "hostname": process.env.HOST,
                        "port": process.env.PORT,
                        "path": "/test?a=b&c=d&e=f",
                        "method": "GET",
                        "headers": {}
                    },
                    "status": 200,
                    "headers": {
                        "x-powered-by": "Express",
                        "content-type": "application/json; charset=utf-8",
                        "connection": "close"
                    },
                    "body": {
                        "test": true,
                        query: {
                            a: 'b',
                            c: 'd',
                            e: 'f'
                        }
                    }
                });

                done()
            }
            catch (e) {

                log.dump({
                    se: se(e)
                });

                done(se(e))
            }
        })();
    });

    it('raw response', done => {

        (async () => {

            try {

                const data = await request(`${origin}/raw`);

                // log(JSON.stringify(data, null, 4))

                delete data.headers.date;
                delete data.headers.etag;
                delete data.headers["content-length"];

                expect(data).toEqual({
                    "request": {
                        "hostname": process.env.HOST,
                        "port": process.env.PORT,
                        "path": "/raw",
                        "method": "GET",
                        "headers": {}
                    },
                    "status": 200,
                    "headers": {
                        "x-powered-by": "Express",
                        "connection": "close"
                    },
                    body: 'raw response'
                });

                done()
            }
            catch (e) {

                log.dump({
                    se: se(e)
                });

                done(se(e))
            }
        })();
    });

    it('wrongjson', done => {

        (async () => {

            try {

                await request(`${origin}/wrongjson`);

                done(`Should throw json parse error`);
            }
            catch (e) {

                delete e.data.stack;

                expect(e).toEqual({
                    "type": "endevent",
                    "data": {
                        "name": "SyntaxError",
                        "message": "Unexpected end of JSON input"
                    }
                })

                done();
            }
        })();
    });

    it('timeout', done => {

        (async () => {

            try {

                await request(`${origin}/timeout`, {
                    timeout: 1 * 1000,
                });

                done(`Should throw timeout error`);
            }
            catch (e) {

                delete e.data.stack;

                expect(e).toEqual({
                    "data": "timeout (1000ms)",
                    "type": "timeout",
                })

                done();
            }
        })();
    });

    it('json as an object - GET', done => {

        (async () => {

            try {

                await request(`${origin}/jsonobj`, {
                    body: {
                        a: 'b'
                    }
                });

                done(`Should complain about GET method`)
            }
            catch (e) {

                delete e.stack;

                expect(se(e)).toEqual({
                    "name": "Error",
                    "message": "request: body looks like json payload but request method is GET"
                })

                done();
            }
        })();
    });

    it('json as an object', done => {

        (async () => {

            const data = await request(`${origin}/jsonobj`, {
                method: 'post',
                body: {
                    a: 'b'
                }
            });

            delete data.headers.date;
            delete data.headers.etag;
            delete data.headers["content-length"];
            delete data.body.headers.host;

            // log(JSON.stringify(data, null, 4))

            expect(data).toEqual({
                "request": {
                    "hostname": process.env.HOST,
                    "port": process.env.PORT,
                    "path": "/jsonobj",
                    "method": "POST",
                    "headers": {
                        "Content-type": "application/json; charset=utf-8"
                    }
                },
                "status": 200,
                "headers": {
                    "x-powered-by": "Express",
                    "content-type": "application/json; charset=utf-8",
                    "connection": "close"
                },
                "body": {
                    "headers": {
                        "content-type": "application/json; charset=utf-8",
                        "connection": "close",
                        "transfer-encoding": "chunked"
                    },
                    "body": {
                        "a": "b"
                    }
                }
            });

            done()
        })();
    });

    it('just for coverage', done => {

        (async () => {

            try {

                await request(`${origin}/jsonobj`, {
                    method: 5
                });

                done(`Should report 'method not string'`)
            }
            catch (e) {

                delete e.stack;

                expect(se(e)).toEqual({
                    "name": "Error",
                    "message": "request: method is not a string",
                })

                done();
            }
        })();
    });
});