#!/bin/sh

# The purpose of this script is to replace the values of the environment variables
# in the Nextjs build files with the actual values of the environment variables
# at runtime. This is necessary because Nextjs does not support environment variables
# in the build files.

echo "Check that we have keys in vars"
test -n "$ANON_KEY"
test -n "$API_URL"
test -n "$SELF_REGISTER"

echo "ANON_KEY: \t $ANON_KEY"
echo "API_URL: \t $API_URL"
echo "SELF_REGISTER: \t $SELF_REGISTER"
# Replace the values in the Nextjs build files with the actual values of the environment variables
# We are using dummy values in the build files to make it easier to find and replace them
# with the actual values of the environment variables.
#
# The dummy values are:
# - ANON_KEY_VALUE
# - API_URL_VALUE
# - SELF_REGISTER_VALUE
#
find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#ANON_KEY_VALUE#$ANON_KEY#g"
find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#http://API_URL_VALUE#$API_URL#g"
find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#SELF_REGISTER_VALUE#$SELF_REGISTER#g"

echo "Starting Webhood"
exec "$@"
