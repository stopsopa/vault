

const log = require('inspc');

const se = require('nlab/se');

const vault = require('../lib/index');

beforeAll(async () => {

    const v = vault({
        apiVersion: 'v1',
        endpoint: `http://0.0.0.0:${process.env.VAULT_PORT}`,
        role_id: process.env.VAULT_ROLE_ID,
        secret_id: process.env.VAULT_SECRET_ID,
    });

    await v.generateTokenAppRole();
})

describe('main library', () => {

    it('get method', done => {
    
        (async function () {
    
            try {
    
                const v = vault(); // get instance of vault object 
                // in this case the default and only instance becasue 'name' is not provided
                
                expect(typeof v.opt.token === 'string').toEqual(true);
                
                expect(v.opt.token.substring(0, 2)).toEqual('s.');                                
                
                const secrets = await v.get(`secret/hello-world/data/test`, {
                    // verbose: true,
                });

                expect(secrets).toEqual({
                    "password": "my-long-password",
                    "xxx": "yyy"
                });
    
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