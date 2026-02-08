#!/bin/bash
# BruceOps Smoke Test Script
# Tests core endpoints to verify the application is functioning correctly
# 
# Usage: ./scripts/smoke-test.sh [base_url]
# Default base_url: http://localhost:5000

BASE_URL="${1:-http://localhost:5000}"
PASS_COUNT=0
FAIL_COUNT=0

echo "=========================================="
echo "BruceOps Smoke Test"
echo "Base URL: $BASE_URL"
echo "Date: $(date)"
echo "=========================================="
echo ""

# Helper function to test an endpoint
test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected_status="$3"
    local check_content="$4"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        if [ -n "$check_content" ]; then
            if echo "$body" | grep -q "$check_content"; then
                echo "PASS (status: $status_code, contains: $check_content)"
                ((PASS_COUNT++))
                return 0
            else
                echo "FAIL (status: $status_code, missing content: $check_content)"
                ((FAIL_COUNT++))
                return 1
            fi
        else
            echo "PASS (status: $status_code)"
            ((PASS_COUNT++))
            return 0
        fi
    else
        echo "FAIL (expected: $expected_status, got: $status_code)"
        echo "  Response: $(echo "$body" | head -c 200)"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Test 1: Health endpoint
test_endpoint "Health Endpoint" "/api/health" "200" "status"

# Test 2: Health endpoint has required fields
echo -n "Testing Health Fields... "
health_response=$(curl -s "$BASE_URL/api/health" 2>/dev/null)
if echo "$health_response" | grep -q '"database"' && echo "$health_response" | grep -q '"ai_provider"'; then
    echo "PASS (database and ai_provider fields present)"
    ((PASS_COUNT++))
else
    echo "FAIL (missing required fields)"
    echo "  Response: $health_response"
    ((FAIL_COUNT++))
fi

# Test 3: Auth user endpoint (should return 401 when not authenticated, or user when authenticated)
echo -n "Testing Auth Status... "
auth_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/auth/user" 2>/dev/null)
auth_status=$(echo "$auth_response" | tail -n 1)
if [ "$auth_status" = "200" ] || [ "$auth_status" = "401" ]; then
    echo "PASS (auth endpoint responding: $auth_status)"
    ((PASS_COUNT++))
else
    echo "FAIL (unexpected status: $auth_status)"
    ((FAIL_COUNT++))
fi

# Test 4: Static assets (check if frontend is being served)
echo -n "Testing Frontend... "
frontend_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/" 2>/dev/null)
frontend_status=$(echo "$frontend_response" | tail -n 1)
frontend_body=$(echo "$frontend_response" | sed '$d')
if [ "$frontend_status" = "200" ] && echo "$frontend_body" | grep -q "<!DOCTYPE html>"; then
    echo "PASS (HTML served correctly)"
    ((PASS_COUNT++))
else
    echo "FAIL (status: $frontend_status)"
    ((FAIL_COUNT++))
fi

# Test 5: Export endpoint (requires authentication - tests 401 in unauthenticated state or 200 in standalone)
echo -n "Testing Export Endpoint... "
export_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/export/data" 2>/dev/null)
export_status=$(echo "$export_response" | tail -n 1)
if [ "$export_status" = "200" ] || [ "$export_status" = "401" ]; then
    if [ "$export_status" = "200" ]; then
        echo "PASS (export available - standalone mode)"
    else
        echo "PASS (export requires auth - expected in non-standalone)"
    fi
    ((PASS_COUNT++))
else
    echo "FAIL (unexpected status: $export_status)"
    ((FAIL_COUNT++))
fi

# Test 6: Weekly review endpoint
echo -n "Testing Weekly Review... "
weekly_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/review/weekly" 2>/dev/null)
weekly_status=$(echo "$weekly_response" | tail -n 1)
if [ "$weekly_status" = "200" ] || [ "$weekly_status" = "401" ]; then
    if [ "$weekly_status" = "200" ]; then
        echo "PASS (weekly review available)"
    else
        echo "PASS (weekly review requires auth - expected)"
    fi
    ((PASS_COUNT++))
else
    echo "FAIL (unexpected status: $weekly_status)"
    ((FAIL_COUNT++))
fi

echo ""
echo "=========================================="
echo "RESULTS"
echo "=========================================="
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "All tests PASSED"
    exit 0
else
    echo "Some tests FAILED"
    exit 1
fi
