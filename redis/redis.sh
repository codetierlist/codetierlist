#!/bin/sh

set -e

exec redis-server /usr/local/etc/redis/redis.conf --requirepass $REDIS_PASSWORD
