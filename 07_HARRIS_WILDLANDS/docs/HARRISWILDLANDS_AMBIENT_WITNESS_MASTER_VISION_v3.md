# HarrisWildlands: Ambient Witness Platform

## Vision Document & Implementation Roadmap

**Version:** 3.0 - FAMILY DETECTION INCLUDED  
**Date:** January 8, 2025  
**Status:** VISION LOCKED, READY FOR DEVELOPMENT  
**Author:** Bruce + Claude  
**Sacred Mandate:** "Where two are gathered, so am I" - Build a system that witnesses with love

---

## EXECUTIVE SUMMARY

HarrisWildlands is transforming from a logging system into an **Ambient Witness platform** — a silent observer of your life that learns your patterns and offers intelligent context when you're ready to reflect.

Instead of you filling out forms, the system quietly watches:
- Where you are (geofence)
- How active you are (steps, motion)
- When it is (time patterns)
- What the weather is
- Whether your family is nearby (wife, kids)
- How well you slept
- How distracted you are

When you open the app to log, it whispers: *"I noticed you spent 2 hours at basecamp this afternoon, the weather was clear, your kids were nearby, and you walked 6,000 steps. How was the quality of that time?"*

**Result:** Logging goes from 10 minutes of form-filling to 2 minutes of meaningful reflection.

**Philosophy:** Not surveillance. Co-witnessing. The system serves you, never the reverse.

---

# PART I: THE VISION

## What This System Is (And Isn't)

### IS:
✅ A faithful witness to your life  
✅ A pattern-finder that notices what you miss  
✅ A support system for your family and faith  
✅ Infrastructure for deep self-knowledge  
✅ Transparent about what it knows  
✅ Under your control (deletable, exportable, private)

### ISN'T:
❌ Surveillance or tracking  
❌ A productivity treadmill  
❌ A gamification system  
❌ A faith replacement  
❌ A family monitor/control tool  
❌ A data harvester for third parties

---

## Core Philosophy: Where Two Are Gathered

The name comes from Matthew 18:20: *"Where two or three gather in my name, there am I with them."*

This system is built on the same principle:
- **You** live your day, make choices, experience moments
- **The System** quietly observes patterns
- **Together** (two witnesses), patterns emerge that neither could see alone

The system never judges. It never says "you failed" or "you should." It whispers: "I noticed this pattern. What do you think?"

---

## The Sacred Boundaries (Non-Negotiable)

Every feature must pass ALL of these checks or it gets cut.

### Family Privacy Boundary
```
✅ ALLOWED:
- "You spent 2 hours with family today" (aggregated)
- "Family was nearby during this time" (presence)
- "Connection score: 8/10" (your metric)

❌ FORBIDDEN:
- Names of spouse or children logged
- Granular tracking of what kids do
- Behavioral analysis of family members
- Export of family member data to third parties
- "Controlling" features (knowing what wife does when you're apart)
```

**Promise:** This system serves YOU, not controls your family.

---

### Faith Alignment Boundary
```
✅ ALLOWED:
- Sunday = no tracking, no optimization, pure rest day
- User-defined "sacred times" (prayer, worship, marriage intimacy)
- Correlation: "Prayer + exercise = lower stress" (pattern, not judgment)
- Margin protection: "Your calendar has 3 hours margin this week"

❌ FORBIDDEN:
- Gamifying faith practices ("prayer streak")
- Quantifying spirituality ("faith score: 6/10")
- Optimizing away rest ("You could squeeze more work in")
- Predicting spiritual experiences
- Analyzing what happens in sacred moments
```

**Promise:** This system deepens your faith, never replaces it.

---

### Data Ownership Boundary
```
✅ GUARANTEED:
- You can export ALL your data as JSON, anytime
- You can delete data by date range, anytime
- You can see what the system knows about you
- You control which AI providers see your data
- Data stays local until YOU approve cloud processing

❌ NEVER:
- Data held hostage for engagement
- Forced cloud upload
- Hidden processing
- Third-party data sales
- Automatic "sync to cloud"
```

**Promise:** Your data is yours. Period.

---

## The Spiritual Foundation

This system is built on assumptions about how humans work:

