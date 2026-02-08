# VOLUME 8: USER WORKFLOWS

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 8.1 Daily LifeOps Workflow

### Morning Check-in Flow

```
1. Navigate to /life-ops
   └── Dashboard link or sidebar

2. Check existing log
   └── System checks for today's date

3. Fill daily calibration form
   ├── Vice toggles (8 boolean)
   ├── Life metrics (8 scales 1-10)
   ├── Quick context selects
   └── Reflection prompts (text)

4. Save log
   └── POST /api/logs

5. Optional: Generate AI summary
   └── POST /api/logs/summary

6. Review saved log
   └── Displayed in log list
```

### Form Sections

#### Vice Tracking
- Toggle each vice on/off
- Default: all off
- Tracks: vaping, alcohol, junkFood, doomScrolling, lateScreens, skippedMeals, excessCaffeine, exercise

#### Life Metrics
- Slider or number input (1-10)
- Tracks: energy, stress, mood, focus, sleepQuality, sleepHours, moneyPressure, connection

#### Quick Context
- Select dropdowns
- Day type: work, rest, family, mixed, chaos
- Primary emotion: grateful, anxious, hopeful, frustrated, peaceful, overwhelmed
- Win category: family, work, health, faith, creative, none
- Time drain: meetings, distractions, emergencies, low-energy, interruptions, none

#### Reflection Prompts
- Free text inputs
- Top win, top friction, tomorrow priority
- Optional: family connection, faith alignment, drift check

---

## 8.2 Goal Management Workflow

### Creating a Goal

```
1. Navigate to /goals
   └── Sidebar link

2. Click "Add Goal" button
   └── Opens goal form

3. Fill goal details
   ├── Domain (select from 8)
   ├── Title (required)
   ├── Description (optional)
   ├── Target type (binary/count/duration)
   ├── Weekly minimum (number)
   └── Priority (1-3)

4. Save goal
   └── POST /api/goals

5. Goal appears in domain-grouped list
```

### Daily Check-ins

```
1. View goals on /goals page
   └── Grouped by domain

2. For each goal:
   ├── Toggle done/not done
   ├── Optional: add score (1-10)
   └── Optional: add note

3. Check-ins auto-save
   └── POST /api/checkins (upsert)

4. Visual progress updates
   └── Completion indicators
```

### Batch Check-in Flow

```
1. View all goals for today
   └── Toggle multiple goals

2. Submit batch
   └── POST /api/checkins/batch

3. All check-ins saved atomically
```

---

## 8.3 ThinkOps Idea Pipeline Workflow

### Quick Capture Mode

```
1. Navigate to /think-ops
   └── Sidebar link

2. Click "New Idea" button
   └── Opens capture form

3. Quick capture fields:
   ├── Title (required)
   ├── Pitch (one-liner)
   └── Category (tech/business/creative/family/faith/learning)

4. Save as draft
   └── POST /api/ideas

5. Idea appears in pipeline
   └── Status: draft
```

### Deep Capture Mode

```
1. Start with quick capture
   └── Or click "Deep Capture"

2. Additional fields:
   ├── Who it helps
   ├── Pain it solves
   ├── Why I care
   ├── Tiny test
   ├── Resources needed
   ├── Time estimate
   ├── Excitement (1-10)
   └── Feasibility (1-10)

3. Save with full context
   └── POST /api/ideas
```

### Reality Check Flow

```
1. Select idea from pipeline
   └── Click idea card

2. Click "Run Reality Check"
   └── POST /api/ideas/:id/reality-check

3. AI analyzes idea:
   ├── Market research (simulated)
   ├── Known/Likely/Speculation classification
   ├── Self-deception pattern detection
   └── Decision recommendation

4. View results on /reality-check
   ├── K/L/S breakdown
   ├── Flags highlighted
   └── Decision with reasoning

5. Idea status updated
   └── status: "reality_checked"
```

### Pipeline Status Transitions

```
draft ──┬──▶ parked ──────▶ promoted ──┬──▶ shipped
        │                              │
        └──▶ discarded ◀───────────────┘
```

| From | To | Trigger |
|------|-----|---------|
| draft | parked | Manual park |
| draft | discarded | Manual discard |
| draft | reality_checked | Run reality check |
| parked | promoted | Manual promote |
| promoted | shipped | Mark complete |
| promoted | discarded | Abandon |

---

## 8.4 Weekly Review Workflow

### Viewing Weekly Stats

```
1. Navigate to /weekly-review
   └── Sidebar link

2. View automatic stats:
   ├── Completion rate (%)
   ├── Total check-ins
   ├── Completed check-ins
   ├── Missed days
   └── Domain breakdown

3. View charts:
   ├── Completion by domain
   ├── Daily progress
   └── Trend lines

4. View drift flags:
   └── Factual observations (no judgment)
```

