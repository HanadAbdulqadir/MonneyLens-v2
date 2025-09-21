import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ConfirmationEmailProps {
  displayName: string;
  confirmationUrl: string;
  supportEmail: string;
}

export const ConfirmationEmail = ({
  displayName = 'Valued User',
  confirmationUrl = '',
  supportEmail = 'support@moneylens.app',
}: ConfirmationEmailProps) => (
  <Html>
    <Head>
      <title>Welcome to MoneyLens - Confirm Your Account</title>
    </Head>
    <Preview>Complete your MoneyLens account setup in just one click</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <Row>
            <Column>
              <Heading style={logoText}>MoneyLens</Heading>
              <Text style={tagline}>Your Personal Finance Companion</Text>
            </Column>
          </Row>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Welcome to MoneyLens, {displayName}!</Heading>
          
          <Text style={text}>
            Thank you for joining MoneyLens, the smart way to manage your personal finances. 
            You're just one click away from taking control of your financial future.
          </Text>

          <Text style={text}>
            To complete your account setup and start your journey towards better financial health, 
            please confirm your email address by clicking the button below:
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Confirm Your Account
            </Button>
          </Section>

          <Text style={smallText}>
            If the button above doesn't work, you can also copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>
            <Link href={confirmationUrl} style={link}>
              {confirmationUrl}
            </Link>
          </Text>

          {/* Features Section */}
          <Section style={featuresSection}>
            <Heading style={h2}>What you can do with MoneyLens:</Heading>
            
            <Row style={featureRow}>
              <Column style={featureIcon}>📊</Column>
              <Column style={featureContent}>
                <Text style={featureTitle}>Track Transactions</Text>
                <Text style={featureDesc}>Monitor your income and expenses with ease</Text>
              </Column>
            </Row>

            <Row style={featureRow}>
              <Column style={featureIcon}>🎯</Column>
              <Column style={featureContent}>
                <Text style={featureTitle}>Set Financial Goals</Text>
                <Text style={featureDesc}>Plan and achieve your financial objectives</Text>
              </Column>
            </Row>

            <Row style={featureRow}>
              <Column style={featureIcon}>📈</Column>
              <Column style={featureContent}>
                <Text style={featureTitle}>Analyze Spending</Text>
                <Text style={featureDesc}>Get insights into your spending patterns</Text>
              </Column>
            </Row>

            <Row style={featureRow}>
              <Column style={featureIcon}>💳</Column>
              <Column style={featureContent}>
                <Text style={featureTitle}>Manage Debts</Text>
                <Text style={featureDesc}>Track and plan your debt payments</Text>
              </Column>
            </Row>
          </Section>

          <Text style={text}>
            If you didn't create an account with MoneyLens, you can safely ignore this email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Need help? Contact us at{' '}
            <Link href={`mailto:${supportEmail}`} style={footerLink}>
              {supportEmail}
            </Link>
          </Text>
          <Text style={footerText}>
            MoneyLens - Making Personal Finance Simple
          </Text>
          <Text style={copyright}>
            © 2025 MoneyLens. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#ffffff',
  borderRadius: '12px 12px 0 0',
  padding: '32px 24px 24px',
  textAlign: 'center' as const,
  borderBottom: '3px solid #3b82f6',
};

const logoText = {
  color: '#1e293b',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const tagline = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
  borderRadius: '0 0 12px 12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: '600',
  margin: '32px 0 16px 0',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
};

const smallText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 8px 0',
};

const linkText = {
  margin: '0 0 24px 0',
};

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const featuresSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const featureRow = {
  margin: '16px 0',
};

const featureIcon = {
  width: '40px',
  fontSize: '24px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
};

const featureContent = {
  paddingLeft: '16px',
  verticalAlign: 'top' as const,
};

const featureTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const featureDesc = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  lineHeight: '20px',
};

const footer = {
  textAlign: 'center' as const,
  margin: '32px 0 0 0',
};

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  margin: '8px 0',
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const copyright = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '16px 0 0 0',
};