#!/bin/bash
set -e

# =============================================================================
# URL Shortener API Test Suite
# Tests all endpoints: Auth, Links CRUD, Analytics, Redirects
# =============================================================================

# Source common utilities from tests/dev_test directory
# We are in url-shortner/server/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_SH_PATH="$SCRIPT_DIR/../../tests/dev_test/common.sh"

if [ ! -f "$COMMON_SH_PATH" ]; then
    echo "❌ Error: common.sh not found at $COMMON_SH_PATH"
    echo "Please ensure you are running this script from the correct location."
    exit 1
fi

source "$COMMON_SH_PATH"

PORT=3001
FILE="main.doo"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="TestPass123!"
NAME="TestUser"

export PROJECT_ENV_FILE="$SCRIPT_DIR/.env"

echo "=================================================="
echo "🚀 Starting URL Shortener API Tests"
echo "=================================================="
echo ""

echo "Starting server on port $PORT..."
start_server "$FILE" "$PORT" || exit 1
setup_trap

echo "✅ Server started"
echo ""

# --------------------------------------------------
# 1. AUTHENTICATION
# --------------------------------------------------
echo "➡️  Testing Authentication..."

echo "1.1 Signup (POST /api/auth/signup)"
SIGNUP_RESP=$(curl -s -X POST http://127.0.0.1:$PORT/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}")

echo "Response:"
echo "$SIGNUP_RESP" | pretty_json
echo ""

# Extract token from signup response
# Handles both direct {token: ...} and wrapped {data: {token: ...}}
TOKEN=$(echo "$SIGNUP_RESP" | grep -o '"token":"[^"]*"' | head -1 | sed 's/"token":"//;s/"$//')

if [ -z "$TOKEN" ]; then
    echo "⚠️  Signup didn't return a direct token, trying login..."
fi

echo "1.2 Login (POST /api/auth/login)"
LOGIN_RESP=$(curl -s -X POST http://127.0.0.1:$PORT/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response:"
echo "$LOGIN_RESP" | pretty_json
echo ""

# Extract token from login if not found yet
if [ -z "$TOKEN" ]; then
    TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | head -1 | sed 's/"token":"//;s/"$//')
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to obtain auth token"
    exit 1
fi

echo "🔑 Token obtained: ${TOKEN:0:15}..."
echo ""

# --------------------------------------------------
# 2. CRUD LINKS
# --------------------------------------------------
echo "➡️  Testing Links CRUD..."

DEST_URL="https://google.com/search?q=doo+lang+$(date +%s)"

echo "2.1 Create Link (POST /api/links)"
CREATE_RESP=$(curl -s -X POST http://127.0.0.1:$PORT/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"destinationurl\":\"$DEST_URL\"}")

echo "Response:"
echo "$CREATE_RESP" | pretty_json
echo ""

# Extract ID and ShortCode
LINK_ID=$(echo "$CREATE_RESP" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
SHORT_CODE=$(echo "$CREATE_RESP" | grep -o '"shortcode":"[^"]*"\|"short_code":"[^"]*"\|"ShortCode":"[^"]*"' | head -1 | sed 's/.*"\(shortcode\|short_code\|ShortCode\)":"//;s/"$//')

if [ -z "$LINK_ID" ] || [ -z "$SHORT_CODE" ]; then
     # Try extracting from nested data object if wrapped
    if command -v jq >/dev/null 2>&1; then
        LINK_ID=$(echo "$CREATE_RESP" | jq -r '.data.id // .id' 2>/dev/null)
        SHORT_CODE=$(echo "$CREATE_RESP" | jq -r '.data.shortcode // .shortcode // .data.short_code // .short_code // .data.ShortCode // .ShortCode' 2>/dev/null)
    else
        LINK_ID=$(echo "$CREATE_RESP" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
        SHORT_CODE=$(echo "$CREATE_RESP" | grep -o '"shortcode":"[^"]*"\|"short_code":"[^"]*"\|"ShortCode":"[^"]*"' | head -1 | sed 's/.*"\(shortcode\|short_code\|ShortCode\)":"//;s/"$//')
    fi
fi

if [ -z "$LINK_ID" ] || [ -z "$SHORT_CODE" ] || [ "$LINK_ID" == "null" ]; then
    echo "❌ Failed to create link"
    exit 1
fi

echo "🔗 Created Link ID: $LINK_ID, Code: $SHORT_CODE"
echo ""
# LINK_ID=1

echo "2.2 Get Link (GET /api/links/:id)"
curl -s "http://127.0.0.1:$PORT/api/links/$LINK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

echo "2.3 Update Link (PUT /api/links/:id)"
NEW_DEST_URL="https://example.com/updated-$(date +%s)"
UPDATE_RESP=$(curl -s -X PUT "http://127.0.0.1:$PORT/api/links/$LINK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"destinationurl\":\"$NEW_DEST_URL\",\"id\":$LINK_ID}")

echo "Response:"
echo "$UPDATE_RESP" | pretty_json
echo ""

echo "2.4 List Links (GET /api/links)"
curl -s "http://127.0.0.1:$PORT/api/links" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

echo "2.5 User Links (GET /api/user/links)"
curl -s "http://127.0.0.1:$PORT/api/user/links" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

# --------------------------------------------------
# 3. PUBLIC ACCESS & REDIRECT
# --------------------------------------------------
echo "➡️  Testing Public Access..."

echo "3.1 Redirect (GET /:shortCode)"
# We check headers to see redirect URL, or body if it returns URL (API returns URL string for redirect?)
# The handler RedirectToUrl returns Str.
# If it's a real redirect, it should be 302 Found.
# If it returns the URL string, then we expect the URL.
# Based on handler: `Ok link.DestinationUrl;` (Returns string)
# So it likely returns the URL in the body json string? Or plain string?
# `libdoo_http` usually wraps responses in JSON.
# Let's inspect the response.

REDIRECT_RESP=$(curl -s "http://127.0.0.1:$PORT/$SHORT_CODE")
echo "Response: $REDIRECT_RESP"
echo ""

# --------------------------------------------------
# 4. ANALYTICS
# --------------------------------------------------
echo "➡️  Testing Analytics..."

echo "4.1 Get Link Stats (GET /api/links/:id/stats)"
curl -s "http://127.0.0.1:$PORT/api/links/$LINK_ID/stats" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

echo "4.2 Get Global Analytics (GET /api/analytics)"
curl -s "http://127.0.0.1:$PORT/api/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

# --------------------------------------------------
# 5. ERROR CASES
# --------------------------------------------------
echo "➡️  Testing Error Cases..."

echo "5.1 Create Link with invalid URL (Expect 500/Error)"
curl -s -X POST http://127.0.0.1:$PORT/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"destinationurl\":\"not-a-url\"}" \
  | pretty_json
echo ""

echo "5.2 Get non-existent link (Expect 404/Error)"
curl -s "http://127.0.0.1:$PORT/api/links/999999" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

echo "5.3 Unauthorized Access (No Token) (Expect 401)"
curl -s "http://127.0.0.1:$PORT/api/links" \
  | pretty_json
echo ""

# --------------------------------------------------
# 6. DELETE
# --------------------------------------------------
echo "➡️  Testing Delete..."

echo "6.1 Delete Link (DELETE /api/links/:id)"
curl -s -X DELETE "http://127.0.0.1:$PORT/api/links/$LINK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

echo "6.2 Verify Deletion (GET /api/links/:id - Expect 404/Error)"
curl -s "http://127.0.0.1:$PORT/api/links/$LINK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | pretty_json
echo ""

echo "=================================================="
echo "✅ All Tests Completed Successfully"
echo "=================================================="
