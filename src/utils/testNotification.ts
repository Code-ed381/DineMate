/**
 * Notification Debugging Utility
 * 
 * Run this in your browser console to test the notification system:
 * 1. Make sure you're logged in
 * 2. Open DevTools Console
 * 3. Run: testNotificationSystem()
 */

import { supabase } from '../lib/supabase';
import { notificationService } from '../services/notificationService';

export async function testNotificationSystem() {
  console.log('🔍 Starting Notification System Diagnostics...\n');

  // Test 1: Check if user is authenticated
  console.log('1️⃣ Checking Authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ Not authenticated:', authError);
    return;
  }
  console.log('✅ User authenticated:', user.id);
  console.log('   Email:', user.email);

  // Test 2: Check realtime connection
  console.log('\n2️⃣ Testing Realtime Connection...');
  const testChannel = supabase
    .channel('test-connection')
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime connection working');
        supabase.removeChannel(testChannel);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime connection failed');
      } else {
        console.log('📡 Connection status:', status);
      }
    });

  // Wait a moment for connection test
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Check if notifications table has realtime enabled
  console.log('\n3️⃣ Checking Table Realtime Status...');
  console.log('⚠️  You need to manually verify in Supabase Dashboard:');
  console.log('   - Database → Replication');
  console.log('   - Check: user_notifications (MUST be enabled)');
  console.log('   - Check: notifications (MUST be enabled)');

  // Test 4: Fetch restaurant context
  console.log('\n4️⃣ Checking Restaurant Context...');
  const { data: memberships, error: memberError } = await supabase
    .from('restaurant_members')
    .select('*, restaurants(*)')
    .eq('user_id', user.id)
    .limit(1);

  if (memberError || !memberships?.length) {
    console.error('❌ No restaurant membership found:', memberError);
    return;
  }

  const restaurant = (memberships[0] as any).restaurants;
  console.log('✅ Restaurant found:', restaurant.name, '(ID:', restaurant.id, ')');

  // Test 5: Create a test notification
  console.log('\n5️⃣ Creating Test Notification...');
  const testResult = await notificationService.sendUserNotification(
    restaurant.id,
    user.id,
    {
      title: 'Test Notification',
      message: `This is a test notification sent at ${new Date().toLocaleTimeString()}`,
      userIds: [user.id],
      priority: 'high'
    }
  );

  if (!testResult.success) {
    console.error('❌ Failed to create notification:', testResult.error);
    return;
  }
  console.log('✅ Test notification created successfully');
  console.log('   Notification ID:', (testResult as any).notification?.id);

  // Test 6: Verify notification was inserted
  console.log('\n6️⃣ Verifying Database Insert...');
  const { data: userNotifs, error: fetchError } = await supabase
    .from('user_notifications')
    .select('*, notification:notifications(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error('❌ Error fetching notifications:', fetchError);
    return;
  }

  console.log('✅ Found notification in database:', userNotifs?.length || 0);
  if (userNotifs && userNotifs.length > 0) {
    console.log('   Latest notification:', {
      id: userNotifs[0].id,
      title: (userNotifs[0] as any).notification?.title,
      created: userNotifs[0].created_at,
    });
  }

  // Test 7: Test Realtime Subscription
  console.log('\n7️⃣ Testing Realtime Subscription...');
  console.log('Setting up listener for 10 seconds...');
  
  let receivedEvent = false;
  const notifChannel = supabase
    .channel(`test-notifications-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${user.id},restaurant_id=eq.${restaurant.id}`
      },
      (payload) => {
        receivedEvent = true;
        console.log('✅ REALTIME EVENT RECEIVED!', payload);
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to user_notifications');
        console.log('   Sending another test notification...');
        
        // Send another notification after subscription is active
        setTimeout(async () => {
          await notificationService.sendUserNotification(
            restaurant.id,
            user.id,
            {
              title: 'Realtime Test',
              message: 'Testing realtime delivery',
              userIds: [user.id],
              priority: 'normal'
            }
          );
          console.log('✅ Second test notification sent');
        }, 1000);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Failed to subscribe - Realtime may not be enabled on user_notifications table');
      }
    });

  // Wait for realtime event
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  if (!receivedEvent) {
    console.error('\n❌ NO REALTIME EVENT RECEIVED!');
    console.error('   This means realtime is NOT working. Possible causes:');
    console.error('   1. Realtime not enabled on user_notifications table');
    console.error('   2. RLS policies blocking realtime events');
    console.error('   3. Filter not matching (check user_id and restaurant_id)');
  } else {
    console.log('\n✅ REALTIME IS WORKING!');
  }

  // Cleanup
  supabase.removeChannel(notifChannel);

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('═══════════════════════════════════════════════');
  console.log('User ID:', user.id);
  console.log('Restaurant ID:', restaurant.id);
  console.log('Notifications Created:', testResult.success ? 'Yes' : 'No');
  console.log('Database Insert:', userNotifs && userNotifs.length > 0 ? 'Yes' : 'No');
  console.log('Realtime Events:', receivedEvent ? '✅ Working' : '❌ Not Working');
  console.log('═══════════════════════════════════════════════');
  
  if (!receivedEvent) {
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Go to Supabase Dashboard → Database → Replication');
    console.log('2. Verify "user_notifications" has Realtime ENABLED');
    console.log('3. Check RLS policies on user_notifications table');
    console.log('4. Refresh the app and run this test again');
  }
}

// Test RLS Policies
export async function testRLSPolicies() {
  console.log('🔍 Testing RLS Policies...\n');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ Not authenticated');
    return;
  }

  // Test 1: Can we SELECT from user_notifications?
  console.log('1️⃣ Testing SELECT permission on user_notifications...');
  const { data: selectTest, error: selectError } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', user.id)
    .limit(1);

  if (selectError) {
    console.error('❌ SELECT failed:', selectError.message);
    console.error('   RLS policy may be blocking reads');
  } else {
    console.log('✅ SELECT works -', selectTest?.length || 0, 'records');
  }

  // Test 2: Can we INSERT into user_notifications?
  console.log('\n2️⃣ Testing INSERT permission on user_notifications...');
  const { error: insertError } = await supabase
    .from('user_notifications')
    .insert({
      notification_id: '00000000-0000-0000-0000-000000000000', // Will fail but tests permission
      user_id: user.id,
      restaurant_id: '00000000-0000-0000-0000-000000000000'
    });

  if (insertError) {
    if (insertError.message.includes('foreign key')) {
      console.log('✅ INSERT permission exists (FK constraint error is expected)');
    } else {
      console.error('❌ INSERT failed:', insertError.message);
    }
  }

  console.log('\n✅ RLS Policy Test Complete');
}

// Make functions available globally in browser console
if (typeof window !== 'undefined') {
  (window as any).testNotificationSystem = testNotificationSystem;
  (window as any).testRLSPolicies = testRLSPolicies;
  console.log('🎯 Notification test utilities loaded!');
  console.log('   Run: testNotificationSystem()');
  console.log('   Run: testRLSPolicies()');
}
