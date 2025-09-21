import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { ConfirmationEmail } from "./_templates/confirmation-email.tsx";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // If no hook secret is set, skip webhook verification for development
    let emailData;
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      const verified = wh.verify(payload, headers) as {
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
      emailData = verified;
    } else {
      // For development without webhook secret
      emailData = JSON.parse(payload);
    }

    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type },
    } = emailData;

    const displayName = user.user_metadata?.display_name || 'Valued User';
    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    // Render the email template
    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        displayName,
        confirmationUrl,
        supportEmail: "support@moneylens.app"
      })
    );

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'MoneyLens <noreply@resend.dev>',
      to: [user.email],
      subject: 'Welcome to MoneyLens - Confirm Your Account',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message || 'Failed to send email');
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