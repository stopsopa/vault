

const log = require('inspc');

const se = require('nlab/se');

const vault = require('../lib/index');

beforeAll(() => {

    vault({
        apiVersion: 'v1',
        endpoint: `http://127.0.0.1:${process.env.VAULT_PORT}`,
    });
});

describe('constructor & generateTokenAppRole', () => {

    it('generate token', done => {
    
        (async function () {
    
            try {
    
                const v = vault(); // get instance of vault object 
                // in this case the default and only instance becasue 'name' is not provided
    
                const token = await v.generateTokenAppRole({
                    role_id: process.env.VAULT_ROLE_ID,
                    secret_id: process.env.VAULT_SECRET_ID,
                });

                expect(typeof token === 'string').toEqual(true);
    
                expect(token.substring(0, 2)).toEqual('s.');
    
                done();
            }
            catch (e) {
    
                e = {
                    test_error: se(e),
                };
                
                log.dump(e);
    
                done(e);
            }
        }());
    });
});