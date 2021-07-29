
const request = require('./utils/request');

const log = console.log;

const errorFormatter = segment => msg => new Error(`vault_prototype ${segment} error: ${msg}`);

const instances = {};

function Vault(opt) {

    this.opt = opt;
}

/**
 * https://learn.hashicorp.com/tutorials/vault/getting-started-apis

    // raw curl request
        curl --request POST \
        --data '{"role_id": "463b4a3c-180d-885d-7587-589f1aadf103", "secret_id": "e3e0df1e-2269-7fff-b562-6726f0f2c9d8"}' \
        http://127.0.0.1:3370/v1/auth/approle/login | python -m json.tool

    generateTokenAppRole() // generate token from role_id and secret_id provided while vault connection was defined
        // by default token will be also saved in vailt object for future requests

    // other options:

    generateTokenAppRole({
        role_id: 'xxx',
        secret_id: 'xxx',
    }) - generate token based on given role_id and secret_id
        // by default token will be also saved in vailt object for future requests

    generateTokenAppRole({
        save: false,
    }) // token will be generated but not saved in vault object for future requests

    generateTokenAppRole({
        raw: true,
    }) // return raw http response from the method, not just the token itself

 */
Vault.prototype.generateTokenAppRole = async function (opt) {

    const {
        role_id,
        secret_id,
        save,
        raw,
        ...rest
    } = {
        save: true, // save by default in this object for furure requests
        role_id: this.opt.role_id,
        secret_id: this.opt.secret_id,
        ...opt,        
    };

    const th = errorFormatter('generateTokenAppRole');

    if ( typeof role_id !== 'string' ) {

        throw th(`role_id defined but is not a string`);
    }

    if ( ! role_id.trim() ) {

        throw th(`role_id defined but it is an empty string`);
    }

    if ( typeof secret_id !== 'string' ) {

        throw th(`secret_id defined but is not a string`);
    }

    if ( ! secret_id.trim() ) {

        throw th(`secret_id is an empty string`);
    }

    const res = await request(`${this.opt.endpoint}/v1/auth/approle/login`, {
        ...rest,
        method: 'POST',
        body: {
            role_id,
            secret_id,
        },
    });
    
    if (res.status === 200 && res.body && res.body.auth && res.body.auth.client_token && typeof res.body.auth.client_token === 'string') {

        if (save) {

            this.opt.token = res.body.auth.client_token;
        }

        if (raw) {
    
            return res;
        }

        return res.body.auth.client_token;        
    }

    throw res;
};

/**
 vault kv get  -output-curl-string -format=json secret/hello-world/data/test
 curl -H "X-Vault-Token: $(vault print token)" -H "X-Vault-Request: true" http://127.0.0.1:3370/v1/secret/hello-world/data/test
 */
Vault.prototype.get = async function (path, opt = {}) {

    const th = errorFormatter('get');

    if ( ! isObject(opt) ) {

        throw th(`opt is not an object`);
    }

    const {
        token,
    } = this.opt;

    const {
        raw,
        ...rest
    } = {
        ...opt,        
    };

    if ( typeof token !== 'string' ) {

        throw th(`token is not a string`);
    }
    
    const data = await request(`${this.opt.endpoint}/v1/${path}`, {
        ...rest,
        headers: {
            ...opt.headers,
            'X-Vault-Token': token,
            'X-Vault-Request': 'true',
        }
    });

    if ( isObject(data) && data.body && data.body.data && isObject(data.body.data) ) {

        if (raw) {

            return data;
        }

        return data.body.data;
    }

    throw data;
};

const reg = /^https?:\/\//i;

module.exports = (name, opt) => {

    // just to cover case when only one instance of vault will be handled in the project 
    // so developer don't wan't to provide the name, just 'default' is ok
    if ( isObject(name) ) {

        opt = name;

        name = 'default';
    }

    if ( name === undefined ) {

        name = 'default';
    }

    const th = errorFormatter('main function');

    if ( typeof name !== 'string' ) {

        throw th(`name is not a string`);
    }
    
    if ( ! name.trim() ) {
        
        throw th(`name is an empty string`);
    }
    
    if (opt === undefined) {
        
        if ( ! instances[name] ) {
            
            throw th(`instance[${name}] is not defined, first use require('vault_prototype')('${name}', {...options}) to define an instance`);
        }
        
        return instances[name];
    }  
    
    if ( ! isObject(opt) ) {
        
        throw th(`opt is not an object`);
    }

    // apiVersion: "v1",
    // endpoint: "http://127.0.0.1:8202",
    if ( typeof opt.apiVersion !== 'string' ) {

        throw th(`apiVersion is not a string`);
    }

    if ( ! opt.apiVersion.trim() ) {

        throw th(`apiVersion is an empty string`);
    }

    if ( typeof opt.endpoint !== 'string' ) {

        throw th(`endpoint is not a string`);
    }

    if ( ! reg.test(opt.endpoint) ) {

        throw th(`endpoint don't match regex ${reg}`);
    }

    if ( typeof opt.token !== 'undefined' ) {

        if ( typeof opt.token !== 'string' ) {

            throw th(`token defined but is not a string`);
        }
    
        if ( ! opt.token.trim() ) {
    
            throw th(`token defined but it is an empty string`);
        }
    }

    if ( typeof opt.role_id !== 'undefined' ) {

        if ( typeof opt.role_id !== 'string' ) {

            throw th(`role_id defined but is not a string`);
        }
    
        if ( ! opt.role_id.trim() ) {
    
            throw th(`role_id defined but it is an empty string`);
        }
    }

    if ( typeof opt.secret_id !== 'undefined' ) {

        if ( typeof opt.secret_id !== 'string' ) {

            throw th(`secret_id defined but is not a string`);
        }
    
        if ( ! opt.secret_id.trim() ) {
    
            throw th(`secret_id defined but it is an empty string`);
        }
    }

    return instances[name] = new Vault(opt);
};

// @doc https://github.com/stopsopa/nlab#isobject

// const a = function () {};
// a.prototype.other = 'other';
// const b = function (t) { this.id = t };
// b.prototype = Object.create(a.prototype);
// b.prototype.constructor = b;

// WARNING: above EXTENDED OBJECT is an object according to this test
// WARNING: array is not an object according to this
// to summarize:
// isObject([])                     -> false
// isObject(() => {})               -> false
// isObject(new b(1))               -> true     - better
// isObject(new function () {})     -> true
// isObject({})                     -> true
// ALSO WORTH TO MENTION:
// this function doesn't care if new b(1) has or not has 'toString' function implemented, so it's rather safe

//  ✓isObject - {}                                                  -> true
//  ✓isObject - using with object that have implemented toString()  -> true
//  ✓isObject - extended object                                     -> true
//  ✓isObject - new function () {}                                  -> true
//  ✓isObject - []                                                  -> false
//  ✓isObject - function () {}                                      -> false
//  ✓isObject - () => {}                                            -> false
//  ✓isObject - null                                                -> false
//  ✓isObject - true                                                -> false
//  ✓isObject - false                                               -> false
//  ✓isObject - NaN                                                 -> false
//  ✓isObject - undefined                                           -> false
//  ✓isObject - no arg                                              -> false
//  ✓isObject - 4                                                   -> false
//  ✓isObject - string                                              -> false
//  ✓isObject - Symbol('test')

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}
