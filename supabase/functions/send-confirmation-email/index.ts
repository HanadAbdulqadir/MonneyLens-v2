import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { ConfirmationEmail } from "./_templates/confirmation-email.tsx";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Email hook function called');
  
  // Handle CORS preflight requests
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
    
    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    console.log('Environment check:', {
      hasResendKey: !!resendApiKey,
      hasHookSecret: !!hookSecret,
      hasSupabaseUrl: !!supabaseUrl
    });

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    const payload = await req.text();
    console.log('Received payload length:', payload.length);
    
    let emailData;
    
    if (hookSecret) {
      console.log('Verifying webhook signature...');
      const headers = Object.fromEntries(req.headers);
      const wh = new Webhook(hookSecret);
      
      try {
        emailData = wh.verify(payload, headers) as {
          user: {
            email: string;
            user_metadata?: {
              display_name?: string;
            };
          };
          email_data: {
            token: string;
            token_hash: string;
            redirect_to: string;
            email_action_type: string;
            site_url: string;
          };
        };
        console.log('Webhook verification successful');
      } catch (verifyError) {
        console.error('Webhook verification failed:', verifyError);
        throw new Error(`Webhook verification failed: ${verifyError.message}`);
      }
    } else {
      console.log('No hook secret, parsing payload directly');
      emailData = JSON.parse(payload);
    }

    console.log('Email data:', {
      email: emailData.user.email,
      hasEmailData: !!emailData.email_data,
      actionType: emailData.email_data?.email_action_type
    });

    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type },
    } = emailData;

    const displayName = user.user_metadata?.display_name || 'Valued User';
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
    
    console.log('Generating confirmation URL:', confirmationUrl);

    // Render the email template
    console.log('Rendering email template...');
    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        displayName,
        confirmationUrl,
        supportEmail: "support@moneylens.app"
      })
    );
    console.log('Email template rendered successfully');

    // Send the email
    console.log('Sending email to:', user.email);
    const { data, error } = await resend.emails.send({
      from: 'MoneyLens <noreply@resend.dev>',
      to: [user.email],
      subject: 'Welcome to MoneyLens - Confirm Your Account',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`);
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true, data }), {
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