# Quickstart: Testing User Profile & Daily Goal Settings

## 1. Database Migration & Client Generation

```bash
cd apps/api
npx prisma generate
```

## 2. Running Backend Tests

```bash
# Run unit tests for users module
npm run test -- apps/api/src/modules/users
```

## 3. Running Frontend Tests

```bash
# Run web tests
cd apps/web
npm run test
```

## 4. Manual Verification Workflow

1. Log into WordStreak.
2. Click the user avatar in the top right navigation bar.
3. Click "Settings".
4. Select "20 Cards" daily goal and click "Save Changes".
5. Verify the "Daily Goal" stat on the dashboard updates to "20 Cards".
6. Switch to "Avatar" tab, select a new preset, click "Save Avatar", and observe immediate top bar avatar update.
7. Switch to "Security" tab, change password, and verify success message.
