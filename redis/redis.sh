#!/bin/sh

set -e

exec redis-server /usr/local/etc/redis/redis.conf --requirepass ${REDIS_PASSWORD?you forgot to add REDIS_PASSWORD to the environment}
```
