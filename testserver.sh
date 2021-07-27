
exec 3<> /dev/null
function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}

set -e
set -x

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

node testserver.js 