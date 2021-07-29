
[![Build Status](https://travis-ci.com/stopsopa/vault_prototype.svg?branch=master)](https://travis-ci.com/stopsopa/vault_prototype)
[![npm version](https://badge.fury.io/js/vault_prototype.svg)](https://badge.fury.io/js/vault_prototype)
[![codecov](https://codecov.io/gh/stopsopa/vault_prototype/branch/master/graph/badge.svg?token=QDL8DQ33UY)](https://codecov.io/gh/stopsopa/vault_prototype)



# Installation

```bash

yarn add vault_prototype

npm install vault_prototype

```

# Using token

```js

const vault_prototype = require('vault_prototype');

(async function () {

    try {

        const vault = vault_prototype({
            apiVersion: 'v1',
            endpoint: 'http://127.0.0.1:3370',
            token: 's.Jfium3aoAYNVvFHQpUxB8EGR' ,
        });

        const secrets = await vault.get(`secret/hello-world/data/test`);

        console.log(secrets)
    }
    catch (e) {

        console.log({
            general_vault_error: e
        })
    }

}());

```

# AppRole

https://www.vaultproject.io/docs/auth/approle#via-the-cli-1

```js

const vault_prototype = require('vault_prototype');

(async function () {

    try {

        const vault = vault_prototype({
            apiVersion: 'v1',
            endpoint: 'http://127.0.0.1:3370'
        });

        await vault.generateTokenAppRole({
            role_id     : process.env.VAULT_ROLE_ID,
            secret_id   : process.env.VAULT_SECRET_ID,
        });

        const secrets = await vault.get(`secret/hello-world/data/test`);

        console.log(secrets)
    }
    catch (e) {

        console.log({
            general_vault_error: e
        })
    }

}());

```

