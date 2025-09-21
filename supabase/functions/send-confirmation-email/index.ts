import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Email hook function called');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('Processing email request...');
    
    const payload = await req.text();
    console.log('Received payload length:', payload.length);
    
    // Parse the email data
    let emailData;
    try {
      emailData = JSON.parse(payload);
      console.log('Email data parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse payload:', parseError);
      throw new Error('Invalid JSON payload');
    }

    console.log('Email data:', {
      hasUser: !!emailData.user,
      hasEmailData: !!emailData.email_data,
      email: emailData.user?.email
    });

    // For now, just return success without sending actual email
    // This will help us confirm the hook is working
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email hook processed successfully',
      email: emailData.user?.email 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-confirmation-email function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack 
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