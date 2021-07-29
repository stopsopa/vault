
if [ "$VAULT_VERSION" = "" ]; then

    echo "$0 error: VAULT_VERSION is not defined"

    exit 1
fi

curl --help > /dev/null 2> /dev/null

if [ "$?" != "0" ]; then

    echo "$0 error: curl is not available"

    exit 1        
fi

wget --help > /dev/null 2> /dev/null

if [ "$?" != "0" ]; then

    echo "$0 error: wget is not available"

    exit 1        
fi

unzip --help > /dev/null 2> /dev/null

if [ "$?" != "0" ]; then

    echo "$0 error: unzip is not available"

    exit 1        
fi

# set nocasematch option
# shopt -s nocasematch

ARCH=""

DARWIN="^[dD]arwin"
UNAME="$(uname -a)"
if [[ $UNAME =~ $DARWIN ]]; then

    ARCH="darwin"
else

    ARCH="linux"
fi

# detection here can be added too, but for now it's ok, since local mac is amd64 and target travis machine will be too
PROC="amd64"

__DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

# https://releases.hashicorp.com/vault/1.8.0/
DOWNLOAD_FILE="https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_${ARCH}_${PROC}.zip"

(
    cd "${__DIR}"

    if [ -f vault ]; then

        echo "vault file already exist - all good ${__DIR}/vault"

        exit 0
    fi

    STATUS="$(curl -s -I -XHEAD "$DOWNLOAD_FILE" | head -n 1 | awk '{ print $2 }')"

    if [ "$STATUS" != "200" ]; then

        echo "$0 error: couldn't download ${DOWNLOAD_FILE} - HEAD request with curl"

        exit 1        
    fi

    ZIPFILE="$(basename "$DOWNLOAD_FILE")"    

    if [ ! -f "$ZIPFILE" ]; then
        
        wget "$DOWNLOAD_FILE"
    fi

    unzip "$ZIPFILE"  

    if [ ! -f "vault" ]; then

        echo "$0 error: after wget and unzip 'vault' file still doesn't exist"

        exit 1        
    fi

    chmod a+x vault

    echo "$DOWNLOAD_FILE -> vault - done"
)