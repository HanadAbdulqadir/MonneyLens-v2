import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

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

    // Create simple HTML email template
    console.log('Creating email template...');
    const html = `
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
    .features { margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .feature { display: flex; margin: 16px 0; align-items: flex-start; }
    .feature-icon { font-size: 24px; margin-right: 16px; }
    .feature-title { color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 4px 0; }
    .feature-desc { color: #64748b; font-size: 14px; margin: 0; }
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

      <div class="features">
        <h3 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">What you can do with MoneyLens:</h3>
        
        <div class="feature">
          <div class="feature-icon">📊</div>
          <div>
            <div class="feature-title">Track Transactions</div>
            <div class="feature-desc">Monitor your income and expenses with ease</div>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">🎯</div>
          <div>
            <div class="feature-title">Set Financial Goals</div>
            <div class="feature-desc">Plan and achieve your financial objectives</div>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">📈</div>
          <div>
            <div class="feature-title">Analyze Spending</div>
            <div class="feature-desc">Get insights into your spending patterns</div>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">💳</div>
          <div>
            <div class="feature-title">Manage Debts</div>
            <div class="feature-desc">Track and plan your debt payments</div>
          </div>
        </div>
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
</html>`;
    console.log('Email template created successfully');

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