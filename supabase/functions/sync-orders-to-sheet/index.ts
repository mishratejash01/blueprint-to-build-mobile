import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwn0KMmiZ9eusYsH4Bm-N1Z_I_jyJ_XuOxJsDDfqKT_Bb4fAvN67CxmoufJWZpiyL6VtQ/exec";

serve(async (req) => {
  try {
    const { order_id } = await req.json();
    console.log('Syncing order to Google Sheets:', order_id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the full order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      throw itemsError;
    }

    // Fetch delivery partner info if assigned
    let partnerName = '';
    let partnerPhone = '';
    if (order.delivery_partner_id) {
      const { data: partner } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', order.delivery_partner_id)
        .single();
      
      if (partner) {
        partnerName = partner.full_name || '';
        partnerPhone = partner.phone || '';
      }
    }

    // Format data for Google Sheets
    const orderData = {
      order_id: order.id,
      created_at: order.created_at,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      delivery_address: order.delivery_address,
      payment_status: order.payment_status,
      customer_id: order.customer_id,
      store_id: order.store_id,
      delivery_partner_id: order.delivery_partner_id || '',
      delivery_partner_name: partnerName,
      delivery_partner_phone: partnerPhone,
      order_accepted: order.delivery_partner_id ? 'YES' : 'NO',
      items_count: items?.length || 0,
      items_summary: items?.map((item: any) => `${item.product_name} x${item.quantity}`).join(', ') || ''
    };

    console.log('Sending to Google Sheets:', orderData);

    // Send the data to Google Sheets
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const responseText = await response.text();
    console.log('Google Sheets response:', responseText);

    if (!response.ok) {
      throw new Error(`Google Sheets sync failed: ${responseText}`);
    }

    return new Response(
      JSON.stringify({ 
        message: "Order synced to Google Sheets", 
        order_id,
        status: order.status 
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in function: ' + errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
