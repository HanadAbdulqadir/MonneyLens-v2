import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Test email function called');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing test request...');
    
    const payload = await req.text();
    console.log('Payload received, length:', payload.length);
    
    // Just return success without sending actual email
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test function working',
      payloadLength: payload.length 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in test function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});