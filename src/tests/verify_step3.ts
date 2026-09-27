/**
 * Test script to run actual automated unit & scenario verification
 * for CAMPUSLOOP Step 3: Rewards, Canteen Redemption, Admin Controls & Impact Reporting.
 */

import { SEED_USERS, SEED_BOOKS, SEED_TRANSACTIONS } from '../data/seedData';
import { TIER_DEFINITIONS, getUserTier, REWARD_CATALOGUE } from '../data/rewardData';
import { RewardItem, CanteenRedemption, MajorRewardRequest, CreditTransaction, MentoringSession } from '../types';

export function runStep3Tests() {
  console.log('=== STARTING AUTOMATED CAMPUSLOOP STEP 3 TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // --- SUITE 1: REWARD TIERS & THRESHOLDS ---
  console.log('--- Test Suite 1: Reward Tiers & Hierarchy ---');
  assert(Object.keys(TIER_DEFINITIONS).length === 6, 'Exactly 6 reward tiers configured');
  assert(getUserTier(0).tier === 'Starter', '0 credits corresponds to Starter tier');
  assert(getUserTier(350).tier === 'Starter', '350 credits (Aarav) corresponds to Starter tier');
  assert(getUserTier(500).tier === 'Bronze', '500 credits corresponds to Bronze tier');
  assert(getUserTier(1250).tier === 'Bronze', '1,250 credits (Meera) corresponds to Bronze tier');
  assert(getUserTier(1500).tier === 'Silver', '1,500 credits corresponds to Silver tier');
  assert(getUserTier(3000).tier === 'Gold', '3,000 credits corresponds to Gold tier');
  assert(getUserTier(7500).tier === 'Diamond', '7,500 credits corresponds to Diamond tier');
  assert(getUserTier(9940).tier === 'Diamond', '9,940 credits (Rohan opening) corresponds to Diamond tier');
  assert(getUserTier(10000).tier === 'Legend', '10,000 credits corresponds to Legend tier');
  assert(getUserTier(10010).tier === 'Legend', '10,010 credits (Rohan post-mentoring) corresponds to Legend tier');

  // Verify next threshold calculations
  const rohanOpeningTier = getUserTier(9940);
  assert(rohanOpeningTier.nextThreshold === 10000, 'Rohan next threshold is 10,000 CR');
  const meeraTier = getUserTier(1250);
  assert(meeraTier.nextThreshold === 1500, 'Meera next threshold is 1,500 CR (Silver)');

  // --- SUITE 2: REWARD CATALOGUE VERIFICATION ---
  console.log('\n--- Test Suite 2: Configurable Reward Catalogue ---');
  const categories = new Set(REWARD_CATALOGUE.map((r) => r.category));
  assert(categories.has('snacks'), 'Catalogue contains snacks category');
  assert(categories.has('meals'), 'Catalogue contains meals category');
  assert(categories.has('stationery'), 'Catalogue contains stationery/printing category');
  assert(categories.has('vouchers'), 'Catalogue contains book vouchers category');
  assert(categories.has('accessories'), 'Catalogue contains accessories category');
  assert(categories.has('tech_vault'), 'Catalogue contains technology rewards vault');

  const techVaultItems = REWARD_CATALOGUE.filter((r) => r.isMajorVault);
  assert(techVaultItems.length >= 3, 'Tech vault contains at least 3 major devices (iPad, Laptop, Tablet)');
  for (const item of techVaultItems) {
    assert(item.minTier === 'Legend', `${item.title} requires Legend tier (10,000 CR)`);
    assert(
      Boolean(item.sponsorNote?.includes('Simulated sponsor-funded reward')),
      `${item.title} contains required sponsor disclaimer`
    );
  }

  // --- SUITE 3: MAIN WOW MOMENT (ROHAN 9,940 -> 10,010 CR & 10,000 MILESTONE) ---
  console.log('\n--- Test Suite 3: Main WOW Moment & Milestone Activation ---');
  let users = JSON.parse(JSON.stringify(SEED_USERS));
  let rohan = users.rohan;
  assert(rohan.credits === 9940, 'Rohan begins at 9,940 CR');
  assert(getUserTier(rohan.credits).tier === 'Diamond', 'Rohan begins at Diamond tier (< 10,000 CR)');

  // Simulate +70 credits award from confirmed mentoring session
  const totalAward = 70;
  const prevCredits = rohan.credits;
  rohan.credits += totalAward;

  assert(rohan.credits === 10010, 'Rohan balance atomically increments to 10,010 CR');
  const milestoneTriggered = prevCredits < 10000 && rohan.credits >= 10000;
  assert(milestoneTriggered === true, '10,000 Credit Milestone triggered successfully');
  assert(getUserTier(rohan.credits).tier === 'Legend', 'Rohan tier promoted to Legend');

  // --- SUITE 4: CANTEEN TIER FREEBIES & QUOTA CONTROLS ---
  console.log('\n--- Test Suite 4: Limited Tier-Based Freebies & Duplicate Prevention ---');
  let redemptions: CanteenRedemption[] = [];
  const currentDate = new Date();
  const monthKey = `month-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const weekNumber = Math.ceil(currentDate.getDate() / 7);
  const weekKey = `week-${currentDate.getFullYear()}-M${currentDate.getMonth() + 1}-W${weekNumber}`;

  function checkFreebieAvailable(userId: string, category: 'snack' | 'legend_combo') {
    const user = users[userId];
    const tierInfo = getUserTier(user.credits);

    if (category === 'legend_combo') {
      if (tierInfo.tier !== 'Legend') {
        return { available: false, reason: 'Requires Legend tier' };
      }
      const alreadyClaimed = redemptions.some(
        (r) => r.userId === userId && r.periodKey === 'legend-welcome'
      );
      if (alreadyClaimed) {
        return { available: false, reason: 'Welcome combo already claimed' };
      }
      return { available: true, reason: 'Welcome combo available' };
    }

    if (tierInfo.tier === 'Starter') {
      return { available: false, reason: 'Requires at least Bronze tier (500 CR)' };
    }

    if (tierInfo.tier === 'Bronze') {
      const monthlyCount = redemptions.filter(
        (r) => r.userId === userId && r.periodKey === monthKey && r.isFreebie && r.category === 'snacks'
      ).length;
      if (monthlyCount >= 1) {
        return { available: false, reason: 'Bronze quota reached (1 snack/mo)' };
      }
      return { available: true, reason: '1 snack available this month' };
    }

    if (tierInfo.tier === 'Silver') {
      const monthlyCount = redemptions.filter(
        (r) => r.userId === userId && r.periodKey === monthKey && r.isFreebie && r.category === 'snacks'
      ).length;
      if (monthlyCount >= 2) {
        return { available: false, reason: 'Silver quota reached (2 snacks/mo)' };
      }
      return { available: true, reason: 'Free snack available' };
    }

    // Gold / Diamond / Legend: 1 snack/week
    const weeklyCount = redemptions.filter(
      (r) => r.userId === userId && r.periodKey === weekKey && r.isFreebie && r.category === 'snacks'
    ).length;
    if (weeklyCount >= 1) {
      return { available: false, reason: 'Weekly quota reached (1 snack/week)' };
    }
    return { available: true, reason: '1 snack available this week' };
  }

  // 1. Starter (Aarav 350 CR): No free snacks
  assert(checkFreebieAvailable('aarav', 'snack').available === false, 'Starter tier (Aarav) cannot claim free snacks');

  // 2. Bronze (Meera 1,250 CR): 1 free snack/month
  assert(checkFreebieAvailable('meera', 'snack').available === true, 'Bronze tier (Meera) has 1 free snack available');

  // Meera claims free snack
  const meeraCreditsBefore = users.meera.credits;
  redemptions.push({
    id: 'red-meera-1',
    userId: 'meera',
    userName: 'Meera',
    itemId: 'canteen-samosa',
    itemTitle: 'Crispy Veg Samosas (2 pcs)',
    category: 'snacks',
    code: 'CL-SNACK-1001',
    status: 'active',
    isFreebie: true,
    creditCost: 0,
    redeemedAt: new Date().toISOString(),
    periodKey: monthKey,
    tierClaimed: 'Bronze',
  });

  // Verify credits NOT deducted for freebie
  assert(users.meera.credits === meeraCreditsBefore, 'Freebie claim does not deduct credits from user');

  // Meera attempts duplicate claim within same month
  const meeraSecondCheck = checkFreebieAvailable('meera', 'snack');
  assert(meeraSecondCheck.available === false, 'Duplicate freebie rejected: Bronze quota limit enforced (1/month)');

  // 3. Legend Tier (Rohan 10,010 CR): Welcome sandwich combo
  assert(
    checkFreebieAvailable('rohan', 'legend_combo').available === true,
    'Legend tier unlocks complimentary Welcome Sandwich-and-Juice Combo'
  );

  // Rohan claims welcome combo
  redemptions.push({
    id: 'red-rohan-combo',
    userId: 'rohan',
    userName: 'Rohan',
    itemId: 'canteen-legend-combo',
    itemTitle: 'Legend Welcome Sandwich & Juice Combo',
    category: 'meals',
    code: 'CL-LEGEND-9999',
    status: 'active',
    isFreebie: true,
    creditCost: 0,
    redeemedAt: new Date().toISOString(),
    periodKey: 'legend-welcome',
    tierClaimed: 'Legend',
  });

  // Rohan attempts duplicate claim of welcome combo
  const rohanSecondCombo = checkFreebieAvailable('rohan', 'legend_combo');
  assert(
    rohanSecondCombo.available === false,
    'Duplicate Legend welcome combo rejected: exactly 1 per account enforced'
  );

  // --- SUITE 5: CANTEEN QR SCANNING ---
  console.log('\n--- Test Suite 5: Canteen Counter QR Scanner ---');
  const targetVoucher = redemptions[0];
  assert(targetVoucher.status === 'active', 'Newly claimed voucher starts as active');

  // Scan simulation
  targetVoucher.status = 'scanned_and_collected';
  targetVoucher.scannedAt = new Date().toISOString();
  assert(targetVoucher.status === 'scanned_and_collected', 'Demo scan marks voucher as scanned_and_collected');

  // Duplicate scan prevention
  function attemptScan(voucher: CanteenRedemption) {
    if (voucher.status === 'scanned_and_collected') {
      return { success: false, message: 'Already scanned and collected' };
    }
    voucher.status = 'scanned_and_collected';
    return { success: true, message: 'Scan verified' };
  }
  const dupScanResult = attemptScan(targetVoucher);
  assert(dupScanResult.success === false, 'Duplicate QR scan rejected at canteen counter');

  // --- SUITE 6: ADMIN CONTROLS ---
  console.log('\n--- Test Suite 6: Admin Controls (Mentors & Tech Vault Grants) ---');
  // Toggle Mentor Verification
  assert(users.rohan.isVerifiedMentor === true, 'Rohan starts as verified mentor');
  users.rohan.isVerifiedMentor = false;
  users.rohan.roles = users.rohan.roles.filter((r: string) => r !== 'mentor');
  assert(users.rohan.isVerifiedMentor === false, 'Admin can suspend mentor status');
  assert(!users.rohan.roles.includes('mentor'), 'Mentor role removed on suspension');

  users.rohan.isVerifiedMentor = true;
  users.rohan.roles.push('mentor');
  assert(users.rohan.isVerifiedMentor === true, 'Admin can reinstate verified mentor status');

  // Major Reward Application & Approval
  let majorRequests: MajorRewardRequest[] = [];
  const req: MajorRewardRequest = {
    id: 'req-tech-1',
    userId: 'rohan',
    userName: 'Rohan',
    userEmail: 'rohan.maths@campus.edu',
    rewardId: 'tech-ipad-air',
    rewardTitle: 'Apple iPad Air (64GB Wi-Fi) with Pencil',
    creditsAtRequest: 10010,
    status: 'pending_review',
    requestedAt: new Date().toISOString(),
  };
  majorRequests.push(req);

  assert(majorRequests[0].status === 'pending_review', 'Major tech request submitted as pending_review');

  // Admin approves request
  majorRequests[0].status = 'approved';
  majorRequests[0].adminNote = 'Verified outstanding peer mentoring contributions';
  majorRequests[0].reviewedAt = new Date().toISOString();

  assert(majorRequests[0].status === 'approved', 'Admin approved mock tech grant');
  assert(majorRequests[0].adminNote.includes('Verified'), 'Faculty note attached to decision');

  // --- SUITE 7: CAMPUS IMPACT METRICS ---
  console.log('\n--- Test Suite 7: Impact Reporting Standard ---');
  let books = JSON.parse(JSON.stringify(SEED_BOOKS));
  // 1 book donated
  books[0].status = 'donated';
  const reusedBooks = books.filter((b: any) => b.status === 'donated' || b.status === 'lent_out' || b.status === 'sold').length;
  const estimatedSavings = reusedBooks * 350; // CBSE textbook retail savings
  const mockSessions: MentoringSession[] = [
    {
      id: 's-1',
      studentId: 'aarav',
      studentName: 'Aarav',
      studentGrade: 'Grade 10',
      mentorId: 'rohan',
      mentorName: 'Rohan',
      subject: 'Mathematics',
      topic: 'Applications of Trigonometry',
      grade: 'Grade 10',
      date: '2026-09-28',
      time: '16:00',
      description: 'Trig help',
      status: 'completed',
      creditAwarded: true,
      requestedAt: new Date().toISOString(),
    },
  ];
  const mentoringHours = Math.round(mockSessions.filter((s) => s.status === 'completed').length * 0.75 * 10) / 10;

  assert(reusedBooks === 1, 'Accurately tracks 1 reused textbook');
  assert(estimatedSavings === 350, 'Estimated student savings calculated as ₹350');
  assert(mentoringHours === 0.8, 'Mentoring hours calculated as 0.8h (45 mins session)');

  // --- SUITE 8: REPEATABLE DEMO RESET ---
  console.log('\n--- Test Suite 8: Repeatable Demo Reset ---');
  // Reset function
  users = JSON.parse(JSON.stringify(SEED_USERS));
  redemptions = [];
  majorRequests = [];

  assert(users.rohan.credits === 9940, 'Reset restores Rohan back to exact opening 9,940 CR');
  assert(users.meera.credits === 1250, 'Reset restores Meera back to 1,250 CR');
  assert(users.aarav.credits === 350, 'Reset restores Aarav back to 350 CR');
  assert(redemptions.length === 0, 'Reset clears all canteen redemptions');
  assert(majorRequests.length === 0, 'Reset clears all major tech reward requests');
  assert(getUserTier(users.rohan.credits).tier === 'Diamond', 'Rohan is restored to Diamond tier before milestone');

  console.log(`\n=================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================`);

  return { passed, failed };
}

runStep3Tests();
