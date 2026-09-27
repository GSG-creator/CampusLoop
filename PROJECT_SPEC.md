# CAMPUSLOOP Specification & Implementation Tracker
**Tagline:** Learn. Share. Earn. Grow.

## 1. Project Overview
CAMPUSLOOP is a peer-to-peer campus platform where students share used books and provide free peer mentoring. Verified contributors earn Campus Credits that unlock canteen perks and sponsored campus rewards.

The app supports a dual architecture:
- **Firebase Connected Mode**: Ready for Firebase Auth & Firestore rules.
- **Explicit DEMO MODE**: Interactive local persistence storing shared campus state across demo user switches in the browser. Clear banner and role status indicators.

---

## 2. Personas & Roles
| Name | Grade/Role | Campus Credits | Capabilities |
|------|------------|----------------|--------------|
| **Aarav** | Junior, Grade 10 | 350 | Browse/search books, reserve books, request peer mentoring, view personal wallet & orders |
| **Meera** | Senior, Grade 12 | 1,250 | List books (Donate, Lend/Rent, Sell), manage listings, confirm book handovers (+50 for donation, +20 upon lending return completion) |
| **Rohan** | Senior + Verified Maths/Physics Mentor | 9,940 | Accept/conduct mentoring sessions, list books, track towards 10,010 milestone reward |
| **Ananya** | Teacher / Admin | 0 (Admin) | Platform oversight, audit book listings, dispute resolution, verify mentors & transactions |

---

## 3. Seeded Data Specification
### Books (Owned by Meera)
1. **RD Sharma Class 10 (Mathematics)**
   - Type: `donate` (Donation)
   - Condition: `Like New`
   - Subject: `Mathematics`, Grade: `Grade 10`
   - Mock Price: `0 Credits / Free`
   - Reward: `+50 Campus Credits` to donor upon confirmed handover.
2. **Concepts of Physics (HC Verma Vol 1)**
   - Type: `rent` (Lend / Rent)
   - Condition: `Good`
   - Subject: `Physics`, Grade: `Grade 11-12`
   - Rental Duration: `1 Month`
   - Rental Rate: `30 Credits/month` (or simulated credit deposit)
   - Reward: `+20 Campus Credits` to lender upon verified return completion.
3. **Oswaal Science Question Bank Class 10**
   - Type: `sell` (Pre-loved Sale)
   - Condition: `Very Good`
   - Subject: `Science`, Grade: `Grade 10`
   - Mock Price: `₹180` (Simulated cash / student deal)

---

## 4. Workflows & State Machine
### A. Book Exchange Workflow
1. **Listing Creation (Seniors & Mentors only)**
   - Form fields: Title, Author, Grade, Subject, Condition, Description, Listing Type (Donate, Lend/Rent, Sell), Rental Duration (if Rent), Mock Price (if Sell/Rent).
   - Strict validation: Never award credits merely for listing.
2. **Browsing & Discovery**
   - Instant search by title/author/subject.
   - Filter by listing type (`All`, `Donate`, `Lend/Rent`, `Sell`).
   - Filter by Grade (`All`, `Grade 9`, `Grade 10`, `Grade 11`, `Grade 12`).
   - Filter by Subject (`Mathematics`, `Physics`, `Science`, etc.).
   - Filter by Availability (`All`, `Available only`).
3. **Reservation & Anti-Double-Booking**
   - Any junior/senior (other than the owner) can reserve an available book.
   - Atomic state change: `available` -> `reserved`.
   - Double-booking prevention enforced via guard check & transactional state update.
4. **Handover Confirmation**
   - Book owner (Meera) or Admin sees pending handover in their dashboard.
   - Clicking "Confirm Handover":
     - For `donate`: Status -> `donated`. Meera receives `+50 Campus Credits`. Transaction logged in shared ledger.
     - For `rent`: Status -> `lent_out`. Borrower receives book; active rental logged.
     - For `sell`: Status -> `sold`. Transfer completed.
5. **Rental Return & Cycle Completion**
   - For lent books, owner clicks "Confirm Return Received".
   - Status -> `available` (or completed).
   - Meera receives `+20 Campus Credits` reward for completing lending cycle.

### B. Credit Engine Rules
- Double-booking prevented.
- No negative balances allowed.
- Transactions recorded once in immutable ledger with timestamp, reason, counterparty, and delta.
- State persists across page refreshes and demo account switching.

---

## 5. Implementation Roadmap
- [x] Step 1: Foundation, Shared State Store, Multi-Role Demo Switcher, Book Exchange Engine & UI.
- [x] Step 2: Peer Mentoring Module & Credit Engine (Aarav requests Applications of Trigonometry -> Rohan accepts -> session finished -> final quiz & 5★ feedback -> +70 credits -> Rohan 9,940 to 10,010 milestone).
- [x] Step 3: Rewards Marketplace, Limited Canteen Tier Freebies, QR Counter Scan, Admin Controls & Impact Reporting.
- [x] Step 4: Full-Stack Loop AI Academic Assistant with gemini-3.1-pro-preview and High Thinking Level.

