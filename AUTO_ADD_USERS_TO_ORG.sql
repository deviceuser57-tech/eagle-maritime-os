-- =====================================================
-- AUTO-ADD NEW USERS TO TEST ORGANIZATION
-- =====================================================
-- This trigger automatically adds new users to the test organization
-- when they sign up, so they can immediately see vessels
-- =====================================================

-- Create function to auto-add users to organization
CREATE OR REPLACE FUNCTION public.auto_add_user_to_test_org()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_test_org_id UUID := '38a8adcb-ebce-45d0-aab8-f2f2478d7bfa';
BEGIN
  -- Add the new user to the test organization
  INSERT INTO public.organization_members (org_id, user_id)
  VALUES (v_test_org_id, NEW.id)
  ON CONFLICT (org_id, user_id) DO NOTHING;
  
  RAISE NOTICE 'User % added to test organization', NEW.email;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
-- This runs whenever a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_add_to_org ON auth.users;

CREATE TRIGGER on_auth_user_created_add_to_org
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_user_to_test_org();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_add_to_org';

-- =====================================================
-- EXPECTED RESULT:
-- =====================================================
-- Trigger should be listed
-- Now when users sign up, they'll automatically be added to the org
-- and will immediately see the 3 test vessels!
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Auto-add trigger created successfully';
  RAISE NOTICE '📝 New users will automatically join test organization';
  RAISE NOTICE '🚢 Users will immediately see vessels after signup';
END $$;
