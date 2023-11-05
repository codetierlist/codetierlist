#!/bin/bash

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

npm run migrate
node ./out/index.js &

wait -n
exit $?