### AI Insight Generation

```
1. On weekly review page
   └── Click "Generate Insight"

2. AI analyzes week:
   ├── Completion patterns
   ├── Domain balance
   ├── Drift signals
   └── Goal alignment

3. Receive one actionable recommendation
   └── "This week, [action]. [Reason]."

4. Insight cached for 24 hours
   └── Prevents excessive API calls
```

### Export Flow

```
1. Click "Export" on weekly review
   └── GET /api/export/weekly.pdf

2. Download text file
   └── Contains formatted review data

3. Print or archive as needed
```

---

## 8.5 Teaching Assistant Workflow

### Lesson Plan Generation

```
1. Navigate to /teaching
   └── Sidebar link

2. Fill lesson request form:
   ├── Grade level
   ├── Standard (e.g., CCSS.MATH.5.NBT.1)
   ├── Topic
   ├── Time block
   ├── Available materials
   ├── Student profile
   ├── Constraints
   ├── Assessment type
   └── Output format

3. Submit request
   └── POST /api/teaching

4. AI generates:
   ├── Lesson outline
   ├── Hands-on activity
   ├── Exit ticket
   ├── Answer key
   ├── Differentiation tips
   └── 10-minute prep list

5. View and print results
   └── Displayed in structured format
```

### Saving for Later

```
1. Generated lessons are saved
   └── Stored in teaching_requests table

2. View history
   └── GET /api/teaching

3. Reuse or modify previous lessons
```

---

## 8.6 HarrisWildlands Content Workflow

### Website Copy Generation

```
1. Navigate to /harris
   └── Sidebar link

2. Define core message:
   ├── Definition (what you do)
   ├── Audience (who it's for)
   ├── Pain (problem solved)
   └── Promise (outcome)

3. Define site map goals:
   ├── Home page goal
   ├── Start Here goal
   ├── Resources goal
   └── Call to action

4. Define lead magnet:
   ├── Title
   ├── Problem addressed
   ├── Time to value
   └── Delivery method

5. Generate copy
   └── POST /api/harris

6. Receive structured copy:
   ├── Home page
   ├── Start Here page
   └── Resources page

7. Copy and use in website builder
```

---

## 8.7 Chat Workflow

### Conversational AI

```
1. Navigate to /chat
   └── Sidebar link

2. Type message
   └── Free text input

3. Submit message
   └── POST /api/chat

4. Receive contextual response
   └── AI has access to user's data context

5. Continue conversation
   └── Multi-turn dialogue
```

### Context Types

| Context | Data Included |
|---------|---------------|
| general | Bruce context only |
| weekly_review | Week's stats and goals |
| ideas | Current idea pipeline |
| logs | Recent log entries |

---

## 8.8 Settings Workflow

### User Preferences

```
1. Navigate to /settings
   └── Sidebar link

2. Configure preferences:
   ├── AI model selection
   ├── AI tone (gentle/balanced/direct)
   ├── Theme (field/lab/sanctuary)
   ├── Daily reminder toggle
   └── Reminder time

3. Save settings
   └── Auto-saves on change

4. Settings persist across sessions
```

---

## 8.9 Data Export Workflow

### Full Data Export

```
1. Navigate to /settings
   └── Or use API directly

2. Click "Export All Data"
   └── GET /api/export/data

3. Download JSON file containing:
   ├── User profile
   ├── All logs
   ├── All ideas
   ├── All goals
   ├── All check-ins
   ├── All teaching requests
   ├── All Harris content
   └── All transcripts

4. Store securely for backup
```

---

## 8.10 Authentication Workflow

### Replit Auth (Production)

```
1. Visit app URL
   └── harriswildlands.com

2. Redirected to Replit auth
   └── If not logged in

3. Authenticate with Replit account
   └── Google, GitHub, or email

4. Callback to app
   └── Session created

5. Access granted
   └── User-scoped data loaded
```

### Standalone Mode (Docker)

```
1. Start Docker container
   └── STANDALONE_MODE=true

2. Visit localhost:5000
   └── No auth required

3. Auto-logged in
   └── As standalone user

4. Full access granted
   └── Data persists locally
```

### Demo Mode (Evaluation)

```
1. Add ?demo=true to URL
   └── Or set localStorage flag

2. Demo banner appears
   └── Warning: data not persisted

3. Features work normally
   └── For evaluation purposes

4. Data cleared on session end
```

---

**Next Volume:** [VOL09 - Component Reference](./VOL09_COMPONENTS.md)
