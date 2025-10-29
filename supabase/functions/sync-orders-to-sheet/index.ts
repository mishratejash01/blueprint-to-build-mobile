import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ⬇️ THIS IS YOUR URL ⬇️
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwn0KMmiZ9eusYsH4Bm-N1Z_I_jyJ_XuOxJsDDfqKT_Bb4fAvN67CxmoufJWZpiyL6VtQ/exec";

serve(async (req) => {
  try {
    // 1. Get the order data from the request
    // This assumes Supabase is sending the data in the request body
    const orderData = await req.json(); 

    // You can log it to check (optional)
    console.log('Received order, sending to Google Sheets: ', orderData.order_id);

    // 2. Send the data to your Google Sheet URL
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData) // Send the order data
    });

    const responseText = await response.text();
    
    // This log will show you the response from your Apps Script
    console.log('Google Sheets Sync Response: ' + responseText);

    // 3. Return a success message to whatever called the function
    return new Response(
      JSON.stringify({ message: "Order synced to Google Sheets" }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
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
