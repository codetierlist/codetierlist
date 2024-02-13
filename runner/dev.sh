#!/bin/sh

set -e

exec nodemon --legacy-watch ./src/index.ts
