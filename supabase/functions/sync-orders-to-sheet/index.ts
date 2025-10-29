import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { order_id, google_sheets_webhook_url } = await req.json();

    if (!order_id) {
      throw new Error('order_id is required');
    }

    if (!google_sheets_webhook_url) {
      throw new Error('google_sheets_webhook_url is required');
    }

    console.log(`Syncing order ${order_id} to Google Sheets`);

    // Fetch complete order details with related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total,
        subtotal,
        delivery_fee,
        delivery_address,
        payment_status,
        customer_id,
        store_id,
        delivery_partner_id,
        delivery_latitude,
        delivery_longitude
      `)
      .eq('id', order_id)
      .single();

    if (orderError) throw orderError;

    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_name, quantity, price')
      .eq('order_id', order_id);

    if (itemsError) throw itemsError;

    // Fetch delivery partner details if assigned
    let deliveryPartnerInfo = null;
    if (order.delivery_partner_id) {
      const { data: partner } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .eq('id', order.delivery_partner_id)
        .single();
      
      deliveryPartnerInfo = partner;
    }

    // Format order data for Google Sheets
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
      delivery_partner_id: order.delivery_partner_id || 'Not Assigned',
      delivery_partner_name: deliveryPartnerInfo?.full_name || 'Not Assigned',
      delivery_partner_phone: deliveryPartnerInfo?.phone || '',
      order_accepted: order.delivery_partner_id ? 'YES' : 'NO',
      items_count: orderItems?.length || 0,
      items_summary: orderItems?.map(item => `${item.product_name} (${item.quantity})`).join(', ') || ''
    };

    console.log('Sending order data to Google Sheets:', orderData);

    // Send to Google Sheets webhook
    const response = await fetch(google_sheets_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets webhook failed: ${response.statusText}`);
    }

    console.log('Order synced successfully to Google Sheets');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order synced to Google Sheets',
        order_id: order_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
