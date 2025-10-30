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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, store_id, delivery_partner_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    if (!order.delivery_partner_id) {
      throw new Error('No delivery partner assigned to this order');
    }

    // Check if OTP already exists and is still valid
    const { data: existingOtp } = await supabaseClient
      .from('store_pickup_otps')
      .select('*')
      .eq('order_id', orderId)
      .gte('expires_at', new Date().toISOString())
      .eq('is_verified', false)
      .single();

    if (existingOtp) {
      return new Response(
        JSON.stringify({
          success: true,
          otp: existingOtp.otp_code,
          expiresAt: existingOtp.expires_at,
          message: 'Existing OTP is still valid'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiry to 30 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Insert OTP
    const { data: otpData, error: otpError } = await supabaseClient
      .from('store_pickup_otps')
      .insert({
        order_id: orderId,
        store_id: order.store_id,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (otpError) {
      throw new Error(`Failed to generate OTP: ${otpError.message}`);
    }

    console.log(`OTP generated for order ${orderId}: ${otpCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        otp: otpCode,
        expiresAt: expiresAt.toISOString(),
        message: 'OTP generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});