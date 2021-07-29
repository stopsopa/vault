
__DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

__ROOT="$_DIR/.."

if [ "$VAULT_ADDR" = "" ]; then

    echo 'VAULT_ADDR is not defined'

    exit 1;
fi

if [ "$VAULT_TOKEN" = "" ]; then

    echo 'VAULT_TOKEN is not defined'

    exit 1;
fi

set -x
set +e

echo ""
echo "export VAULT_ADDR=$VAULT_ADDR"
echo "export VAULT_TOKEN=$VAULT_TOKEN"
echo ""

sleep 10

vault status

vault auth list
vault auth enable approle   
vault auth list

vault policy write hello-world - << EOF
path "secret/hello-world/*" {
    capabilities = ["read", "list"]
}
EOF

vault write auth/approle/role/hello-world  secret_id_ttl=120m  token_ttl=60m  token_max_tll=120m  policies="hello-world"
# vault write auth/approle/role/hello-world  secret_id_ttl=0 token_ttl=0  token_max_tll=0  policies="hello-world"

export VAULT_ROLE_ID="$(vault read -field=role_id auth/approle/role/hello-world/role-id)"

export VAULT_SECRET_ID="$(vault write -field=secret_id -f auth/approle/role/hello-world/secret-id)"

echo VAULT_ROLE_ID $VAULT_ROLE_ID

echo VAULT_SECRET_ID $VAULT_SECRET_ID

vault secrets enable -path=secret kv

vault kv put secret/hello-world/data/test password="my-long-password" xxx="yyy"





