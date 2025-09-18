#!/bin/bash
# change-role.sh
# Usage: ./change-role.sh <email> <role>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./change-role.sh <email> <role>"
    echo "Example: ./change-role.sh user@example.com admin"
    echo "Available roles: instructor, teacher, admin, student, secretary"
    exit 1
fi

EMAIL=$1
ROLE=$2
BASE_URL=${BASE_URL:-"http://localhost:3737"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@example.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"adminpassword"}

echo "Changing role of user $EMAIL to $ROLE"

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

echo "Authenticated successfully. Changing role..."

# Now change the role
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/change-role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"email\": \"$EMAIL\",
    \"role\": \"$ROLE\"
  }")

echo "Response: $RESPONSE"

# Check if the response contains success message
if echo "$RESPONSE" | grep -q "changé avec succès"; then
    echo "✅ User $EMAIL has been successfully changed to $ROLE!"
else
    echo "❌ Failed to change user role. Check the response above for details."




# Invoke-WebRequest -Uri http://localhost:3737/api/users/change-role -Method PUT -ContentType "application/json" -Body '{"email": "birushandegeya@gmail.com", "role": "admin"}'
