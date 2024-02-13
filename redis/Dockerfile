FROM redis

COPY redis.conf /usr/local/etc/redis/redis.conf
CMD ["/bin/sh", "-c", "redis-server --requirepass $REDIS_PASSWORD", "/usr/local/etc/redis/redis.conf"]