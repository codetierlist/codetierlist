#!/bin/bash

trap 'kill -SIGTERM $(jobs -p)' SIGTERM
trap 'kill -SIGINT $(jobs -p)' SIGINT

ssh-keygen -A
/usr/sbin/sshd -D -e "$@" &

wait -n
exit $?
