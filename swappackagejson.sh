
___ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

__PO="$___ROOT/package.json" # original file
__PT="$___ROOT/package.tmp.json" # temp file

__P0MODE="npm"
__P1MODE="dev"

__P0="$___ROOT/package.$__P0MODE.json"
__P1="$___ROOT/package.$__P1MODE.json" # this file normally should exist all the time