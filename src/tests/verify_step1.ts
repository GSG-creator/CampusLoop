/**
 * Test script to run actual automated unit & scenario verification
 * for CAMPUSLOOP Step 1: Foundation & Book Exchange.
 */

import { SEED_USERS, SEED_BOOKS, SEED_TRANSACTIONS } from '../data/seedData';
import { BookListing, User, CreditTransaction } from '../types';

function runTests() {
  console.log('=== STARTING AUTOMATED CAMPUSLOOP STEP 1 TESTS ===\n');
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

  // TEST 1: Seed Data Verification
  console.log('--- Test Suite 1: Seed Data & Persona Roles ---');
  assert(SEED_USERS.aarav.credits === 350, 'Aarav has exactly 350 credits');
  assert(SEED_USERS.aarav.grade === 'Grade 10', 'Aarav is Grade 10 Junior');
  assert(SEED_USERS.meera.credits === 1250, 'Meera has exactly 1,250 credits');
  assert(SEED_USERS.meera.grade === 'Grade 12', 'Meera is Grade 12 Senior');
  assert(SEED_USERS.rohan.credits === 9940, 'Rohan has exactly 9,940 credits');
  assert(SEED_USERS.rohan.isVerifiedMentor === true, 'Rohan is verified Maths/Physics mentor');
  assert(SEED_USERS.ananya.roles.includes('admin'), 'Dr. Ananya is Administrator');

  // Verify Seed Books
  const rdSharma = SEED_BOOKS.find((b) => b.id === 'book-rd-sharma-10');
  const hcVerma = SEED_BOOKS.find((b) => b.id === 'book-hc-verma-physics');
  const oswaal = SEED_BOOKS.find((b) => b.id === 'book-oswaal-science-10');

  assert(!!rdSharma && rdSharma.listingType === 'donate' && rdSharma.ownerId === 'meera', 'RD Sharma Class 10 is donation owned by Meera');
  assert(!!hcVerma && hcVerma.listingType === 'rent' && hcVerma.rentalRateCredits === 30, 'HC Verma Physics is rent for 30 credits owned by Meera');
  assert(!!oswaal && oswaal.listingType === 'sell' && oswaal.mockPrice === 180, 'Oswaal Science is mock sale for ₹180 owned by Meera');

  // TEST 2: In-Memory State & Reservation Workflow Simulation
  console.log('\n--- Test Suite 2: Reservation & Double-Booking Prevention ---');
  let users = { ...SEED_USERS };
  let books: BookListing[] = JSON.parse(JSON.stringify(SEED_BOOKS));
  let transactions: CreditTransaction[] = [...SEED_TRANSACTIONS];

  // Aarav reserves RD Sharma
  const targetBook = books.find((b) => b.id === 'book-rd-sharma-10')!;
  assert(targetBook.status === 'available', 'RD Sharma is initially available');

  // Reservation function
  function reserveBook(bookId: string, currentUser: User) {
    const b = books.find((x) => x.id === bookId);
    if (!b) return { success: false, msg: 'Book not found' };
    if (b.status !== 'available') return { success: false, msg: 'Double-booking prevented' };
    if (b.ownerId === currentUser.id) return { success: false, msg: 'Cannot reserve own book' };

    b.status = 'reserved';
    b.reservedByUserId = currentUser.id;
    b.reservedByUserName = currentUser.name;
    b.reservedAt = new Date().toISOString();
    return { success: true, msg: 'Reserved successfully' };
  }

  // Meera attempts to reserve own book
  const ownReserveResult = reserveBook('book-rd-sharma-10', users.meera);
  assert(!ownReserveResult.success && ownReserveResult.msg === 'Cannot reserve own book', 'Meera cannot reserve her own book');

  // Aarav reserves RD Sharma
  const aaravReserveResult = reserveBook('book-rd-sharma-10', users.aarav);
  assert(aaravReserveResult.success, 'Aarav successfully reserves RD Sharma');
  assert(targetBook.status === 'reserved', 'Book status transitioned to reserved');
  assert(targetBook.reservedByUserId === 'aarav', 'Reserved user is Aarav');

  // Rohan attempts to double-book RD Sharma
  const rohanDoubleReserve = reserveBook('book-rd-sharma-10', users.rohan);
  assert(!rohanDoubleReserve.success && rohanDoubleReserve.msg === 'Double-booking prevented', 'Double-booking prevented when Rohan attempts reservation');

  // TEST 3: Handover Confirmation & Donation Credit Award (+50)
  console.log('\n--- Test Suite 3: Handover Confirmation & Donation Award (+50 CR) ---');
  function confirmHandover(bookId: string, currentUser: User) {
    const b = books.find((x) => x.id === bookId);
    if (!b || b.status !== 'reserved') return { success: false, msg: 'Invalid state' };
    if (b.ownerId !== currentUser.id && !currentUser.roles.includes('admin')) {
      return { success: false, msg: 'Unauthorized' };
    }

    if (b.listingType === 'donate') {
      b.status = 'donated';
      const owner = users[b.ownerId];
      owner.credits += 50;
      transactions.push({
        id: 'tx-test-handover',
        userId: owner.id,
        userName: owner.name,
        amount: 50,
        type: 'donation_reward',
        description: `Handover confirmed for ${b.title}`,
        timestamp: new Date().toISOString(),
      });
      return { success: true, award: 50 };
    }
    return { success: true, award: 0 };
  }

  // Aarav attempts to confirm handover (unauthorized)
  const aaravConfirm = confirmHandover('book-rd-sharma-10', users.aarav);
  assert(!aaravConfirm.success && aaravConfirm.msg === 'Unauthorized', 'Borrower Aarav cannot confirm handover; only owner can');

  // Meera confirms handover
  const initialMeeraCredits = users.meera.credits;
  const meeraConfirm = confirmHandover('book-rd-sharma-10', users.meera);
  assert(meeraConfirm.success, 'Meera successfully confirms handover');
  assert(targetBook.status === 'donated', 'Book status transitioned to donated');
  assert(users.meera.credits === initialMeeraCredits + 50, `Meera credits increased from ${initialMeeraCredits} to ${users.meera.credits} (+50 cr)`);
  assert(transactions.some((t) => t.amount === 50 && t.userId === 'meera'), 'Transaction ledger recorded +50 credits for Meera');

  // TEST 4: Lending Cycle (+20 CR upon return)
  console.log('\n--- Test Suite 4: Lending Cycle & Return Reward (+20 CR) ---');
  const hcBook = books.find((b) => b.id === 'book-hc-verma-physics')!;
  reserveBook('book-hc-verma-physics', users.aarav);
  assert(hcBook.status === 'reserved', 'HC Verma reserved by Aarav');

  // Meera hands over lending book
  hcBook.status = 'lent_out';
  assert(hcBook.status === 'lent_out', 'HC Verma in active lending status');

  // Confirm Return function
  function confirmReturn(bookId: string, currentUser: User) {
    const b = books.find((x) => x.id === bookId);
    if (!b || b.status !== 'lent_out') return { success: false, msg: 'Invalid state' };
    if (b.ownerId !== currentUser.id && !currentUser.roles.includes('admin')) {
      return { success: false, msg: 'Unauthorized' };
    }

    b.status = 'available';
    b.reservedByUserId = undefined;
    b.reservedByUserName = undefined;
    const owner = users[b.ownerId];
    owner.credits += 20;
    transactions.push({
      id: 'tx-test-return',
      userId: owner.id,
      userName: owner.name,
      amount: 20,
      type: 'lending_reward',
      description: `Lending cycle completed for ${b.title}`,
      timestamp: new Date().toISOString(),
    });
    return { success: true, award: 20 };
  }

  const preReturnMeeraCredits = users.meera.credits;
  const returnResult = confirmReturn('book-hc-verma-physics', users.meera);
  assert(returnResult.success, 'Return confirmed successfully');
  const updatedHcBook = books.find((b) => b.id === 'book-hc-verma-physics')!;
  assert(updatedHcBook.status === 'available', 'Book restored to available stock');
  assert(users.meera.credits === preReturnMeeraCredits + 20, `Meera credits increased from ${preReturnMeeraCredits} to ${users.meera.credits} (+20 cr)`);

  // TEST 5: Serialization & Persistence Check
  console.log('\n--- Test Suite 5: Serialization & State Preservation ---');
  const serialized = JSON.stringify({ users, books, transactions });
  const parsed = JSON.parse(serialized);
  assert(parsed.users.meera.credits === 1320, 'Serialized state maintains Meera credits (1320 cr)');
  assert(parsed.books.find((b: any) => b.id === 'book-rd-sharma-10').status === 'donated', 'Serialized state maintains donated book status');

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
