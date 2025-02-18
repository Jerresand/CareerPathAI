import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkStripeCLI() {
  console.log(
    'Step 1: Checking if Stripe CLI is installed and authenticated...'
  );
  try {
    await execAsync('stripe --version');
    console.log('Stripe CLI is installed.');

    // Check if Stripe CLI is authenticated
    try {
      await execAsync('stripe config --list');
      console.log('Stripe CLI is authenticated.');
    } catch (error) {
      console.log(
        'Stripe CLI is not authenticated or the authentication has expired.'
      );
      console.log('Please run: stripe login');
      const answer = await question(
        'Have you completed the authentication? (y/n): '
      );
      if (answer.toLowerCase() !== 'y') {
        console.log(
          'Please authenticate with Stripe CLI and run this script again.'
        );
        process.exit(1);
      }

      // Verify authentication after user confirms login
      try {
        await execAsync('stripe config --list');
        console.log('Stripe CLI authentication confirmed.');
      } catch (error) {
        console.error(
          'Failed to verify Stripe CLI authentication. Please try again.'
        );
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(
      'Stripe CLI is not installed. Please install it and try again.'
    );
    console.log('To install Stripe CLI, follow these steps:');
    console.log('1. Visit: https://docs.stripe.com/stripe-cli');
    console.log(
      '2. Download and install the Stripe CLI for your operating system'
    );
    console.log('3. After installation, run: stripe login');
    console.log(
      'After installation and authentication, please run this setup script again.'
    );
    process.exit(1);
  }
}

async function getPostgresURL(): Promise<string> {
  console.log('Step 2: Setting up Postgres');
  const dbChoice = await question(
    'Do you want to use a local Postgres instance with Docker (L) or a remote Postgres instance (R)? (L/R): '
  );

  if (dbChoice.toLowerCase() === 'l') {
    console.log('Setting up local Postgres instance with Docker...');
    await setupLocalPostgres();
    return 'postgres://postgres:postgres@localhost:54322/postgres';
  } else {
    console.log(
      'You can find Postgres databases at: https://vercel.com/marketplace?category=databases'
    );
    return await question('Enter your POSTGRES_URL: ');
  }
}

async function setupLocalPostgres() {
  console.log('Checking if Docker is installed...');
  try {
    await execAsync('docker --version');
    console.log('Docker is installed.');
  } catch (error) {
    console.error(
      'Docker is not installed. Please install Docker and try again.'
    );
    console.log(
      'To install Docker, visit: https://docs.docker.com/get-docker/'
    );
    process.exit(1);
  }

  console.log('Creating docker-compose.yml file...');
  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: next_saas_starter_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  supabase-studio:
    image: supabase/studio:latest
    container_name: next_saas_starter_studio
    ports:
      - "54323:3000"
    environment:
      STUDIO_PG_META_URL: http://meta:8080
      POSTGRES_PASSWORD: postgres
      DEFAULT_ORGANIZATION: Default Organization
      DEFAULT_PROJECT: Default Project
      SUPABASE_URL: http://kong:8000
      SUPABASE_PUBLIC_URL: http://localhost:54324
      SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJwA43x1xZ5q4gpZyaEhYZngb0Jz0z8

  kong:
    image: kong:2.8.1
    container_name: next_saas_starter_kong
    ports:
      - "54324:8000"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
      KONG_DNS_ORDER: LAST,A,CNAME
      KONG_PLUGINS: request-transformer,cors,key-auth,acl
    volumes:
      - ./volumes/kong.yml:/var/lib/kong/kong.yml:ro

  auth:
    image: supabase/gotrue:v2.82.4
    container_name: next_saas_starter_auth
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: http://localhost:54324
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_HOST: postgres
      GOTRUE_DB_PORT: 5432
      GOTRUE_DB_NAME: postgres
      GOTRUE_DB_USER: postgres
      GOTRUE_DB_PASSWORD: postgres
      GOTRUE_JWT_SECRET: your-super-secret-jwt-token-with-at-least-32-characters
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_DISABLE_SIGNUP: false
      GOTRUE_SITE_URL: http://localhost:3000
      GOTRUE_SMTP_ADMIN_EMAIL: admin@example.com
      GOTRUE_SMTP_HOST: mail
      GOTRUE_SMTP_PORT: 2500
      GOTRUE_SMTP_USER: fake_mail_user
      GOTRUE_SMTP_PASS: fake_mail_password
      GOTRUE_SMTP_SENDER_NAME: Supabase
      GOTRUE_MAILER_AUTOCONFIRM: true
    depends_on:
      postgres:
        condition: service_healthy

  meta:
    image: supabase/postgres-meta:v0.68.0
    container_name: next_saas_starter_meta
    environment:
      PG_META_PORT: 8080
      PG_META_DB_HOST: postgres
      PG_META_DB_PASSWORD: postgres
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
`;

  // Create volumes directory and Kong configuration
  const kongConfig = `
_format_version: "2.1"
_transform: true

services:
  - name: auth-v1
    url: http://auth:9999/verify
    routes:
      - name: auth-v1-all
        strip_path: true
        paths:
          - /auth/v1/verify
    plugins:
      - name: cors
  - name: auth-v1-open
    url: http://auth:9999
    routes:
      - name: auth-v1-open-all
        strip_path: true
        paths:
          - /auth/v1/
    plugins:
      - name: cors
`;

  // Create necessary directories and files
  await fs.mkdir(path.join(process.cwd(), 'volumes'), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), 'volumes/kong.yml'), kongConfig);
  await fs.writeFile(
    path.join(process.cwd(), 'docker-compose.yml'),
    dockerComposeContent
  );
  
  console.log('docker-compose.yml and supporting files created.');

  console.log('Starting Docker container with `docker compose up -d`...');
  try {
    await execAsync('docker compose up -d');
    console.log('Docker container started successfully.');
  } catch (error) {
    console.error(
      'Failed to start Docker container. Please check your Docker installation and try again.'
    );
    process.exit(1);
  }
}

async function getStripeSecretKey(): Promise<string> {
  console.log('Step 3: Getting Stripe Secret Key');
  console.log(
    'You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys'
  );
  return await question('Enter your Stripe Secret Key: ');
}

async function createStripeWebhook(): Promise<string> {
  console.log('Step 4: Creating Stripe webhook...');
  try {
    const { stdout } = await execAsync('stripe listen --print-secret');
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) {
      throw new Error('Failed to extract Stripe webhook secret');
    }
    console.log('Stripe webhook created.');
    return match[0];
  } catch (error) {
    console.error(
      'Failed to create Stripe webhook. Check your Stripe CLI installation and permissions.'
    );
    if (os.platform() === 'win32') {
      console.log(
        'Note: On Windows, you may need to run this script as an administrator.'
      );
    }
    throw error;
  }
}

function generateAuthSecret(): string {
  console.log('Step 5: Generating AUTH_SECRET...');
  return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 6: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
  console.log('.env file created with the necessary variables.');
}

async function main() {
  await checkStripeCLI();

  const POSTGRES_URL = await getPostgresURL();
  const STRIPE_SECRET_KEY = await getStripeSecretKey();
  const STRIPE_WEBHOOK_SECRET = await createStripeWebhook();
  const BASE_URL = 'http://localhost:3000';
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    POSTGRES_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    BASE_URL,
    AUTH_SECRET,
  });

  console.log('🎉 Setup completed successfully!');
}

main().catch(console.error);