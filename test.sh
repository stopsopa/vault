
exec 3<> /dev/null
function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}

if [ "$1" = "--help" ]; then

cat << EOF

    /bin/bash $0 --help
    /bin/bash $0 --watch
    /bin/bash $0 --watchAll
    /bin/bash $0 --watchAll -t filter_tests_with_this_string

EOF

    exit 0
fi

set -e
set -x

if [ -f node_modules/.bin/jest ]; then  # exist

    { green "node_modules/.bin/jest - exists"; } 2>&3
else

    { red "\nnode_modules/.bin/jest - doesn't exist\nrun: make yarn\n"; } 2>&3

    exit 1;
fi

_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

eval "$(/bin/bash bash/exportsource.sh "$_DIR/.env")"

if [ "$HOST" = "" ]; then

    { red "HOST env is not defined\n"; } 2>&3    

    exit 1
fi

if [ "$PORT" = "" ]; then

    { red "PORT env is not defined\n"; } 2>&3    

    exit 1
fi

if [ "$KILLFLAG" = "" ]; then

    { red "KILLFLAG env is not defined\n"; } 2>&3    

    exit 1
fi

if [ "$VAULT_PORT" = "" ]; then

    { red "VAULT_PORT env is not defined\n"; } 2>&3    

    exit 1
fi

if [ "$VAULT_DIR" = "" ]; then

    { red "VAULT_DIR env is not defined\n"; } 2>&3    

    exit 1
fi

export VAULT_DIR="$(pwd)/$VAULT_DIR"

echo "VAULT_DIR=$VAULT_DIR"

# make sure to download vault.sh
VAULTSH="$_DIR/vault/vault.sh"

if [ ! -f "$VAULTSH" ]; then

    { green "downloading vault.sh"; } 2>&3    

    curl http://stopsopa.github.io/pages/vault/vault.sh --output "$VAULTSH"
fi

function cleanup {
    
    set +e;

    ps aux | grep "$KILLFLAG" | grep -v grep | awk '{print $2}' | xargs kill

    export VAULT_DIR="$_DIR/vault" 
    
    (
        cd "$_DIR/vault" 
        /bin/bash "$VAULTSH" destroy
    )

    echo "(export VAULT_DIR=\"$_DIR/vault\" && cd \"$_DIR/vault\" && /bin/bash \"$VAULTSH\" destroy)"
}

trap cleanup EXIT

# ==== run vault ===== vvv

/bin/bash vault/download_vault_binary.sh

export VAULT_BINARY="$(cd vault && pwd)/vault"

alias vault='$VAULT_BINARY'

echo VAULT_BINARY "$VAULT_BINARY"

/bin/bash "$VAULTSH" start

sleep 1

VSTATUS="$(curl 0.0.0.0:$VAULT_PORT/ui/ -I | head -n 1 | awk '{ print $2 }')"

if [ "$VSTATUS" != "200" ]; then

    { red "0.0.0.0:$VAULT_PORT is expected to respond with status code 200, it responded with '$VSTATUS'\n"; } 2>&3    

    exit 1
fi


export VAULT_ADDR="http://0.0.0.0:$VAULT_PORT";
export VAULT_TOKEN="$(cat "$VAULT_DIR/_root_token.txt")";

vault status

rm -rf "$VAULT_DIR/logs/initvault.log"

source "$VAULT_DIR/initvault.sh" 1>> "$VAULT_DIR/logs/initvault.log" 2>> "$VAULT_DIR/logs/initvault.log"

vault token lookup

echo == VAULT_ROLE_ID $VAULT_ROLE_ID

echo == VAULT_SECRET_ID $VAULT_SECRET_ID

# ==== run vault ===== ^^^



/bin/bash "$_DIR/bash/proc/run-with-flag-and-kill.sh" "$KILLFLAG" node testserver.js &

sleep 1; # give the server some time to spin up

## --bail \
#TEST="$(cat <<END
#$JEST \
#$@ \
#--roots test \
#--verbose \
#--runInBand \
#--modulePathIgnorePatterns test/examples test/jest test/minefield test/project test/puppeteer karma_build
#END
#)";

# --bail \
TEST="$(cat <<END
node node_modules/.bin/jest \
$@ \
--roots test \
--verbose \
--runInBand
END
)";

{ green "\n\n    executing tests:\n        $TEST\n\n"; } 2>&3

$TEST

STATUS=$?

if [ "$STATUS" = "0" ]; then

    { green "\n    Tests passed\n"; } 2>&3
else

    { red "\n    Tests crashed\n"; } 2>&3

    exit $STATUS
fi