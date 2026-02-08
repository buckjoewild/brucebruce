# Non-goals and safety constraints

**Audience:** All users (governance document)  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Define what this system is NOT trying to do, and constraints that should not be violated.

## Non-goals

These are explicitly NOT goals of this system:

### 1. Social features

| Not a goal | Why |
|------------|-----|
| User-to-user sharing | This is a personal system |
| Public profiles | Privacy first |
| Leaderboards | No competition with others |
| Collaborative editing | Single-user focused |

### 2. Gamification

| Not a goal | Why |
|------------|-----|
| Achievement badges | Avoid extrinsic motivation traps |
| Streak pressure | Signals, not guilt |
| Points/levels | Not a game |
| Rewards for consistency | Truth > performance |

### 3. Prescriptive advice

| Not a goal | Why |
|------------|-----|
| "You should..." recommendations | Human agency first |
| Automated interventions | User decides what to do |
| Goal suggestions | User sets own goals |
| Behavior nudges | No manipulation |

### 4. Scale

| Not a goal | Why |
|------------|-----|
| Multi-tenant SaaS | Personal tool first |
| Enterprise features | Simplicity over complexity |
| Team management | Not a team tool |
| API for third parties | Private by default |

### 5. Monetization of user data

| Not a goal | Why |
|------------|-----|
| Selling data | Obviously not |
| Advertising | No ads |
| Analytics to third parties | Privacy first |
| "Insights" products | User owns their data |

## Safety constraints

These constraints should NOT be violated:

### 1. Data integrity

| Constraint | Implementation |
|------------|----------------|
| No silent data deletion | Destructive actions require confirmation |
| No data modification without user action | System doesn't edit user content |
| Backups are user-accessible | Export always works |

### 2. Privacy

| Constraint | Implementation |
|------------|----------------|
| No sharing without consent | Opt-in only |
| No analytics collection | No tracking scripts |
| No third-party data access | Data stays on your server |

### 3. Autonomy

| Constraint | Implementation |
|------------|----------------|
| User can always export | Export endpoint always available |
| User can run locally | Standalone mode supported |
| User can turn off AI | AI is optional |
| User can delete account | (TBD - planned) |

### 4. Transparency

| Constraint | Implementation |
|------------|----------------|
| AI responses labeled as AI | Clear attribution |
| Drift signals explained | Documentation available |
| No hidden features | Open source |

## Trade-offs accepted

These are intentional limitations:

### Simplicity over features

- Fewer features, but ones that work
- No feature bloat
- Clear purpose for each function

### Personal over collaborative

- Great for one user
- Not designed for teams
- Family use is possible but not optimized

### Local over cloud

- Standalone-first design
- Cloud (Replit) is convenient, not required
- User controls their data

### Manual over automated

- User initiates actions
- No automated posting
- No scheduled interventions

## Red lines

These should NEVER happen:

1. **Data sold or shared without consent** - Never
2. **AI making decisions for user** - AI provides information, user decides
3. **Guilt/shame messaging** - Signals, not judgments
4. **Lock-in** - Export always works, can run locally
5. **Feature creep violating core principles** - Refer to this document

## Future feature filter

When considering new features, ask:

1. Does it violate any non-goal?
2. Does it cross any safety constraint?
3. Does it respect the trade-offs?
4. Does it cross any red line?

If any answer is "yes," the feature should be reconsidered or rejected.

## References

- Privacy red-zones: `42-privacy-red-zones-and-sharing-boundaries.md`
- Drift signals: `41-drift-detection-signals.md`
- LifeOps/ThinkOps separation: `40-lifeops-thinkops-separation.md`
