import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { orderId, otpCode } = await req.json();

    if (!orderId || !otpCode) {
      throw new Error('Order ID and OTP code are required');
    }

    // Use service role for verification
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the OTP record
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('store_pickup_otps')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (otpError || !otpRecord) {
      throw new Error('OTP not found');
    }

    // Check if already verified
    if (otpRecord.is_verified) {
      throw new Error('OTP has already been used');
    }

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      throw new Error('OTP has expired');
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      throw new Error('Maximum verification attempts exceeded');
    }

    // Verify OTP
    if (otpRecord.otp_code !== otpCode) {
      // Increment attempts
      await supabaseAdmin
        .from('store_pickup_otps')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      throw new Error(`Incorrect OTP. ${remainingAttempts} attempts remaining.`);
    }

    // OTP is correct - mark as verified and update order
    const now = new Date().toISOString();

    await supabaseAdmin
      .from('store_pickup_otps')
      .update({
        is_verified: true,
        verified_at: now,
        verified_by: user.id,
      })
      .eq('id', otpRecord.id);

    await supabaseAdmin
      .from('orders')
      .update({
        status: 'in_transit',
        pickup_verified: true,
        pickup_verified_at: now,
      })
      .eq('id', orderId);

    console.log(`OTP verified for order ${orderId} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pickup verified successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});