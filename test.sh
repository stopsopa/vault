
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

    { red "\nnode_modules/.bin/jest - doesn't exist\n"; } 2>&3

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

function cleanup {
    
    ps aux | grep "$KILLFLAG" | grep -v grep | awk '{print $2}' | xargs kill
}

trap cleanup EXIT

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