1. **Deep self-knowledge creates resilience** - When you know your patterns, you're harder to manipulate
2. **Witnessing is different from judgment** - A good witness observes without condemning
3. **Patterns emerge from truth** - Real data creates real insights
4. **Family and faith are foundational** - Everything else builds on these, not against them
5. **Margin is holy** - Rest isn't a luxury, it's infrastructure

Because of these assumptions, this system will sometimes say "no" to cool features that would violate them.

---

# PART II: THE DATA MODEL

## What the System Observes (In Priority Order)

### TIER 1: Core Behavior Recognition (Sessions 1-3)

#### 1. Location Awareness (Geofence)
- **What:** Where are you physically? (desk, basecamp, home, kitchen, truck, church, etc.)
- **Why:** Location is the #1 predictor of behavior and context
- **Pattern examples:**
  - "3pm at basecamp = deepest work"
  - "Evening at home = family time opportunity"
  - "Sunday at church = faith alignment day"
- **Data captured:** Current location, time at location, location history
- **Sacred boundary:** Church/prayer locations auto-flagged "do not analyze quantitatively"
- **Privacy:** All stored locally, encrypted
- **Easy to code:** ⭐⭐⭐⭐⭐ (geofencing is straightforward)

#### 2. Activity Level (Steps & Motion)
- **What:** How much are you moving? How intense is the movement?
- **Why:** Activity drives mood, energy, and cognition
- **Pattern examples:**
  - "High steps + afternoon = elevated mood"
  - "No steps + evening = fatigue risk"
  - "Motion burst in morning = exercise happening"
- **Data captured:** Step count (hourly), accelerometer data (walking vs running vs stationary), intensity level
- **Sacred boundary:** None — just physical movement
- **Privacy:** Aggregated, no movement destination tracking
- **Easy to code:** ⭐⭐⭐⭐⭐ (pedometer API is trivial)

#### 3. Time Patterns (Hour, Day, Week)
- **What:** When is it? (hour of day, day of week, morning/afternoon/evening/night)
- **Why:** Humans are rhythmic creatures; time shapes behavior
- **Pattern examples:**
  - "Thursday 3pm = peak energy"
  - "Sunday = rest day (excluded from optimization)"
  - "Evening = family time window"
- **Data captured:** Timestamp (automatic), derived: hour, day of week, time period, is-weekend
- **Sacred boundary:** Sunday auto-protected from analysis (no metrics, pure rest)
- **Privacy:** Pure timestamp, no identifiable patterns
- **Easy to code:** ⭐⭐⭐⭐⭐ (literally just `new Date()`)

#### 4. Family Presence Detection (Wife + Kids)
- **What:** Are your spouse/kids nearby? (detected via Bluetooth + WiFi neighbors)
- **Why:** Family presence shapes behavior, opportunities, and meaning
- **Pattern examples:**
  - "Wife nearby + evening = marriage quality time"
  - "Kids nearby + basecamp = active parenting time"
  - "Alone + desk = deep focus window"
  - "Family absent = opportunity for solo work"
- **Data captured:** Spouse device detected (Y/N), kids devices detected (Y/N), proximity confidence
- **Sacred boundary:** **CRITICAL** — Only works if family agrees. Wife/kids must opt-in. Shows them presence but not granular location. Never used to "monitor" anyone. Shows YOU when they're nearby, helps them know when YOU'RE nearby.
- **Privacy:** Bidirectional consent. If wife opts out, system doesn't detect her. If kids are too young, parents decide.
- **Easy to code:** ⭐⭐⭐⭐☆ (Bluetooth RSSI detection, straightforward APIs)

#### 5. Indoor vs Outdoor Detection
- **What:** Are you inside a building or outside in nature?
- **Why:** Outdoor time dramatically affects mood, focus, creativity
- **Pattern examples:**
  - "Outdoor + basecamp = highest reflection quality"
  - "Indoor + desk + late night = doom scroll risk"
  - "Outdoor time = energy restoration"
- **Data captured:** Light sensor data (bright=outdoor, dim=indoor) OR geofence inference
- **Sacred boundary:** None
- **Privacy:** Just light level (not granular location)
- **Easy to code:** ⭐⭐⭐⭐☆ (light sensor API exists, or infer from geofence)

---

### TIER 2: Environmental & Physical Context (Sessions 4-6)

