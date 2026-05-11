import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import api, { ENDPOINTS } from './api';

dotenv.config();

const envPath = path.resolve(process.cwd(), '.env');

/**
 * Updates the .env file with new key-value pairs.
 */
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

/**
 * Registers the student with the evaluation service.
 */
export async function register() {
  const { EMAIL, NAME, MOBILE_NO, GITHUB_USERNAME, ROLL_NO, ACCESS_CODE } = process.env;

  if (!EMAIL || !NAME || !MOBILE_NO || !GITHUB_USERNAME || !ROLL_NO || !ACCESS_CODE) {
    throw new Error('Registration credentials missing in .env');
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
    updateEnv({ CLIENT_ID: clientID, CLIENT_SECRET: clientSecret });
    console.log('Registration successful! CLIENT_ID and CLIENT_SECRET saved.');
    return response.data;
  } catch (error: any) {
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Authenticates and fetches a new access token.
 */
export async function authenticate() {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('CLIENT_ID or CLIENT_SECRET missing. Attempting registration...');
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
    updateEnv({ ACCESS_TOKEN: access_token });
    console.log('Authentication successful! ACCESS_TOKEN saved.');
    return access_token;
  } catch (error: any) {
    console.error('Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Ensures a valid token is available.
 */
export async function ensureAuth() {
  if (!process.env.ACCESS_TOKEN) {
    return await authenticate();
  }
  return process.env.ACCESS_TOKEN;
}
