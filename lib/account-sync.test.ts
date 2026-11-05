import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAuthInput,
  validateProfileUpdate,
  buildLocalToCloudMigration,
} from './account-sync';

test('validateAuthInput validates email, password length, and username format', () => {
  const invalidEmail = validateAuthInput({
    mode: 'login',
    email: 'invalid-email',
    password: 'password123',
  });
  assert.equal(invalidEmail.valid, false);

  const shortPassword = validateAuthInput({
    mode: 'signup',
    email: 'user@example.com',
    password: '123',
    username: 'falylio_user',
  });
  assert.equal(shortPassword.valid, false);

  const invalidUsername = validateAuthInput({
    mode: 'signup',
    email: 'user@example.com',
    password: 'password123',
    username: 'bad username!',
  });
  assert.equal(invalidUsername.valid, false);

  const validSignup = validateAuthInput({
    mode: 'signup',
    email: '  User@Example.com ',
    password: 'password123',
    fullName: '  Amina Rahman ',
    username: 'Amina_99',
  });
  assert.equal(validSignup.valid, true);
  assert.equal(validSignup.sanitizedEmail, 'user@example.com');
  assert.equal(validSignup.sanitizedFullName, 'Amina Rahman');
  assert.equal(validSignup.sanitizedUsername, 'amina_99');
});

test('validateProfileUpdate enforces name length and username rules', () => {
  const badName = validateProfileUpdate({
    fullName: 'A',
    username: 'valid_user',
    avatarUrl: '',
  });
  assert.equal(badName.valid, false);

  const goodProfile = validateProfileUpdate({
    fullName: 'Tariq Al-Mansoor',
    username: 'tariq_dev',
    avatarUrl: '',
  });
  assert.equal(goodProfile.valid, true);
  assert.equal(goodProfile.payload.avatar_url, '/assets/fy/user-avatar.png');
});

test('buildLocalToCloudMigration deduplicates local and cloud records without overwriting cloud data', () => {
  const result = buildLocalToCloudMigration({
    userId: 'uuid-user-123',
    localFavoriteIds: ['tool-text-counter', 'tool-dev-json', 'tool-text-counter'],
    localRecentIds: ['tool-office-invoice', 'tool-color-contrast'],
    existingCloudFavoriteIds: ['tool-text-counter', 'tool-security-pass'],
    existingCloudRecentIds: ['tool-office-invoice'],
  });

  // Only 'tool-dev-json' is missing from cloud favorites
  assert.equal(result.favoritesToInsert.length, 1);
  assert.equal(result.favoritesToInsert[0].item_id, 'tool-dev-json');
  assert.equal(result.favoritesToInsert[0].user_id, 'uuid-user-123');

  // Only 'tool-color-contrast' is missing from cloud recents
  assert.equal(result.recentsToInsert.length, 1);
  assert.equal(result.recentsToInsert[0].item_id, 'tool-color-contrast');

  // Merged list preserves existing cloud items plus migrated local items
  assert.deepEqual(result.mergedFavoriteIds, [
    'tool-text-counter',
    'tool-security-pass',
    'tool-dev-json',
  ]);
  assert.deepEqual(result.mergedRecentIds, [
    'tool-office-invoice',
    'tool-color-contrast',
  ]);
});
