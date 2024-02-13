#!/bin/sh

set -e

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

ssh-keygen -A
exec /usr/sbin/sshd -D -e "$@" &
