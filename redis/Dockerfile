FROM redis

COPY redis.conf /usr/local/etc/redis/redis.conf
CMD ["redis-server", "--requirepass", "$REDIS_PASSWORD", "/usr/local/etc/redis/redis.conf"]
