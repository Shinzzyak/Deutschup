# Clerk Migration Plan — Deutschup

## Current Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Clerk      │────▶│  Supabase    │────▶│  PostgreSQL │
│  (Auth)      │     │  (DB API)    │     │  (Data)     │
└─────────────┘     └──────────────┘     └─────────────┘
```

**Clerk handles:** Login, signup, Google OAuth, session management
**Supabase handles:** All German learning data (profiles, progress, vocab, notes)

## Data to Migrate

### From Supabase `profiles` table → Clerk `publicMetadata`
| Column | Clerk Field | Type |
|--------|-------------|------|
| tier | tier | string |
| tier_expiry | tierExpiry | number |
| subscription | subscription | string |
| pro_expires_at | proExpiresAt | string |
| full_name | fullName | string |
| avatar_url | avatarUrl | string |
| role | role | string |

### From Supabase `user_curriculum_progress` → Clerk `publicMetadata`
| Column | Clerk Field | Type |
|--------|-------------|------|
| xp | xp | number |
| streak | streak | number |
| current_level_id | currentLevel | string |
| current_lesson_id | currentLesson | string |
| unlocked_lessons | unlockedLessons | string[] |

### From Supabase `user_lesson_progress` → Clerk `publicMetadata`
| Column | Clerk Field | Type |
|--------|-------------|------|
| lesson_id | completedLessons | string[] |
| score | lessonScores | Record<string, number> |

### From Supabase `user_checkpoint_progress` → Clerk `publicMetadata`
| Column | Clerk Field | Type |
|--------|-------------|------|
| checkpoint_id | checkpoints | Record<string, object> |

### From Supabase `mock_tests` → **Keep in Supabase**
Test results are historical data — keep in Supabase for analytics.

### From Supabase `notes` / `quick_notes` / `study_plans` → **Keep in Supabase**
Content data — keep in Supabase (too large for Clerk metadata).

## Migration Strategy: GRADUAL (Not Big Bang)

### Phase 1: Dual-Write (Week 1)
1. **Update authStore** to write to BOTH Clerk metadata AND Supabase
2. **Update progressStore** to write to BOTH Clerk metadata AND Supabase
3. **Read from Clerk first**, fallback to Supabase if missing
4. Deploy and monitor for 1 week

### Phase 2: Read Migration (Week 2)
1. **Update all reads** to use Clerk metadata
2. **Keep Supabase writes** as backup
3. Monitor for data consistency issues

### Phase 3: Write Migration (Week 3)
1. **Stop Supabase writes** for migrated data
2. **Keep Supabase reads** as fallback only
3. Monitor for 1 week

### Phase 4: Cleanup (Week 4)
1. Remove Supabase profile sync code
2. Remove Supabase auth bridge
3. Keep Supabase for content data (notes, tests, study_plans)

## Implementation Plan

### Step 1: Extend Clerk User Metadata Schema
```typescript
// Clerk publicMetadata types
interface ClerkUserMetadata {
  // Profile
  fullName?: string;
  avatarUrl?: string;
  role?: string;
  tier?: 'free' | 'pro';
  tierExpiry?: number;
  subscription?: 'free' | 'pro';
  proExpiresAt?: string;
  
  // Progress
  xp?: number;
  streak?: number;
  currentLevel?: string;
  currentLesson?: string;
  unlockedLessons?: string[];
  completedLessons?: string[];
  lessonScores?: Record<string, number>;
  
  // Checkpoints
  checkpoints?: Record<string, {
    passed: boolean;
    score: number;
    attempts: number;
    bestScore: number;
  }>;
}
```

### Step 2: Update authStore.ts
```typescript
// NEW: Write to Clerk metadata
import { useUser } from '@clerk/nextjs';

// In setUser:
const { user } = useUser();
if (user) {
  await user.update({
    publicMetadata: {
      ...existingMetadata,
      tier: tierData.tier,
      subscription: tierData.subscription,
      // ... other fields
    }
  });
}
```

### Step 3: Update progressStore.ts
```typescript
// NEW: Write to Clerk instead of Supabase
const updateClerkProgress = async (userId: string, data: Partial<ProgressData>) => {
  const user = useUser().user;
  if (user) {
    await user.update({
      publicMetadata: {
        ...user.publicMetadata,
        xp: data.xp,
        streak: data.streak,
        currentLevel: data.currentLevel,
        // ... etc
      }
    });
  }
};
```

### Step 4: Update useAuthSync.ts
```typescript
// Read from Clerk metadata instead of Supabase
const syncProgressFromClerk = (user: User) => {
  const metadata = user.publicMetadata as ClerkUserMetadata;
  return {
    xp: metadata.xp || 0,
    streak: metadata.streak || 0,
    currentLevel: metadata.currentLevel || 'A1',
    // ... etc
  };
};
```

## Rollback Plan

### If Clerk metadata fails:
1. **Revert code** to previous version (git revert)
2. **Supabase still has all data** (dual-write kept it fresh)
3. **No data loss** — both sources were updated

### If data inconsistency:
1. **Compare Clerk vs Supabase** for each user
2. **Sync Clerk → Supabase** if Clerk is source of truth
3. **Or Supabase → Clerk** if Supabase is source of truth

## User Impact

### Existing Users (with Supabase data):
- **Phase 1:** No visible change (reads from Clerk first, falls back to Supabase)
- **Phase 2:** Data loads from Clerk (must have been synced in Phase 1)
- **Phase 3:** New writes go to Clerk only
- **Phase 4:** Supabase data becomes read-only backup

### New Users:
- All data stored in Clerk from the start
- No Supabase profile creation needed

## Testing Checklist
- [ ] New user signup → data in Clerk
- [ ] Existing user login → data migrates from Supabase to Clerk
- [ ] Progress update → writes to Clerk + Supabase (Phase 1)
- [ ] Progress read → reads from Clerk first (Phase 2)
- [ ] Offline mode → works with cached data
- [ ] Logout/login → data persists
- [ ] Multiple devices → data syncs

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Clerk metadata size limit | Medium | High | Keep only essential data in Clerk |
| Migration script failure | Low | High | Gradual rollout, keep Supabase backup |
| Data inconsistency | Medium | Medium | Dual-write phase, validation scripts |
| User data loss | Low | Critical | Backup before migration, rollback plan |

## Clerk Metadata Limits
- **Max size:** 500KB per user
- **Our estimate:** ~2KB per user (well within limit)
- **Notes/tests/stays in Supabase:** Too large for Clerk metadata

## Next Steps
1. Create Clerk metadata TypeScript types
2. Update authStore with dual-write
3. Update progressStore with dual-write
4. Deploy Phase 1 and monitor
5. Proceed to Phase 2 after 1 week of stability
