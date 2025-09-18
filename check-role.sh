#!/bin/bash
# check-role.sh
# Usage: ./check-role.sh <email>

if [ -z "$1" ]; then
    echo "Usage: ./check-role.sh <email>"
    echo "Example: ./check-role.sh user@example.com"
    exit 1
fi

EMAIL=$1
BASE_URL=${BASE_URL:-"http://localhost:3737"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@example.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"adminpassword"}

echo "Checking role of user $EMAIL"

# First, authenticate to get JWT token
echo "Authenticating admin..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/user/signin" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_name\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

# Extract token from response (assuming the response has auth_token field)
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"auth_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to authenticate. Response: $AUTH_RESPONSE"
    exit 1
fi

echo "Authenticated successfully. Checking role..."

# Now check the role
RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/role/$EMAIL" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $RESPONSE"

# Check if the response contains success message
if echo "$RESPONSE" | grep -q "Success"; then
    echo "✅ Successfully retrieved role for user $EMAIL!"
    # Extract and display the role information
    echo "$RESPONSE" | grep -o '"data":{[^}]*}' | sed 's/"data"://'
else
    echo "❌ Failed to check user role. Check the response above for details."
fi
