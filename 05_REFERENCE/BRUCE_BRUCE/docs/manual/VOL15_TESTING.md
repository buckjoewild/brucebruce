# VOLUME 15: TESTING GUIDE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 15.1 Testing Strategy

### Test Levels

| Level | Purpose | Tools |
|-------|---------|-------|
| Smoke Test | Basic functionality | shell script |
| Type Check | Static analysis | TypeScript |
| E2E | User workflows | Playwright |
| Manual | Visual verification | Browser |

---

## 15.2 Smoke Test

### Location

`scripts/smoke-test.sh`

### Tests Performed

1. **Health Endpoint** - `/api/health` returns 200
2. **Health Fields** - Response has required fields
3. **Auth Status** - `/api/me` handles auth correctly
4. **Frontend** - Returns HTML
5. **Export Endpoint** - `/api/export/data` works
6. **Weekly Review** - `/api/review/weekly` works

### Running

```bash
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh
```

### Expected Output

```
=== BruceOps Smoke Test ===
[PASS] Health endpoint returns 200
[PASS] Health response has required fields
[PASS] Auth endpoint properly protected
[PASS] Frontend returns HTML
[PASS] Export endpoint works
[PASS] Weekly review endpoint works
=== All tests passed ===
```

---

## 15.3 Type Checking

### Running

```bash
npm run check
```

### Common Errors

**Property does not exist:**
```typescript
// Error: Property 'newField' does not exist
// Fix: Add to schema or type definition
```

**Type mismatch:**
```typescript
// Error: Type 'string' is not assignable to type 'number'
// Fix: Correct the type or add conversion
```

---

## 15.4 E2E Testing with Playwright

### Test Plan Template

```
1. [New Context] Create a new browser context
2. [Browser] Navigate to page
3. [Browser] Interact with elements
4. [Verify] Assert expected state
```

### Example: LifeOps Log Creation

```
1. [New Context] Create a new browser context
2. [Browser] Navigate to /life-ops
3. [Browser] Toggle exercise checkbox (data-testid="checkbox-exercise")
4. [Browser] Set energy slider to 7 (data-testid="slider-energy")
5. [Browser] Select day type "work" (data-testid="select-day-type")
6. [Browser] Enter top win text "Completed project"
7. [Browser] Click save button (data-testid="button-save-log")
8. [Verify] Toast appears with success message
9. [Verify] Log appears in history list
```

### Example: Goal Check-in

```
1. [New Context] Create a new browser context
2. [Browser] Navigate to /goals
3. [Verify] Goals list is displayed
4. [Browser] Toggle check-in for first goal (data-testid="checkbox-checkin-1")
5. [Verify] Check-in is marked as done
6. [Verify] Progress indicator updates
```

---

## 15.5 Test Data IDs

### Interactive Elements

| Element | Pattern | Example |
|---------|---------|---------|
| Button | `button-{action}` | `button-save-log` |
| Input | `input-{field}` | `input-title` |
| Checkbox | `checkbox-{field}` | `checkbox-exercise` |
| Select | `select-{field}` | `select-day-type` |
| Slider | `slider-{field}` | `slider-energy` |
| Link | `link-{target}` | `link-dashboard` |

### Display Elements

| Element | Pattern | Example |
|---------|---------|---------|
| Text | `text-{content}` | `text-username` |
| Status | `status-{type}` | `status-completion` |
| Card | `card-{type}-{id}` | `card-idea-123` |
| Row | `row-{type}-{id}` | `row-goal-456` |

---

## 15.6 Manual Testing Checklist

### LifeOps

- [ ] Navigate to /life-ops
- [ ] Toggle all 8 vice checkboxes
- [ ] Adjust all 8 metric sliders
- [ ] Select all quick context options
- [ ] Enter reflection prompts
- [ ] Save log
- [ ] View log in history
- [ ] Update existing log
- [ ] Generate AI summary

### Goals

- [ ] Navigate to /goals
- [ ] Create new goal
- [ ] Set all goal fields
- [ ] Mark check-in complete
- [ ] Add check-in note
- [ ] Update goal status
- [ ] View goals by domain

### ThinkOps

- [ ] Navigate to /think-ops
- [ ] Quick capture idea
- [ ] Deep capture idea
- [ ] Run reality check
- [ ] View K/L/S breakdown
- [ ] Update idea status
- [ ] Set priority

### Weekly Review

- [ ] Navigate to /weekly-review
- [ ] View completion chart
- [ ] View domain breakdown
- [ ] View drift flags
- [ ] Generate AI insight
- [ ] Export review

### Settings

- [ ] Navigate to /settings
- [ ] Change theme
- [ ] Toggle reminder
- [ ] Export all data

---

## 15.7 API Testing

### Health Check

```bash
curl -s http://localhost:5000/api/health | jq .
```

### Create Log (authenticated)

```bash
# Get session cookie from browser, then:
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "date": "2025-12-28",
    "energy": 7,
    "stress": 4
  }'
```

### List Goals

```bash
curl http://localhost:5000/api/goals \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

---

## 15.8 Testing AI Features

### Test Prompts

**Reality Check:**
1. Create idea with clear problem
2. Run reality check
3. Verify JSON response structure
4. Verify K/L/S classification makes sense
5. Verify flags are relevant

**Weekly Insight:**
1. Ensure some goals and check-ins exist
2. Generate insight
3. Verify actionable recommendation
4. Verify caching (second call returns cached)

**Log Summary:**
1. Create log with data
2. Generate summary
3. Verify factual (not advice)
4. Verify pattern signals identified

---

## 15.9 Load Testing

### Basic Load Test

```bash
# Simple concurrent requests
for i in {1..10}; do
  curl -s http://localhost:5000/api/health &
done
wait
```

### Performance Baseline

| Endpoint | Expected | Max |
|----------|----------|-----|
| /api/health | <50ms | 200ms |
| /api/logs | <100ms | 500ms |
| /api/review/weekly | <200ms | 1s |
| AI endpoints | <5s | 30s |

---

## 15.10 Regression Testing

### After Schema Changes

1. Run `npm run db:push`
2. Run smoke test
3. Verify affected pages load
4. Test CRUD operations

### After Route Changes

1. Run smoke test
2. Test affected endpoints manually
3. Verify frontend queries work

### After AI Changes

1. Test each AI endpoint
2. Verify JSON parsing works
3. Verify fallback behavior

---

**Next Volume:** [VOL16 - Maintenance Guide](./VOL16_MAINTENANCE.md)
