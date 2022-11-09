#!/bin/sh

find src -type f | entr -c -r -s bin/build.sh
