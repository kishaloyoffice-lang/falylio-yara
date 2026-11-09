export interface UserProfileRecord {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFavoriteRecord {
  id?: string;
  user_id: string;
  item_id: string;
  item_type: string;
  created_at?: string;
}

export interface RecentlyViewedRecord {
  id?: string;
  user_id: string;
  item_id: string;
  item_type: string;
  viewed_at?: string;
}

export interface SavedItemRecord {
  id?: string;
  user_id: string;
  item_id: string;
  item_type: string;
  title: string;
  created_at?: string;
}

export interface AuthValidationResult {
  valid: boolean;
  error?: string;
  sanitizedEmail: string;
  sanitizedFullName: string;
  sanitizedUsername: string;
  sanitizedOtpCode: string;
}

/**
 * Validates authentication form inputs before sending requests to Supabase Auth.
 */
export function validateAuthInput(input: {
  mode: 'login' | 'signup' | 'verify' | 'forgot' | 'reset';
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  username?: string;
  otpCode?: string;
}): AuthValidationResult {
  const sanitizedEmail = (input.email || '').trim().toLowerCase();
  const sanitizedFullName = (input.fullName || '').trim();
  const sanitizedUsername = (input.username || '').trim().toLowerCase();
  const sanitizedOtpCode = (input.otpCode || '').replace(/\s+/g, '').trim();

  if (input.mode !== 'reset') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return {
        valid: false,
        error: 'Please enter a valid email address.',
        sanitizedEmail,
        sanitizedFullName,
        sanitizedUsername,
        sanitizedOtpCode,
      };
    }
  }

  if (input.mode === 'verify') {
    if (!/^[0-9A-Za-z]{6,8}$/.test(sanitizedOtpCode)) {
      return {
        valid: false,
        error: 'Please enter a valid 6 to 8 digit verification code.',
        sanitizedEmail,
        sanitizedFullName,
        sanitizedUsername,
        sanitizedOtpCode,
      };
    }
  }

  if (input.mode === 'login' || input.mode === 'signup' || input.mode === 'reset') {
    const pass = input.password || '';
    if (pass.length < 6) {
      return {
        valid: false,
        error: 'Password must be at least 6 characters long.',
        sanitizedEmail,
        sanitizedFullName,
        sanitizedUsername,
        sanitizedOtpCode,
      };
    }
  }

  if (input.mode === 'reset' && input.confirmPassword !== undefined) {
    if (input.password !== input.confirmPassword) {
      return {
        valid: false,
        error: 'New password and confirmation password do not match.',
        sanitizedEmail,
        sanitizedFullName,
        sanitizedUsername,
        sanitizedOtpCode,
      };
    }
  }

  if (input.mode === 'signup') {
    if (sanitizedUsername && !/^[a-z0-9_]{3,32}$/.test(sanitizedUsername)) {
      return {
        valid: false,
        error: 'Username must be 3–32 characters using lowercase letters, numbers, or underscores.',
        sanitizedEmail,
        sanitizedFullName,
        sanitizedUsername,
        sanitizedOtpCode,
      };
    }
  }

  return {
    valid: true,
    sanitizedEmail,
    sanitizedFullName,
    sanitizedUsername,
    sanitizedOtpCode,
  };
}

/**
 * Validates user profile edits before saving to public.profiles.
 */
export function validateProfileUpdate(input: {
  fullName: string;
  username: string;
  avatarUrl: string;
}): {
  valid: boolean;
  error?: string;
  payload: { full_name: string; username: string | null; avatar_url: string };
} {
  const fullName = input.fullName.trim();
  const username = input.username.trim().toLowerCase();
  const avatarUrl = input.avatarUrl.trim() || '/assets/fy/user-avatar.png';

  if (fullName.length < 2 || fullName.length > 80) {
    return {
      valid: false,
      error: 'Full name must be between 2 and 80 characters.',
      payload: { full_name: fullName, username: username || null, avatar_url: avatarUrl },
    };
  }

  if (username && !/^[a-z0-9_]{3,32}$/.test(username)) {
    return {
      valid: false,
      error: 'Username must be 3–32 characters (letters, numbers, or underscores only).',
      payload: { full_name: fullName, username: username || null, avatar_url: avatarUrl },
    };
  }

  return {
    valid: true,
    payload: {
      full_name: fullName,
      username: username || null,
      avatar_url: avatarUrl,
    },
  };
}

/**
 * Computes the deduplicated migration payload to sync LocalStorage favorites and
 * recently viewed items to the authenticated user's Supabase account without
 * creating duplicate rows or overwriting existing cloud records.
 */
export function buildLocalToCloudMigration(params: {
  userId: string;
  localFavoriteIds: string[];
  localRecentIds: string[];
  existingCloudFavoriteIds: string[];
  existingCloudRecentIds: string[];
  itemType?: string;
}): {
  favoritesToInsert: UserFavoriteRecord[];
  recentsToInsert: RecentlyViewedRecord[];
  mergedFavoriteIds: string[];
  mergedRecentIds: string[];
} {
  const itemType = params.itemType || 'tool';
  const cleanUserId = params.userId.trim();

  const uniqueLocalFavs = Array.from(
    new Set(params.localFavoriteIds.map((id) => id.trim()).filter(Boolean))
  );
  const uniqueLocalRecents = Array.from(
    new Set(params.localRecentIds.map((id) => id.trim()).filter(Boolean))
  );

  const cloudFavSet = new Set(params.existingCloudFavoriteIds.map((id) => id.trim()).filter(Boolean));
  const cloudRecentSet = new Set(params.existingCloudRecentIds.map((id) => id.trim()).filter(Boolean));

  const favoritesToInsert: UserFavoriteRecord[] = uniqueLocalFavs
    .filter((itemId) => !cloudFavSet.has(itemId))
    .map((itemId) => ({
      user_id: cleanUserId,
      item_id: itemId,
      item_type: itemType,
    }));

  const recentsToInsert: RecentlyViewedRecord[] = uniqueLocalRecents
    .filter((itemId) => !cloudRecentSet.has(itemId))
    .map((itemId) => ({
      user_id: cleanUserId,
      item_id: itemId,
      item_type: itemType,
    }));

  // Preserve cloud order first, then append any newly migrated local items
  const mergedFavoriteIds = Array.from(
    new Set([...params.existingCloudFavoriteIds, ...uniqueLocalFavs])
  );
  const mergedRecentIds = Array.from(
    new Set([...params.existingCloudRecentIds, ...uniqueLocalRecents])
  ).slice(0, 12);

  return {
    favoritesToInsert,
    recentsToInsert,
    mergedFavoriteIds,
    mergedRecentIds,
  };
}
