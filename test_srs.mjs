
import { calculateNextReview, DEFAULT_SRS_STATS } from './src/srs_engine.js';
import assert from 'assert';

console.log('🧠 Starting SRS Engine Tests (SM-2)...');

// Test 1: First successful review (Grade 4)
// Should result in Interval 1, Repetition 1
console.log('Test 1: First Review (Grade 4)');
const result1 = calculateNextReview(DEFAULT_SRS_STATS, 4);
assert.strictEqual(result1.interval, 1, 'First interval should be 1 day');
assert.strictEqual(result1.repetition, 1, 'Repetition count should increase');
assert.ok(result1.easeFactor >= 1.3, 'Ease factor should be valid');
console.log('✅ Passed.');

// Test 2: Second successful review (Grade 4)
// Should result in Interval 6
console.log('Test 2: Second Review (Grade 4)');
const stats2 = { interval: 1, repetition: 1, easeFactor: 2.5 };
const result2 = calculateNextReview(stats2, 4);
assert.strictEqual(result2.interval, 6, 'Second interval should be 6 days');
assert.strictEqual(result2.repetition, 2, 'Repetition count should be 2');
console.log('✅ Passed.');

// Test 3: Third successful review (Grade 4)
// Should result in Interval ~ 6 * 2.5 = 15
console.log('Test 3: Third Review (Grade 4)');
const stats3 = { interval: 6, repetition: 2, easeFactor: 2.5 };
const result3 = calculateNextReview(stats3, 4);
assert.strictEqual(result3.interval, 15, 'Third interval should be 15 days');
console.log('✅ Passed.');

// Test 4: Failure (Grade 2)
// Should reset interval to 1, repetition to 0
console.log('Test 4: Failure (Grade 2)');
const statsFail = { interval: 15, repetition: 3, easeFactor: 2.5 };
const resultFail = calculateNextReview(statsFail, 2);
assert.strictEqual(resultFail.interval, 1, 'Interval should reset to 1 on failure');
assert.strictEqual(resultFail.repetition, 0, 'Repetition should reset to 0');
// Ease factor should decrease: 2.5 + (0.1 - (3)*... ) -> roughly lower
assert.ok(resultFail.easeFactor < 2.5, 'Ease factor should decrease on failure');
console.log('✅ Passed.');

// Test 5: Due Date Calculation
console.log('Test 5: Due Date');
const now = Date.now();
const resultDate = calculateNextReview(DEFAULT_SRS_STATS, 4); // Interval 1
// Due date should be roughly Now + 24 hours
const diff = resultDate.dueDate - now;
const ONE_DAY = 24 * 60 * 60 * 1000;
assert.ok(Math.abs(diff - ONE_DAY) < 1000, 'Due date should be 24 hours from now');
console.log('✅ Passed.');

console.log('🎉 All SRS Tests Passed!');
