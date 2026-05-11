import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import api, { ENDPOINTS } from './api';

dotenv.config();

const envPath = path.resolve(process.cwd(), '.env');

// Helper to swap out values in the .env file without messsing up other lines
function updateEnv(updates: Record<string, string>) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
    process.env[key] = value;
  }
  fs.writeFileSync(envPath, envContent);
}

// Function to handle the initial registration and get the client ID/Secret
export async function register() {
  const { EMAIL, NAME, MOBILE_NO, GITHUB_USERNAME, ROLL_NO, ACCESS_CODE } = process.env;

  if (!EMAIL || !NAME || !MOBILE_NO || !GITHUB_USERNAME || !ROLL_NO || !ACCESS_CODE) {
    throw new Error('You need to fill in all the details in the .env file first!');
  }

  try {
    const response = await axios.post(ENDPOINTS.REGISTER, {
      email: EMAIL,
      name: NAME,
      mobileNo: MOBILE_NO,
      githubUsername: GITHUB_USERNAME,
      rollNo: ROLL_NO,
      accessCode: ACCESS_CODE,
    });

    const { clientID, clientSecret } = response.data;
    // Save these so we don't have to register every single time
    updateEnv({ CLIENT_ID: clientID, CLIENT_SECRET: clientSecret });
    console.log('Registration done! Got the IDs.');
    return response.data;
  } catch (error: any) {
    console.error('Registration broke:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get a fresh Bearer token from the auth endpoint
export async function authenticate() {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  // If we don't have IDs yet, try registering first
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('No IDs found, trying to register now...');
    await register();
  }

  try {
    const response = await axios.post(ENDPOINTS.AUTH, {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      email: process.env.EMAIL,
      name: process.env.NAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
    });

    const { access_token } = response.data;
    // Update the token in our env file so the rest of the app can use it
    updateEnv({ ACCESS_TOKEN: access_token });
    console.log('Auth success! Token is ready.');
    return access_token;
  } catch (error: any) {
    console.error('Auth failed:', error.response?.data || error.message);
    throw error;
  }
}

// Check if we already have a token, otherwise get one
export async function ensureAuth() {
  if (!process.env.ACCESS_TOKEN) {
    return await authenticate();
  }
  return process.env.ACCESS_TOKEN;
}
