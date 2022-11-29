#!/bin/sh

bin/watch.sh &
bin/test-app.sh &
wait $(jobs -p)
