#!/bin/sh

set -e

# This script will populate src/generated with some dynamic stuff.
# The main reason is so that we can have an array of supported payment types
# that doesn't need to be maintained by hand.
#
# Try to keep these deterministic, as the output is checked into git and so any
# changes will show up in diffs.

mkdir -p src/generated

file="src/generated/supported-payment-types.ts"
echo '// Generated by bin/generate.sh'                                             > $file
echo '//'                                                                         >> $file
echo '// List of supported payment types comes from the folders in src/fields/*.' >> $file
echo '// To add a new one, simply add a new folder.'                              >> $file
echo >> $file
echo 'const supported: Set<string> = new Set();'                                  >> $file
supported_payment_types=$(/bin/ls src/fields)
for payment_type in $supported_payment_types; do
  echo "supported.add('$payment_type');"                                          >> $file
done
echo 'export default supported;'                                                  >> $file
echo "Generated $file"