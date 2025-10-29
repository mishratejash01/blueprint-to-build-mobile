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

    const { products } = await req.json();
    
    if (!products || !Array.isArray(products)) {
      throw new Error('Invalid request format. Expected { products: [...] }');
    }

    console.log(`Processing ${products.length} product(s)`);

    const results = [];

    for (const product of products) {
      try {
        // Validate required fields
        if (!product.name || !product.price || !product.unit || !product.store_id) {
          results.push({
            name: product.name || 'Unknown',
            status: 'error',
            message: 'Missing required fields: name, price, unit, store_id'
          });
          continue;
        }

        // Prepare product data
        const productData = {
          name: product.name.trim(),
          description: product.description?.trim() || null,
          price: parseFloat(product.price),
          unit: product.unit.trim(),
          stock_quantity: product.stock_quantity ? parseInt(product.stock_quantity) : 0,
          category_id: product.category_id || null,
          store_id: product.store_id,
          image_url: product.image_url?.trim() || null,
          is_available: product.is_available === 'FALSE' ? false : true,
          updated_at: new Date().toISOString()
        };

        // Check if product exists (by name and store_id)
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('name', productData.name)
          .eq('store_id', productData.store_id)
          .single();

        let result;
        if (existingProduct) {
          // Update existing product
          result = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)
            .select();

          if (result.error) throw result.error;

          results.push({
            name: product.name,
            status: 'updated',
            message: 'Product updated successfully',
            id: existingProduct.id
          });
          console.log(`Updated product: ${product.name}`);
        } else {
          // Insert new product
          result = await supabase
            .from('products')
            .insert(productData)
            .select();

          if (result.error) throw result.error;

          results.push({
            name: product.name,
            status: 'created',
            message: 'Product created successfully',
            id: result.data[0].id
          });
          console.log(`Created product: ${product.name}`);
        }
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error);
        results.push({
          name: product.name || 'Unknown',
          status: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        summary: {
          total: products.length,
          created: results.filter(r => r.status === 'created').length,
          updated: results.filter(r => r.status === 'updated').length,
          errors: results.filter(r => r.status === 'error').length
        }
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