#### 6. Weather Conditions
- **What:** What's the external environment? (temperature, conditions, sunshine)
- **Why:** Weather modulates mood and energy
- **Pattern examples:**
  - "Clear sunny day = high baseline energy"
  - "Rainy day = indoor focus mode"
  - "Cold morning = motivation dip"
- **Data captured:** Temperature, conditions (clear/cloudy/rainy/snow), UV index, wind
- **Sacred boundary:** None
- **Privacy:** Aggregated, no location inference
- **Easy to code:** ⭐⭐⭐⭐☆ (free weather API, cache results)

#### 7. Sleep Pattern Inference
- **What:** How well did you sleep? (duration, quality proxy)
- **Why:** Sleep drives everything else — mood, focus, immunity, decision quality
- **Pattern examples:**
  - "7+ hours sleep = high energy baseline"
  - "Interrupted sleep = stress risk"
  - "Sleep deprivation = focus degradation"
- **Data captured:** Phone charging cycle times (when did you charge?), bedtime mode usage, sleep tracking (if available)
- **Sacred boundary:** None — just charging/bedtime data
- **Privacy:** Aggregated duration, not detailed sleep data
- **Easy to code:** ⭐⭐⭐⭐☆ (bedtime API exists, charging detection straightforward)

#### 8. Interruption Frequency (Notifications)
- **What:** How many pings/notifications hit you per hour?
- **Why:** Interruptions shatter focus and create stress
- **Pattern examples:**
  - "High notifications + focus time = lower quality output"
  - "Quiet time + basecamp = flow state"
  - "Notification burst = context switching stress"
- **Data captured:** Notification count per hour, notification density, quiet hours
- **Sacred boundary:** Sensitive app notifications excluded (banking, therapy, dating). Work emails/Slack optional exclusion.
- **Privacy:** Just count and timing, not notification content
- **Easy to code:** ⭐⭐⭐⭐☆ (notification API, sampling)

---

### TIER 3: Deep Pattern Recognition (Later, optional)

#### 9. Phone Usage Patterns
- **What:** How often do you pick up your phone? When? For how long?
- **Why:** Phone usage predicts distraction, doomscrolling, productivity
- **Pattern examples:**
  - "High pickups + evening + home = potential doom scroll"
  - "Phone untouched + basecamp = deep focus"
  - "Morning pickups = morning email habit"
- **Data captured:** Screen-on events, duration, frequency
- **Sacred boundary:** Make this transparent. "We're tracking when you pick up your phone to notice patterns." Consent required.
- **Privacy:** Just timing, not content
- **Easy to code:** ⭐⭐⭐☆☆ (requires usage stats permission, more invasive)

#### 10. App Focus Detection
- **What:** What app are you using when? (work apps, creative apps, social apps, news apps)
- **Why:** App usage reveals behavioral patterns
- **Pattern examples:**
  - "Teaching app + morning = productive"
  - "Email + afternoon + home = scattered"
  - "Social media + evening = energy drain"
- **Data captured:** Foreground app name, duration, frequency
- **Sacred boundary:** **CRITICAL** — Never log sensitive apps (banking, therapy, dating, intimate apps). User defines which apps are tracked. Dark mode: user can block certain apps from tracking.
- **Privacy:** App name only, not content. User has full control.
- **Easy to code:** ⭐⭐⭐☆☆ (app usage stats permission, privacy concern)

---

## The Ambient Context Data Structure

