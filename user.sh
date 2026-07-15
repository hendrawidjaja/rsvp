#!/bin/bash

API="http://localhost:8080/api"

# Step 1: Register as user
echo "Registering user..."
USER_RES=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"hendra4widjaja@gmail.com","password":"1q2w3e4r","name":"Hendra Widjaja"}')

echo "$USER_RES"

TOKEN=$(echo "$USER_RES" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed or account already exists"
  echo "Trying login instead..."
  LOGIN_RES=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"hendra4widjaja@gmail.com","password":"1q2w3e4r"}')
  echo "$LOGIN_RES"
  TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Got token"

# Step 2: Create tenant profile
echo "Creating provider profile..."
curl -s -X POST "$API/tenant/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tenant_type":"developer","phone":"+628123456789"}'

echo ""
echo "✅ Provider account created!"
echo "Email: hendra4widjaja@gmail.com"
echo "Pass: 1q2w3e4r"
echo "Login as provider at: http://localhost:3000"