
yarn:
	/bin/bash bash/swap-files.sh -m dev -- yarn

tests:
	/bin/bash test.sh	

testwatch:
	/bin/bash test.sh --watchAll | tee log.log

coverage:
	node coverageserver.js --port 8088 --dir public/coverage

# maintenance	
pack:
	npm pack

publish:
	npm version patch
	npm publish --access=public
	echo ""
	echo visit
	node bash/node/json/get.js package.json homepage




