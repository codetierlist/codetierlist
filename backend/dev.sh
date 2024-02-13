#!/bin/sh

set -e

npm run migrate
exec nodemon --legacy-watch ./src/index.ts
