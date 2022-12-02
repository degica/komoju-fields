#!/bin/sh

# This script should be run once before developing.

bin/generate.sh
npm install
(cd test-app && npm install)
