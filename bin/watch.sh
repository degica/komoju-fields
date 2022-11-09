#!/bin/sh

ls src/* | entr -c -r -s bin/build.sh
