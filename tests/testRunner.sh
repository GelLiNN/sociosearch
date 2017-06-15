#!/bin/bash
echo $PWD
./bin/start -test &
sleep 2
# Run each test file with given executable if needed
./node_modules/phantomjs/bin/phantomjs ../tests/console-errors-test.js
