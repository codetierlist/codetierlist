#!/bin/bash

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

npm run migrate
nodemon --legacy-watch ./src/index.ts &

wait -n
exit $?