---

## 6. Verification & Test Log (Step 1)
- [x] Test 1: Seed data initialization & local persistence verification (Aarav 350 cr, Meera 1,250 cr, Rohan 9,940 cr, Ananya Admin). PASSED.
- [x] Test 2: Role switching between Aarav, Meera, Rohan, and Ananya with shared state preserved in localStorage. PASSED.
- [x] Test 3: Aarav reserves "RD Sharma Class 10". Verified status transitions to `reserved` and double-booking is blocked. PASSED.
- [x] Test 4: Switch to Meera -> Confirm Handover. Verified +50 credits awarded to Meera (1,250 -> 1,300 cr), transaction recorded in ledger. PASSED.
- [x] Test 5: Lending cycle test: Reserve "HC Verma Physics" -> Confirm Handover -> Return Book -> Verified +20 credits awarded to Meera (1,300 -> 1,320 cr). PASSED.
- [x] Test 6: Page refresh retains state without data reset (serialization/deserialization confirmed). PASSED.
- [x] Test 7: Automated unit & scenario test suite (`src/tests/verify_step1.ts`) passed 28/28 assertions with 0 failures. PASSED.

---

## 7. Verification & Test Log (Step 2: Peer Mentoring & Credit Engine)
- [x] Test 1: Junior Request Academic Help form collects subject, topic, grade, date, time, and description.
- [x] Test 2: Mentoring is 100% FREE for junior (0 credits deducted from Aarav, balance remains 350 CR).
- [x] Test 3: Self-mentoring blocked (mentor cannot request session from themselves).
- [x] Test 4: Conflicting bookings prevented (cannot schedule mentor on identical date and time slot).
- [x] Test 5: Pre-session diagnostic baseline quiz scored in application code (Applications of Trigonometry: 1/3 = 33.3%). AI not required.
- [x] Test 6: Mentor acceptance: only verified mentors (Rohan) can accept incoming requests.
- [x] Test 7: Mentor marks session finished with clearly labelled session-time simulation in demo mode. Status transitions to `awaiting_learner_confirmation`.
- [x] Test 8: CRITICAL: Zero credits awarded on mentor's click alone (Rohan remains at 9,940 CR).
- [x] Test 9: Junior confirms attendance, completes post-session final quiz (3/3 = 100%), and submits 5-star feedback.
- [x] Test 10: Observed quiz change recorded as diagnostic score improvement (+67 percentage points), not proof of long-term learning.
- [x] Test 11: Credit Engine Formula:
  - Confirmed completed session: +40 CR
  - Feedback rating ≥ 4 stars: +10 CR
  - Observed quiz gain ≥ 30 pp: +20 CR
  - Total awarded to Rohan: exactly +70 CR (9,940 → 10,010 CR).
- [x] Test 12: Duplicate-award prevention: Retries and refreshes rejected with idempotency lock (`creditAwarded: true`). Balance remains 10,010 CR.
- [x] Test 13: Wallet view updated with transaction ledger, filter tabs, milestone progress (10,010 CR unlocked), and expandable breakdown cards.
- [x] Test 14: Automated unit & scenario test suite (`src/tests/verify_step2.ts`) passed 33/33 assertions with 0 failures. PASSED.

---

## 8. Verification & Test Log (Step 3: Rewards, Canteen, Admin & Impact)
- [x] Test 1: Reward Tiers: Starter (0), Bronze (500), Silver (1,500), Gold (3,000), Diamond (7,500), Legend (10,000). PASSED.
- [x] Test 2: Configurable catalogue categories: Snacks, Meals, Stationery/Printing, Book Vouchers, Accessories, and Tech Vault. PASSED.
- [x] Test 3: Main WOW Moment: Rohan completes mentoring session (+70 CR), animates 9,940 → 10,010 CR, progress bar completes 100%, modal displays "10,000 CREDIT MILESTONE! Laptop / iPad / Tablet Reward Vault eligibility unlocked". PASSED.
- [x] Test 4: Major device transparency labels: "Simulated sponsor-funded reward; subject to approval and availability. Crossing the threshold is eligibility, not a guaranteed free device. No cash withdrawal or real payment integration." PASSED.
- [x] Test 5: Limited tier-based freebies:
  - Starter: 0 free snacks.
  - Bronze: 1 snack/month.
  - Silver: 2 snacks/month.
  - Gold/Diamond: 1 snack/week.
  - Legend: additionally unlocks 1 welcome sandwich-and-juice combo. PASSED.
