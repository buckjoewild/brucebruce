# REPLIT_UPDATE_PROMPT.md

**Purpose:** This document serves as the handoff brief between development sessions, allowing AI agents (or future you) to pick up exactly where you left off and execute the next phase of HarrisWildlands development.

**Version:** 1.0  
**Last Updated:** 2025-01-04  
**Status:** Active Development → Pre-Teaching Sprint

---

## 🎯 Current Mission

**GOAL:** Ship final critical updates to HarrisWildlands before teaching schedule resumes.

**APPROACH:** Pomodoro-driven development sprints (3-4 sessions) where each session:
1. Receives a clear handoff brief (this document)
2. Executes one focused update
3. Documents completion state
4. Prepares next handoff brief

**OUTCOME:** A fully functional, production-ready LifeOps + ThinkOps system deployed on Replit.

---

## 📋 Session Handoff Template

### SESSION [NUMBER]: [UPDATE NAME]

**Date/Time:** [Timestamp]  
**Duration Target:** 25 minutes (1 Pomodoro)  
**Priority:** P0 / P1 / P2

#### Context (What came before)
- Previous session completed: [brief summary]
- Current system state: [working/broken/partial]
- Files modified in last session: [list]

#### This Session's Objective
**WHAT:** [One sentence - what are we building/fixing?]  
**WHY:** [One sentence - what value does this unlock?]  
**SUCCESS CRITERIA:** [How do we know it's done?]

#### Execution Plan
1. **Step 1:** [Action] → Expected outcome: [result]
2. **Step 2:** [Action] → Expected outcome: [result]
3. **Step 3:** [Action] → Expected outcome: [result]
4. **Verify:** [How to test it works]

#### Files to Modify
- `path/to/file1.ts` - [What change?]
- `path/to/file2.tsx` - [What change?]
- `path/to/file3.ts` - [What change?]

#### Replit-Specific Considerations
- [ ] Database migration required? (`npm run db:push`)
- [ ] Environment variables needed? (add to Secrets)
- [ ] Dependencies to install? (`npm install [package]`)
- [ ] Replit restart needed after changes?
- [ ] Test in Replit webview before marking complete

#### Handoff to Next Session
**IF SUCCESS:**
- Mark this session COMPLETE
- Document any gotchas discovered
- Prepare next session brief (see queue below)

**IF BLOCKED:**
- Document blocker clearly
- Note what was attempted
- Suggest alternative approach for next session

---

## 🚀 Update Queue (Priority Order)

### P0 - Critical Path (Must Ship)
- [ ] **UPDATE 1:** Enhanced LifeOps with Morning/Evening Logs
- [ ] **UPDATE 2:** Database migration for new log schema
- [ ] **UPDATE 3:** API routes for dual log types
- [ ] **UPDATE 4:** Fix weekly export (PDF vs TXT)
- [ ] **UPDATE 5:** Auth verification in production

### P1 - High Value (Should Ship)
- [ ] **UPDATE 6:** Goals weekly review aggregation
- [ ] **UPDATE 7:** Export includes both morning/evening data
- [ ] **UPDATE 8:** Settings page with user preferences
- [ ] **UPDATE 9:** ThinkOps reality check AI integration

### P2 - Nice to Have (Could Ship)
- [ ] **UPDATE 10:** Teaching Assistant workflow
- [ ] **UPDATE 11:** Harris content generator
- [ ] **UPDATE 12:** Google Drive integration testing
- [ ] **UPDATE 13:** Dashboard data visualizations

---

## 🎯 CURRENT SESSION BRIEF

### SESSION 1: Enhanced LifeOps Integration

**Date/Time:** 2025-01-04 Evening  
**Duration Target:** 25 minutes  
**Priority:** P0

#### Context
- Bruce requested comprehensive morning/evening tracking
- Claude generated: LifeOps-Enhanced.tsx, enhanced-logs-schema.ts, INTEGRATION_GUIDE.md
- Files are ready, need integration into Replit project
- Current LifeOps is basic single-entry system

#### This Session's Objective
**WHAT:** Integrate enhanced LifeOps page with morning/evening dual logs into Replit  
**WHY:** Doubles data collection, adds 50+ comprehensive tracking points  
**SUCCESS CRITERIA:** 
- ✅ Can create morning log
- ✅ Can create evening log
- ✅ Both logs save to database
- ✅ Can view both logs in UI

#### Execution Plan
1. **Update Schema:**
   - Open `shared/schema.ts`
   - Replace `logs` table definition with enhanced version from `enhanced-logs-schema.ts`
   - Run: `npm run db:push` in Replit shell
   - Verify: Check Replit Database viewer for new columns

2. **Update API Routes:**
   - Open `server/routes.ts`
   - Update `/api/logs` GET to filter by `logType`
   - Update `/api/logs` POST to require `logType` field
   - Add validation: `logType` must be 'morning' or 'evening'

3. **Update Storage Functions:**
   - Open `server/storage.ts`
   - Modify `getLogs()` to accept `{ date?, logType? }` filters
   - Update `createLog()` to handle new schema fields

4. **Replace UI Page:**
   - Copy `LifeOps-Enhanced.tsx` to `client/src/pages/LifeOps.tsx`
   - Verify routing in `client/src/App.tsx` still works
   - Test in Replit webview: can you see the morning/evening toggle?

5. **Verify End-to-End:**
   - Create morning log with sleep + hydration data
   - Create evening log with reflection data
   - Refresh page - both should persist
   - Check database - verify two rows with same date, different logType

#### Files to Modify
- `shared/schema.ts` - Add enhanced logs table
- `server/routes.ts` - Update logs endpoints
- `server/storage.ts` - Add logType filtering
- `client/src/pages/LifeOps.tsx` - Replace with enhanced version

#### Replit-Specific Considerations
- [x] Database migration required: `npm run db:push`
- [ ] Environment variables needed: None
- [ ] Dependencies to install: None (all existing)
- [x] Replit restart needed: Yes, after schema change
- [x] Test in Replit webview at /lifeops route

#### Handoff to Next Session
**IF SUCCESS:**
- Document any schema migration issues encountered
- Note: Ready for SESSION 2 (Weekly Review Enhancement)
- Celebrate: You now have 2x daily data collection!

**IF BLOCKED:**
- Common blocker: "Column already exists" → Use `npm run db:push --force`
- If API errors: Check Replit logs for exact error message
- If UI not loading: Verify React component imports are correct

---

## 🧠 Council of Perspectives

### Perspective 1: The Pragmatic Engineer
**TAKE:** "This approach is solid but front-loads risk. You're changing the data model first, which could break existing logs. Instead, add new columns as NULLABLE, test with new UI, then migrate old data."

**RECOMMENDATION:**
- Don't drop existing columns
- Add `logType` with DEFAULT 'morning' for backwards compat
- Let old logs continue working
- New logs use enhanced schema
- Migrate old data later when stable

**CONCERN:** "You're doing this before teaching starts. What if it breaks and you can't fix it? You need rollback plan."

**MITIGATION:**
- Take DB backup BEFORE migration: `pg_dump > backup_pre_enhancement.sql`
- Keep old LifeOps.tsx as LifeOps-Legacy.tsx for emergency rollback
- Test in Replit BEFORE making URL live

---

### Perspective 2: The Product Manager
**TAKE:** "You're solving the right problem (more granular data), but are you sure morning/evening is the right split? What about context-based logging instead?"

**ALTERNATIVE APPROACH:**
- Instead of time-of-day, log by **context**: Work Day, Family Day, Teaching Day, Recovery Day
- Track **events** not just metrics: "Had conflict with spouse", "Student breakthrough moment"
- Add **tagging system**: #high-energy, #drift-risk, #win

**VALUE ADD:**
- More flexible than rigid morning/evening
- Captures qualitative moments, not just quantitative data
- Better for AI pattern detection

**BRUCE'S CALL:** Do you want rigid structure (morning/evening) or flexible context? Both valid, different use cases.

---

### Perspective 3: The Data Scientist
**TAKE:** "You're about to generate a TON of data (50+ fields × 2 logs/day × 365 days = 36,500 data points/year). That's powerful, but only if you have analysis tools ready."

**MUST-HAVES FOR VALUE:**
1. **Correlation Engine:** "Show me what predicts high energy days"
2. **Anomaly Detection:** "Flag when patterns break (e.g., 3 days of low sleep)"
3. **Trend Analysis:** "Am I improving in X domain over time?"
4. **Export for External Tools:** CSV export → import into Python/R for deep analysis

**WARNING:** "Don't become a data hoarder. Tracking without insights is just busywork."

**NEXT PRIORITY AFTER P0:** Build a "Weekly Insights" dashboard that uses this data.

---

### Perspective 4: The Behavioral Psychologist
**TAKE:** "You're building a habit tracker, but missing habit formation mechanics. Tracking alone doesn't change behavior."

**MISSING FEATURES:**
- **Streak Indicators:** "7 days of morning routine completion!"
- **Friction Analysis:** "You skip breakfast 80% of Mondays - why?"
- **Micro-Commitments:** "Tomorrow I'll drink 6 glasses of water" → Check-in
- **Positive Reinforcement:** Celebrate small wins visibly

**ENHANCEMENT IDEA:**
Add a "Commitment" section to morning log:
- "What's my ONE habit focus today?" (e.g., "No doom scrolling")
- Evening log asks: "Did I keep my commitment?" (Y/N + reflection)

**VALUE:** Transforms passive tracking into active behavior change.

---

### Perspective 5: The System Architect
**TAKE:** "Your schema is getting wide (50+ columns). That's fine for now, but you're approaching the limits of a single-table design."

**FUTURE REFACTOR (not now, but be aware):**
- Split into domain tables: `physical_metrics`, `mental_metrics`, `habits`, `nutrition`
- Use **foreign keys** to link back to master `daily_logs` table
- Benefits: Easier to query, faster analytics, cleaner schema

**WHEN TO REFACTOR:**
- If queries get slow (>1 second)
- If you add 20+ more fields
- If you want to track sub-entities (e.g., multiple exercises per day)

**FOR NOW:** Your approach is fine. Ship it.

---

### Perspective 6: The Replit Specialist
**TAKE:** "You're using Replit's strengths (fast iteration, integrated DB) but ignoring some gotchas."

**GOTCHAS:**
1. **Secrets vs .env:** In Replit, use Secrets for sensitive stuff (DB_URL), .env for local dev
2. **Database viewer lag:** After `db:push`, sometimes need to refresh DB tab to see new columns
3. **Hot reload issues:** Complex schema changes may require full Replit restart (not just file save)
4. **Session persistence:** Replit sessions can expire - test login flow in production domain

**PRO TIPS:**
- Use Replit's "Always On" for production (prevents cold starts)
- Set up Replit's built-in monitoring to catch 500 errors
- Use Replit DB backups feature (automatic daily backups)

---

## 🎬 Council Synthesis: Recommended Action Plan

### **CONSENSUS:** Ship the enhanced LifeOps, but with safety nets.

### **Action Plan (Revised):**

#### **PRE-SESSION PREP (5 min):**
1. Take DB backup in Replit
2. Duplicate current LifeOps.tsx as LifeOps-Legacy.tsx
3. Read through INTEGRATION_GUIDE.md one more time

#### **SESSION 1 (25 min): Schema + API**
- Focus: Get database and backend working
- Skip UI for now (reduces risk)
- Test via curl or Postman: Can you POST morning/evening logs?
- Success = backend accepts both log types

#### **SESSION 2 (25 min): UI Integration**
- Focus: Replace LifeOps page
- Test: Create both logs via UI
- Verify: Data persists correctly
- Success = both logs save and reload

#### **SESSION 3 (25 min): Polish + Production Push**
- Focus: Fix any rough edges from testing
- Add error handling
- Test in production domain (not just Replit dev)
- Success = fully working on harriswildlands.com

#### **SESSION 4 (25 min): Quick Wins**
- Focus: Pick one P1 item (weekly review or export fix)
- Ship it
- Celebrate with a beer (you earned it)

---

## 📊 Success Metrics (How We Know We're Done)

### **Minimum Viable Product:**
- [ ] Can create morning log with sleep data
- [ ] Can create evening log with reflection
- [ ] Both logs persist across sessions
- [ ] UI shows which logs are completed (checkmarks)
- [ ] No errors in Replit console
- [ ] Works in production (harriswildlands.com)

### **Stretch Goals:**
- [ ] Weekly review aggregates both morning/evening data
- [ ] Export includes morning/evening labels
- [ ] Can see historical logs (past days)
- [ ] Mobile-responsive (works on phone)

---

## 🔄 Template for Next Session Brief

```markdown
### SESSION [N+1]: [NEXT UPDATE NAME]

**Context:**
- Session N completed: [what was shipped]
- Blockers encountered: [none / list]
- System state: [stable / needs testing / broken]

**This Session's Objective:**
[Clear one-sentence goal]

**Execution Plan:**
1. [Step]
2. [Step]
3. [Verify]

**Files to Modify:**
- [file] - [change]

**Success Criteria:**
- [ ] [measurable outcome]
```

---

## 💬 Bruce's Notes Section

Use this space to capture thoughts between sessions:

**2025-01-04:**
- Feeling good about morning/evening split
- Want to make sure this doesn't break existing logs
- Concerned about time - teaching starts soon
- Need to prioritize what ships vs what waits

**Next session reminders:**
- [ ] Don't forget to test on actual phone (not just Replit preview)
- [ ] Check that weekly review still works
- [ ] Make sure export includes new fields

---

## 🆘 Emergency Rollback Procedure

If something breaks badly:

1. **Database Rollback:**
```bash
# In Replit shell:
pg_restore -U postgres -d harriswildlands backup_pre_enhancement.sql
```

2. **Code Rollback:**
```bash
# Revert files via Replit version history
# Or copy LifeOps-Legacy.tsx back to LifeOps.tsx
```

3. **Verify Old System Works:**
- Can you create a log?
- Does weekly review load?
- Check one export

4. **Debug Time:**
- Post to Replit community
- Check Replit logs for exact error
- Use AI (Claude) to debug the issue

---

## 🎓 Lessons Learned (Update After Each Session)

**SESSION 1:**
[Capture what went well, what didn't, what you'd do differently]

**SESSION 2:**
[...]

---

**Last Updated By:** Bruce  
**Next Session Scheduled:** [Date/Time]  
**Teaching Resumes:** [Date] - Hard deadline for pre-teaching sprint
