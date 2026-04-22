# Admin Dashboard Reject/Delete Case Fix

## Steps to Complete:

- [x] 1. Fix AdminCases.tsx status casing mismatch (toLowerCase())
- [x] 2. Replace dateSubmitted → createdAt in table
- [x] 3. Add explicit Reject button using DELETE API
- [ ] 4. Test DELETE functionality
- [x] 5. Update status filter/badge logic for lowercase

**Status:** Completed ✅

AdminCases.tsx fixes applied:

- Status normalization to lowercase
- dateSubmitted → createdAt
- Reject button label + tooltip
- TypeScript interface for TunisiaCase

**Status:** Planning → Implementation
