#!/bin/bash

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

npm run migrate
nodemon ./src/index.ts &

wait -n
exit $?