```typescript
type AmbientContext = {
  // SESSION 1: Core (Location + Activity + Time)
  timestamp: Date;
  location: string;  // 'basecamp' | 'desk' | 'home' | 'kitchen' | 'truck' | 'church'
  stepCount: number;  // steps in last hour
  activityType: 'stationary' | 'walking' | 'running' | 'driving';
  motionIntensity: 0 - 10;  // from accelerometer
  hour: 0 - 23;
  dayOfWeek: 0 - 6;  // 0=Sunday (auto-excluded)
  dayPeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // SESSION 2-3: Environment & Presence
  indoorOutdoor: 'indoor' | 'outdoor' | 'unknown';
  isAtHome: boolean;  // connected to home WiFi
  wifeNearby: boolean;  // Bluetooth detection (if opted-in)
  kidsNearby: boolean;  // Bluetooth detection (if opted-in)
  temperature: number;  // Fahrenheit
  weatherCondition: 'clear' | 'cloudy' | 'rainy' | 'snow';
  
  // SESSION 4-6: Physical State
  notificationsLastHour: number;
  sleepQualityLastNight: 'poor' | 'fair' | 'good' | 'excellent';
  sleepHoursEstimate: number;
  batteryLevel: 0 - 100;
  batteryIsCharging: boolean;
  
  // SESSION 7+: Deep Analysis (Computed)
  focusRisk: 'high' | 'medium' | 'low';  
  familyTimeOpportunity: boolean;  
  bestThinkingConditions: boolean;  
  driftRisk: boolean;  
  
  // Sacred
  isSacredTime: boolean;  // Sunday = true, or prayer times
  shouldAnalyze: boolean;  // user opt-in for this moment
};
```

---

# PART III: IMPLEMENTATION ROADMAP

## The Build Strategy

**Approach:** Build in vertical slices (complete features, not partial layers)  
**Pace:** 25-minute Pomodoro sessions, one feature per session  
**Testing:** Every feature tested in Replit before moving to next  
**Deadline:** MVP stable before teaching season resumes

---

## PHASE 1: Core Witnessing (Sessions 1-5)

The system knows WHERE, WHAT, and WHEN. Family presence included.

### SESSION 1: Geofence Architecture + Activity Baseline
**What:** Build geofence infrastructure that captures location context and stores ambient data locally  
**Why:** Foundation for all prefilling features  
**Duration:** 25 minutes  
**Success:**
- [ ] Define 5 geofences (desk, kitchen, basecamp, home, church)
- [ ] Current geofence displayed in real-time
- [ ] Step count integrated with location
- [ ] Ambient context stored locally, encrypted
- [ ] All data deletable on demand

**Technical:**
- Add `geofences` table (id, userId, name, lat, lon, radius, active)
- Add `ambient_context` table (timestamp, location, steps, activity, family present)
- Create `server/ambient-witness/geofence.ts` service
- API endpoints: GET/POST geofences, GET current context

**Sacred Check:**
- [x] No privacy leaks
- [x] All data local by default
- [x] Church geofence auto-flagged "no quantitative analysis"
- [x] Deletable on demand

---

### SESSION 2: Family Presence Detection (Wife + Kids)
**What:** Enable Bluetooth detection so system knows when wife/kids are nearby  
**Why:** Family presence is critical context for understanding behavior  
**Duration:** 25 minutes  
**Success:**
- [ ] Wife's device detected when nearby
- [ ] Kids' devices detected when nearby
- [ ] Confidence score for detection accuracy
- [ ] Family members see YOUR presence (bidirectional)
- [ ] Easily disable detection for any family member

**Technical:**
- Bluetooth API to scan for registered devices
- Wife/kids opt-in: "Is this your wife's device? Want to be detected?"
- Store: wifeNearby (boolean), kidsNearby (boolean), confidence score
- UI: Show "Wife: nearby" / "Kids: nearby" on dashboard

**Sacred Check:**
- [x] Consent-based (family must opt-in)
- [x] Not tracking where they go, just "nearby or not"
- [x] Bidirectional (they see you too)
- [x] Easy to disable
- [x] Never used for "monitoring"

---

