#!/bin/sh

set -e

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

npm run migrate
exec nodemon --legacy-watch ./src/index.ts
