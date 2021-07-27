
yarn:
	/bin/bash bash/swap-files.sh -m dev -- yarn

tests:
	/bin/bash test.sh	

coverage:
	node coverageserver.js --port 8088 --dir public/coverage



