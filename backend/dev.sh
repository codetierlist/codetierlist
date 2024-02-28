#!/bin/sh

set -e

npm run migrate
exec ./node_modules/.bin/nodemon --legacy-watch
