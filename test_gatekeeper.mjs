
import Gatekeeper from './src/gatekeeper.js';
import assert from 'assert';

console.log('🧪 Starting Gatekeeper Logic Tests...');

// 1. Test Exact Match
console.log('Test 1: Exact Match (Case Insensitive)');
const gk1 = new Gatekeeper({ answer: "Mitochondria", type: "INPUT" });
const result1 = gk1.checkAnswer("  mitochondria  ");
assert.ok(result1.success, "Should accept exact match with whitespace");
assert.strictEqual(gk1.consecutiveSuccesses, 1, "Streak should increment");
console.log('✅ Exact match verified.');

// 2. Test Fuzzy Match
console.log('Test 2: Fuzzy Match (Levenshtein)');
const gk2 = new Gatekeeper({ answer: "Mitochondria", type: "INPUT" });
// "Mitochondria" length 12 -> Threshold is 2
const typoAnswer = "Mitocondria"; // Missing 'h' (dist 1)
const result2 = gk2.checkAnswer(typoAnswer);
assert.ok(result2.success, "Should accept 1 typo for long words");
assert.ok(result2.message.includes("Close enough"), "Should give specific feedback");
console.log('✅ Fuzzy match verified.');

// 3. Test Failure
console.log('Test 3: Failure & Streak Reset');
const gk3 = new Gatekeeper({ answer: "Nucleus", type: "DYNAMIC", history: { successes: 5 } });
const result3 = gk3.checkAnswer("Ribosome");
assert.strictEqual(result3.success, false, "Wrong answer should fail");
assert.strictEqual(gk3.consecutiveSuccesses, 0, "Streak should reset to 0 in Dynamic mode");
console.log('✅ Failure logic verified.');

// 4. Test Dynamic Scaling (Choice Generation)
console.log('Test 4: Dynamic Scaling Generation');
// Threshold is default 3.
const gk4 = new Gatekeeper({ answer: "Target", type: "DYNAMIC", history: { successes: 0 } });
const mockItems = [
    { concept: "A" }, { concept: "B" }, { concept: "C" }, { concept: "D" }
];

// Low streak -> Should be CHOICE
const quizLow = gk4.generateQuiz(mockItems);
assert.strictEqual(quizLow.mode, 'CHOICE', "Low streak should yield CHOICE mode");
assert.strictEqual(quizLow.choices.length, 4, "Should have 4 choices (3 distractors + 1 correct)");
assert.ok(quizLow.choices.includes("Target"), "Choices must include target");

// High streak -> Should be INPUT
gk4.consecutiveSuccesses = 3;
const quizHigh = gk4.generateQuiz(mockItems);
assert.strictEqual(quizHigh.mode, 'INPUT', "High streak should yield INPUT mode");
console.log('✅ Dynamic scaling verified.');

console.log('🎉 All Gatekeeper Tests Passed!');