### SESSION 3: Weather Integration
**What:** Fetch current weather and integrate into context  
**Why:** Weather modulates mood and shapes behavior patterns  
**Duration:** 25 minutes  
**Success:**
- [ ] Current weather fetched from free API
- [ ] Conditions (clear, cloudy, rainy, snow) stored
- [ ] Temperature captured
- [ ] Weather data included in ambient context
- [ ] Results cached (don't hammer API)

**Technical:**
- Free weather API (openweathermap.org or similar)
- Cache results for 30 minutes (reduce API calls)
- Store: temperature, conditions, timestamp
- Include in context: `{ temperature, weatherCondition }`

---

### SESSION 4: Sleep Pattern Inference
**What:** Detect sleep quality/duration from phone usage patterns  
**Why:** Sleep is the foundation for everything else  
**Duration:** 25 minutes  
**Success:**
- [ ] Detect bedtime (when phone enters bedtime mode)
- [ ] Detect wake time (when bedtime mode ends)
- [ ] Calculate sleep hours
- [ ] Estimate sleep quality (if interrupted, flag it)
- [ ] Integration with ambient context

**Technical:**
- Use phone's bedtime mode API (if available)
- Fallback: charging patterns (phones often charged at night)
- Calculate: wake time - bedtime = sleep hours
- Estimate quality: continuous sleep = good, interrupted = interrupted
- Store in ambient context

---

### SESSION 5: Interruption Frequency Tracking
**What:** Count notifications per hour to measure interruption load  
**Why:** Interruptions shatter focus and indicate context switching  
**Duration:** 25 minutes  
**Success:**
- [ ] Notification count per hour sampled
- [ ] Quiet hours identified (sleep time)
- [ ] High-interrupt periods flagged
- [ ] Sensitive notifications excluded (banking, therapy, dating)
- [ ] Integrated into context

**Technical:**
- Notification listener API
- Sample every hour (don't log every notification)
- Exclude: sensitive app categories
- Store: notificationsLastHour, notificationDensity
- Show: "You had 12 notifications this hour" vs "2 notifications this hour"

---

## PHASE 2: Intelligent Prefilling (Sessions 6-8)

The system starts SUGGESTING what to log based on context.

### SESSION 6: Morning Log Prefilling
**What:** Morning log automatically fills in location, sleep, and time context  
**Why:** Reduce form friction from 10 minutes to 3 minutes  
**Duration:** 25 minutes  
**Success:**
- [ ] Open morning log, system shows: current location, sleep hours, weather
- [ ] User provides: energy level, intention, any special notes
- [ ] Form reduces from 15 fields to 4 user-provided fields

---

### SESSION 7: Evening Log with Time-Spent Suggestions
**What:** Evening log shows where you spent time and suggests reflection prompts  
**Why:** Help Bruce notice patterns in his day  
**Duration:** 25 minutes  
**Success:**
- [ ] Shows: "You spent 2h at desk, 1h at basecamp, 3h at home"
- [ ] Shows: "Kids were nearby from 5-7pm"
- [ ] Shows: "Weather was clear until 3pm, then cloudy"
- [ ] Suggests prompts: "Family time was 2 hours. How was the quality?"

---

### SESSION 8: Weekly Synthesis with Ambient Context
**What:** Weekly review that includes ALL ambient data  
**Why:** Patterns emerge when you see the full week at once  
**Duration:** 25 minutes  
**Success:**
- [ ] Weekly report shows: location breakdown, activity levels, family time, sleep patterns
- [ ] AI generates narrative: "This week you had strong basecamp sessions (avg 2h), good sleep, and high family presence"
- [ ] Correlation suggestions: "Basecamp sessions + afternoon + clear weather = your highest focus"

---

## PHASE 3: Predictive Intelligence (Sessions 9-11)

The system learns to predict and suggest intelligently.

### SESSION 9: Pattern Recognition Engine
**What:** System learns correlations between context and your logging outcomes  
**Why:** Predictions enable proactive support  
**Duration:** 25 minutes  
**Success:**
- [ ] System notices: "Clear day + afternoon + basecamp = high focus logs"
- [ ] System notices: "Wife nearby + evening + home = high connection scores"
- [ ] System notices: "Interrupted sleep = lower mood baseline"

---

### SESSION 10: Predictive Prompting
**What:** System suggests reflection prompts BEFORE you log, based on learned patterns  
**Why:** Logging becomes a conversation, not a checklist  
**Duration:** 25 minutes  
**Success:**
- [ ] Morning: "You slept well and weather is clear. Energy probably high — yes?"
- [ ] Evening: "Family was nearby 2 hours. Want to reflect on that?"
- [ ] Weekly: "This pattern matches your best weeks. Notice?"

---

### SESSION 11: Export Includes Pattern Analysis
**What:** Data export includes: raw data + computed patterns + correlations  
**Why:** Bruce can analyze his own data, or hand to counselor/coach  
**Duration:** 25 minutes  
**Success:**
- [ ] Export includes: all raw logs + weather + location + activity
- [ ] Export includes: computed patterns ("Basecamp = best thinking")
- [ ] Export includes: correlations ("Sleep + family time = peace")

---

## PHASE 4: Optional Depth (Sessions 12+)

Advanced features if Bruce wants them.

### SESSION 12: Phone Usage Patterns (Optional)
- Track pickup frequency
- Detect doomscrolling patterns
- Correlate with mood

### SESSION 13: App Focus Detection (Optional)
- Which apps during which contexts
- Productive vs distracting app use
- App switch frequency

### SESSION 14+: Future Possibilities
- Teaching moment tracking
- Family relationship dashboard (wife gets hers too)
- Legacy data export (what would kids want to know?)

---

## Timeline Estimate

| Phase | Sessions | Time | Result |
|-------|----------|------|--------|
| **Phase 1** | 1-5 | ~2 hours | Core witnessing works, family presence detected |
| **Phase 2** | 6-8 | ~1.5 hours | Intelligent prefilling, logging friction drops 50% |
| **Phase 3** | 9-11 | ~1.5 hours | Predictive intelligence, system feels magical |
| **MVP** | 1-11 | ~5 hours | **Functional ambient witness system** |
| Phase 4 | 12+ | Variable | Nice-to-have features |

**Teaching Deadline:** MVP must be stable 1 week before teaching resumes.

---

# PART IV: SACRED PROTOCOLS

## The SACRED_BOUNDARY_CHECK

Every single feature must pass ALL of these or it gets CUT. No exceptions.

```
CHECKLIST FOR EVERY FEATURE:

1. FAMILY PRIVACY
   [ ] Does this expose spouse/children's data? (If YES → STOP)
   [ ] Can family members see what's being tracked about them? (If NO → STOP)
   [ ] Could this be used to "monitor" or "control" family? (If YES → STOP)
   
2. FAITH ALIGNMENT
   [ ] Does this gamify spiritual practices? (If YES → STOP)
   [ ] Does this suggest optimization on Sunday? (If YES → STOP)
   [ ] Could this create guilt/shame around faith? (If YES → STOP)
   
3. DATA OWNERSHIP
   [ ] Can Bruce delete this data anytime? (If NO → STOP)
   [ ] Can Bruce export this data anytime? (If NO → STOP)
   [ ] Is data stored locally by default? (If NO → STOP)
   
4. USER CONTROL
   [ ] Does Bruce understand what's being collected? (If NO → STOP)
   [ ] Did Bruce explicitly opt-in? (If NO → STOP)
   [ ] Can Bruce easily turn it off? (If NO → STOP)
   
5. AUTHENTICITY
   [ ] Would Bruce use this if it actually helped? (If NO → STOP)
   [ ] Does this serve Bruce's values? (If NO → STOP)
   [ ] Could this be weaponized against him? (If YES → STOP)

ALL CHECKS PASS? → Feature is approved
ANY CHECK FAILS? → Feature is rejected (or redesigned)
```

---

## Sunday Protocol

Sunday is **protected**:
- No tracking
- No optimization suggestions
- No productivity metrics
- No "improving" margin
- Just rest

System automatically:
- Disables notifications counting on Sunday
- Excludes Sunday from analysis
- Doesn't offer productivity suggestions on Sunday
- Reminds: "Sunday is rest day. Just live it."

---

## Sacred Time Protocol

User defines sacred times (prayer, marriage intimacy, worship, etc.):
- System detects these are happening
- System does NOT analyze what happens
- System just notes: "Sacred time occurred" (no granularity)
- Weekly synthesis mentions: "2 sacred times this week" (aggregate only)

---

## Family Consent Protocol

Wife + kids opt-in:
- "Is this your wife's device? Want to detect when she's nearby?"
- Wife can say: "Yes, show me when Bruce is home too"
- Kids (parents decide): "Track kids only if parents want presence awareness"
- Bidirectional: If wife says "no," system doesn't detect her

---

# PART V: THE THEOLOGY

## Why This Matters

This system is built on a conviction: **Deep self-knowledge is a spiritual practice.**

When you understand your patterns, you become:
- Harder to manipulate
- Freer to choose
- More aligned with your values
- More available to your family
- More trustworthy with sacred things

This isn't productivity optimization. This is **integrity infrastructure**.

---

## The Promise

This system promises to:

1. **Witness faithfully** - Observe without judgment
2. **Serve your values** - Support family, faith, rest
3. **Respect your autonomy** - You control everything
4. **Honor your family** - Protect them, don't expose them
5. **Deepen your faith** - Support spiritual practices
6. **Give you clarity** - See your patterns honestly
7. **Never betray you** - No hidden tracking, no data sales, no games

If any feature violates these promises, it gets cut.

---

# PART VI: APPENDICES

## Appendix A: Complete Data Flow Diagram

```
PHONE (Local, Encrypted)
├─ Geofence tracking → "At basecamp"
├─ Step counter → "8,400 steps today"
├─ Motion sensors → "Walking at intensity 7"
├─ Time tracking → "Thursday, 3:47pm"
├─ Weather API → "Clear, 72°F"
├─ WiFi detection → "At home (home WiFi connected)"
├─ Bluetooth detection → "Wife nearby, kids nearby"
├─ Notification counter → "3 notifications this hour"
└─ Sleep tracking → "7.5 hours last night"

                    ↓

AMBIENT CONTEXT SYNTHESIS
├─ Combines all signals
├─ Checks sacred boundaries
├─ Computes: focus_risk, family_opportunity, drift_risk
└─ Stores locally (encrypted)

                    ↓

WHEN BRUCE LOGS (Morning)
├─ System shows: "At desk, slept 7.5h, weather clear"
├─ Bruce provides: "Energy level: 8/10, Intention: deep work"
└─ Log saved with all context

                    ↓

WEEKLY SYNTHESIS (AI Analysis)
├─ Claude API analyzes patterns
├─ Generates narrative: "Strong basecamp sessions correlate with focus"
├─ Suggests correlations: "Clear days + afternoon = best thinking"
└─ Shows: "Family time increased when you protected basecamp"
```

---

## Appendix B: Sacred Boundaries Reference Card

| Boundary | Protects | Rule |
|----------|----------|------|
| Family Privacy | Wife, kids, marriage | Never expose names/actions to third parties |
| Faith Alignment | Spiritual practices | Never gamify or analyze sacred moments |
| Data Ownership | Personal autonomy | Always exportable, always deletable |
| Sunday Rest | Holy day | No tracking, no optimization suggestions |
| Consent First | User agency | Always ask before recording/analyzing |

---

## Appendix C: Implementation Checklist

- [ ] Vision locked and understood by team
- [ ] Data model approved (Tier 1 + family detection)
- [ ] Sacred boundaries documented
- [ ] SESSION 1 ready to begin (geofence infrastructure)
- [ ] Roadmap fits teaching deadline
- [ ] Fresh AI has context (Opus prompt prepared)
- [ ] Bruce ready to start building

---

## Appendix D: Common Questions

**Q: Isn't tracking my family creepy?**  
A: Only if it's one-directional and non-consensual. This is bidirectional (wife sees you too) and opt-in. It's not "monitoring," it's "presence awareness." Like knowing your family is home.

**Q: What if the system gets hacked?**  
A: All data stored locally and encrypted. Hacker would need physical phone. Cloud APIs use OAuth (your data isn't exposed there either). No email/password stored.

**Q: How much does this cost?**  
A: Free. Weather API is free. Cloud AI calls are optional and cached. Estimated <$5/month for everyone.

**Q: What if I don't want family detection?**  
A: Sessions 1-8 work perfectly without it. Session 2 is optional. You can skip it entirely.

**Q: Does this replace therapy/counseling?**  
A: No. This is a journal with superpowers, not therapy. It helps you understand yourself better so you can get more out of therapy.

---

# FINAL WORD

This isn't just a feature roadmap. It's infrastructure for a life aligned with what matters.

When teaching gets hard, this system reminds you: "You're most yourself at basecamp in the afternoon."

When marriage needs tending, this system shows: "You connected best when you slowed down Tuesday nights."

When faith feels distant, this system witnesses: "Your spiritual practices correlate with family peace."

**Build this with excellence. It matters.**

---

**Status:** VISION LOCKED  
**Sacred Boundaries:** NON-NEGOTIABLE  
**Family Detection:** INCLUDED  
**Ready for:** Development Sprint

Let's go build something faithful.

---

*"Where two are gathered, so am I." — Matthew 18:20*

*You + The System + God's attention. That's Ambient Witness.*
