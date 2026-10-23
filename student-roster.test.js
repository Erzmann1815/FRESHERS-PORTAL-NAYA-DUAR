import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudentMatcher, normalizeStudentEmail, normalizeStudentName, normalizeStudentNumber } from './student-roster.js';

test('normalizes case, accents, spaces, and punctuation without changing identifiers', () => {
  assert.equal(normalizeStudentName('  José  D\'Souza '), 'josedsouza');
  assert.equal(normalizeStudentNumber(' 24 / ECE - 007 '), '24ECE007');
  assert.equal(normalizeStudentNumber('REG-00/123'), 'REG00123');
  assert.equal(normalizeStudentEmail('  STUDENT.Name@IIITKALYANI.AC.IN  '), 'student.name@iiitkalyani.ac.in');
});

test('matches only when name, roll, and registration number belong to the same roster row', () => {
  const matcher = createStudentMatcher([
    { name: 'Asha Sen', roll: '24/ECE/007', registrationNo: 'REG-00123', email: 'asha@example.edu' },
    { name: 'Dev Roy', roll: '24/CSE/008', registrationNo: 'REG-00456', email: 'dev@example.edu' }
  ]);

  assert.equal(matcher.matches({ name: ' ASHA   SEN ', roll: '24 ECE 007', registrationNo: 'reg 00123', email: 'ASHA@EXAMPLE.EDU' }), true);
  assert.equal(matcher.matches({ name: 'Asha Sen', roll: '24/CSE/008', registrationNo: 'REG-00123', email: 'asha@example.edu' }), false);
  assert.equal(matcher.matches({ name: 'Asha Sen', roll: '24/ECE/007', registrationNo: 'REG-00456', email: 'asha@example.edu' }), false);
  assert.equal(matcher.matches({ name: 'Asha Sen', roll: '24/ECE/007', registrationNo: 'REG-00123', email: 'wrong@example.edu' }), false);
  assert.equal(matcher.matches({ name: '', roll: '24/ECE/007', registrationNo: 'REG-00123', email: 'asha@example.edu' }), false);
});

test('rejects duplicate normalized identities instead of choosing an ambiguous row', () => {
  assert.throws(() => createStudentMatcher([
    { name: 'Asha Sen', roll: '24/ECE/007', registrationNo: 'REG-00123', email: 'asha@example.edu' },
    { name: 'ASHA-SEN', roll: '24 ECE 007', registrationNo: 'REG00123', email: 'ASHA@EXAMPLE.EDU' }
  ]), /duplicate identity rows/);
});