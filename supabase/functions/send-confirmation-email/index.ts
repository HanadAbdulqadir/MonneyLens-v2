import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

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

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    console.log('Environment check:', {
      hasResendKey: !!resendApiKey,
      resendKeyLength: resendApiKey?.length || 0,
      hasSupabaseUrl: !!supabaseUrl
    });

    const resend = new Resend(resendApiKey);
    
    // Extract data from the webhook payload
    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type },
    } = emailData;

    const displayName = user.user_metadata?.display_name || 'Valued User';
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
    
    console.log('Sending email to:', user.email);
    console.log('Using from address: MoneyLens <noreply@resend.dev>');

    // Test with a simple email first
    console.log('Attempting to send email...');
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Use the default resend domain
      to: [user.email],
      subject: 'Welcome to MoneyLens - Confirm Your Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Welcome to MoneyLens - Confirm Your Account</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center; }
            .logo { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; }
            .tagline { color: #ffffff; font-size: 14px; margin: 8px 0 0 0; opacity: 0.9; }
            .content { padding: 32px 24px; }
            .title { color: #1e293b; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center; }
            .text { color: #475569; font-size: 16px; line-height: 24px; margin: 16px 0; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { background-color: #3b82f6; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 28px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); }
            .footer { text-align: center; padding: 24px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">MoneyLens</h1>
              <p class="tagline">Your Personal Finance Companion</p>
            </div>
            
            <div class="content">
              <h2 class="title">Welcome to MoneyLens, ${displayName}!</h2>
              
              <p class="text">
                Thank you for joining MoneyLens, the smart way to manage your personal finances. 
                You're just one click away from taking control of your financial future.
              </p>

              <p class="text">
                To complete your account setup and start your journey towards better financial health, 
                please confirm your email address by clicking the button below:
              </p>

              <div class="button-container">
                <a href="${confirmationUrl}" class="button">Confirm Your Account</a>
              </div>

              <p class="text">
                If you didn't create an account with MoneyLens, you can safely ignore this email.
              </p>
            </div>

            <div class="footer">
              <p>Need help? Contact us at <a href="mailto:support@moneylens.app" style="color: #3b82f6;">support@moneylens.app</a></p>
              <p>MoneyLens - Making Personal Finance Simple</p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">© 2025 MoneyLens. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Resend response:', { data, error });

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