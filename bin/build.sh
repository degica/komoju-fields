#!/bin/sh

set -e

# There are 2 steps here: the main bundle and a separate bundle for each payment type.
# The reason it's like this is because we don't want to serve unused payment types to users.
#
# The main bundle is shared code that's strictly necessary, and each payment type has its
# own field bundle, which is dynamic-imported by the main bundle.

ESBUILD=${ESBUILD:-"npx esbuild"}
ESBUILD_ARGS="--bundle --target=firefox100 --format=esm --loader:.html=text"

# Pass --production to minify the output
if [ "$1" = "--production" ]; then
  ESBUILD_ARGS="$ESBUILD_ARGS --minify --sourcemap=external"
  export ENV=${ENV:-"production"}
fi

rm -rf dist
mkdir -p dist

# Generate dynamic source files
bin/generate.sh

# Build the main bundle
$ESBUILD $ESBUILD_ARGS src/index.ts --outfile=dist/fields.js &

# Build the individual fields
for module in $(ls src/fields/*/module.ts); do
  $ESBUILD $ESBUILD_ARGS "$module" --outfile=$(dirname "$module" | sed 's/src/dist/')/module.js &
done

for module in $(ls src/extras/*/module.ts); do
  $ESBUILD $ESBUILD_ARGS "$module" --outfile=$(dirname "$module" | sed 's/src/dist/')/module.js &
done

# Copy over static assets
cp -r src/static dist/static

wait $(jobs -p)
