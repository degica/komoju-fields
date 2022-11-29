#!/bin/sh

set -e

# This script performs full type checking with the Typescript compiler.
#
# For actual builds, we use esbuild because it's way faster. See build.sh.

TSC=${TSC:-"npx tsc"}
TSC_ARGS="--strict --noEmit --target es2020 --lib es2020,dom --module esnext"

# Generate dynamic source files
bin/generate.sh

# Lint the main bundle (see bin/build.sh for more info on why we have separate bundles like this)
$TSC $TSC_ARGS src/index.ts
echo BUNDLE: src/index.ts OK

# Lint the individual fields
for module in $(ls src/fields/*/module.ts); do
  $TSC $TSC_ARGS "$module"
  echo BUNDLE: "$module" OK
done
