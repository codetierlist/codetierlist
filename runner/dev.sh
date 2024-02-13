#!/bin/sh

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

nodemon --legacy-watch ./src/index.ts &

wait -n
exit $?
