# 🔐 LOGIN AND ACCESS GUIDE

## ✅ **CURRENT SETUP**

The application is correctly configured with:
- ✅ RLS (Row Level Security) enabled on all tables
- ✅ Organization-based access control
- ✅ Proper authentication required
- ✅ Test data exists in database

---

## 🎯 **HOW TO ACCESS VESSELS**

### **Option 1: Login and Join Organization (Recommended)**

**Step 1: Create Account / Login**
1. Go to http://localhost:8081
2. Click "LAUNCH SYSTEM"
3. You'll be redirected to login/signup
4. Create an account or login with existing credentials

**Step 2: Add Yourself to Test Organization**
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql
2. Run this SQL:
```sql
-- Get your user ID
SELECT auth.uid() as your_user_id;

-- Add yourself to the test organization
INSERT INTO public.organization_members (org_id, user_id)
VALUES (
  '38a8adcb-ebce-45d0-aab8-f2f2478d7bfa',
  auth.uid()
)
ON CONFLICT (org_id, user_id) DO NOTHING;
```

**Step 3: Refresh and View Vessels**
1. Refresh your browser (Ctrl+Shift+R)
2. Go to "⚓ Vessels" page
3. You should now see 3 test vessels!

---

### **Option 2: Use Existing Test Data Script**

Run the complete script: `ADD_USER_TO_ORG.sql`

This will:
- Show your current user ID
- Add you to the test organization
- Verify membership
- Show available vessels

---

### **Option 3: Create Your Own Vessels**

If you prefer to create fresh data:

1. Login to the app
2. Go to "⚓ Vessels" page
3. Click "Register Vessel"
4. Fill in vessel details
5. Your vessels will be automatically linked to your user account

---

## 🔒 **WHY RLS IS IMPORTANT**

RLS (Row Level Security) ensures:
- ✅ Users only see their organization's data
- ✅ Multi-tenant security
- ✅ Data isolation between organizations
- ✅ Production-ready security

**This is the correct setup for a production application!**

---

## 📊 **WHAT YOU'LL SEE AFTER LOGIN**

### **Vessels Page:**
```
ASSET REGISTRY
Tactical Assets: 3
Operational: 3
Refitting: 0

FLEET INTELLIGENCE TABLE:
┌─────────────────────┬────────────┬──────────────┬────────┐
│ Vessel Name         │ IMO        │ Type         │ Certs  │
├─────────────────────┼────────────┼──────────────┼────────┤
│ MV COMPLIANCE ALPHA │ IMO9999001 │ Bulk Carrier │ 3      │
│ MV COMPLIANCE BETA  │ IMO9999002 │ Container    │ 3      │
│ MV COMPLIANCE GAMMA │ IMO9999003 │ Tanker       │ 3      │
└─────────────────────┴────────────┴──────────────┴────────┘
```

### **Dashboard:**
```
Fleet Compliance Index: 87.5%
Total Vessels: 3
Assets at Risk: 0
Certificates Expiring: 0
```

---

## 🚨 **TROUBLESHOOTING**

### **Issue: "Zero assets detected in current sector"**

**Cause:** You're not a member of the test organization

**Solution:** Run `ADD_USER_TO_ORG.sql` to add yourself

---

### **Issue: Can't login / No auth page**

**Cause:** Auth might be disabled

**Solution:** Check Supabase Auth settings are enabled

---

### **Issue: SQL says "auth.uid() is null"**

**Cause:** You're not logged in when running the SQL

**Solution:** 
1. Login to your app first
2. Then run the SQL in Supabase
3. The SQL uses your current session

---

## ✅ **VERIFICATION CHECKLIST**

After following the steps:

- [ ] Created account / Logged in
- [ ] Ran `ADD_USER_TO_ORG.sql`
- [ ] Saw confirmation of membership
- [ ] Refreshed frontend
- [ ] Can see 3 vessels on Vessels page
- [ ] Dashboard shows Fleet Index 87.5%
- [ ] Can click on vessels to see details

---

## 🎯 **QUICK START (2 MINUTES)**

```bash
# 1. Start dev server (if not running)
npm run dev

# 2. Open browser
http://localhost:8081

# 3. Click "LAUNCH SYSTEM"

# 4. Create account / Login

# 5. Open Supabase SQL Editor
# https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql

# 6. Run this SQL:
INSERT INTO public.organization_members (org_id, user_id)
VALUES ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', auth.uid())
ON CONFLICT DO NOTHING;

# 7. Refresh browser

# 8. Go to Vessels page - See 3 vessels! ✅
```

---

## 📝 **SUMMARY**

**The app is working correctly!**

- ✅ RLS is properly configured
- ✅ Authentication is required
- ✅ Test data exists in database
- ✅ You just need to login and join the organization

**This is the secure, production-ready setup!**

---

**Next Step:** Run `ADD_USER_TO_ORG.sql` after logging in! 🚀
