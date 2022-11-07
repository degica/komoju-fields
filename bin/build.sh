#!/bin/sh

set -e

# There are 2 steps here: the main bundle and a separate bundle for each payment type.
# The reason it's like this is because we don't want to serve unused payment types to users.
#
# The main bundle is shared code that's strictly necessary, and each payment type has its
# own field bundle, which is dynamic-imported by the main bundle.

ESBUILD="npx esbuild --bundle --target=firefox100 --format=esm --loader:.html=text"

# Build the main bundle
$ESBUILD src/index.ts --outfile=dist/index.js &

# Build the individual fields
for module in $(ls src/fields/*/module.ts); do
  $ESBUILD $module --outfile=dist/$(dirname $module)/module.js &
done

wait $(jobs -p)
