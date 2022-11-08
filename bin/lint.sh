#!/bin/sh

set -e

# This script performs full type checking with the Typescript compiler.
#
# For actual builds, we use esbuild because it's way faster. See build.sh.

TSC="npx tsc --strict --noEmit --target es2020 --lib es2020,dom --module esnext"

# Lint the main bundle (see bin/build.sh for more info on why we have separate bundles like this)
$TSC src/index.ts
echo src/index.ts OK

# Lint the individual fields
for module in $(ls src/fields/*/module.ts); do
  $TSC "$module"
  echo "$module" OK
done