- [x] Test 6: Freebies do not deduct credits from user balance. PASSED.
- [x] Test 7: Duplicate freebies within current period strictly prevented with quota error message. PASSED.
- [x] Test 8: QR-style counter voucher generated with unique code and labelled "SIMULATE CANTEEN SCANNER" button. PASSED.
- [x] Test 9: Counter scan marks voucher as `scanned_and_collected`; duplicate scans blocked. PASSED.
- [x] Test 10: Admin Controls in `AdminAuditView`:
  - Toggle verified mentor status (Verify / Suspend mentors).
  - Review sessions and complete transaction ledger.
  - Review and approve/reject mock Tech Vault allocation requests with faculty notes.
  - Audit canteen voucher redemptions. PASSED.
- [x] Test 11: Impact Reporting Standard:
  - Textbooks reused count from active circulations.
  - Estimated student savings (₹350 per book based on CBSE retail benchmarks).
  - Mentoring hours (0.75h per 45-min completed session).
  - Zero invented carbon figures or unverified environmental claims. PASSED.
- [x] Test 12: Repeatable Demo Reset action:
  - Restores exact opening state: Rohan 9,940 CR (Diamond tier), Meera 1,250 CR, Aarav 350 CR, zero active sessions, and cleared redemptions. PASSED.
- [x] Test 13: Loop AI Copilot integration:
  - Backend proxy route `/api/loop-ai` using `gemini-3.1-pro-preview` with `thinkingConfig: { thinkingLevel: 'HIGH' }`.
  - Analytical STEM guidance (e.g. CBSE Class 10 Applications of Trigonometry), textbook suggestions, and credit strategy. PASSED.
- [x] Test 14: Automated unit & scenario test suite (`src/tests/verify_step3.ts`) passed 56/56 assertions with 0 failures. PASSED.

---

## 9. Verification & Test Log (Floating Role-Aware LOOP AI Assistant)
- [x] Test 1: Floating Widget Deployment:
  - Accessible on all screens via a persistent bottom-right floating trigger button (`FloatingLoopAI`).
  - Displays role-aware status indicator with user persona name, grade, and active credits.
  - Expandable to responsive floating drawer with minimize, close, and clear chat controls. PASSED.
- [x] Test 2: Core Working Logic Preserved:
  - No changes made to working book reservation, peer mentoring, credit awarding, or canteen redemption logic. PASSED.
- [x] Test 3: Configurable Model & Server-Side Secrets:
  - Configurable model via `process.env.GEMINI_MODEL || 'gemini-3.8-flash'`.
  - API keys strictly maintained in server-side secrets (`GEMINI_API_KEY`).
  - Zero exposure of keys to client runtime. PASSED.
- [x] Test 4: Rate Limiting & Minimal Context:
  - Per-user in-memory request limit enforced on server (max 20 requests/min per authenticated `userId`).
  - Returns HTTP 429 with retry cooldown when exceeded.
  - Sanitized, minimal context passed to LLM. Untrusted inputs delimited with safety tags. PASSED.
- [x] Test 5: Supported Actions with Authentic Data:
  - **Search available books:** Matches RD Sharma Class 10, HC Verma Physics, and Oswaal Science from real catalogue with "View Details" and "Confirm & Reserve Book" cards. Never hallucinates stock.
  - **Find verified mentors:** Retrieves Rohan Verma with verified Mathematics & Physics credentials. Filters out unverified seniors and juniors.
  - **Show upcoming sessions:** Queries real sessions for authenticated student or mentor.
  - **Wallet & Milestone Progress:** Computes exact distance to 10,000 CR Legend tier (e.g., Aarav needs 9,650 CR; Rohan starts needing 60 CR, reaches 0 CR after session completion).
  - **Canteen Benefits:** Evaluates active tier quota (Starter: 0 free; Bronze: 1/mo; Silver: 2/mo; Gold/Diamond: 1/wk; Legend: 1 welcome combo) and claim state.
  - **Help create mentoring request:** Drafts request with verified mentor, subject, topic, date, and lunch break time. Requires explicit user confirmation.
  - **Practice quiz generation:** Interactive 3-question quiz with instant answer selection, scoring, and step-by-step mathematical explanations. PASSED.
- [x] Test 6: Explicit Confirmation & Permission Enforcement:
  - Actions (book reservation, mentoring request) show exact details and require explicit button click confirmation.
  - Executed strictly through application service methods (`reserveBook`, `requestMentoringSession`) with full invariant checks.
  - Identity derived solely from server session; typed text cannot override permissions. Self-reservation and unverified mentors blocked. AI never modifies credits directly. PASSED.
- [x] Test 7: Graceful Degradation & Zero Fake Live AI:
  - When Gemini API is unavailable or offline, clearly displays offline status and offline reason.
  - Provides direct ordinary navigation shortcuts. Direct queries display verified system database matches.
  - Never presents canned static responses as live AI. PASSED.
- [x] Test 8: Automated Verification Suite:
  - `src/tests/verify_loop_ai.ts` passed 57/57 assertions with 0 failures. PASSED.

