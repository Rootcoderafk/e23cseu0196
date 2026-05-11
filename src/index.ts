import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from './config/auth';
import { Log } from './middleware/logger';
import { getPriorityNotifications } from './notification-system/priorityInbox';
import { scheduleVehicles } from './vehicle-scheduling/vehicleScheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// This is the main entry point for the whole evaluation process
async function runEvaluation() {
  console.log('=== AFFORDMED EVALUATION SERVICE STARTING ===');

  try {
    // Step 1: Get the auth token and stuff ready
    await Log('backend', 'info', 'service', 'Initiating authentication sequence...');
    await authenticate(); // Always refresh token just to be safe

    // Step 2: Run the priority inbox logic (Stage 6)
    await getPriorityNotifications();

    // Step 3: Run the vehicle scheduling logic (DP part)
    await scheduleVehicles();

    await Log('backend', 'info', 'service', 'Evaluation flow completed successfully.');
    console.log('=== EVALUATION FLOW COMPLETED ===');
  } catch (error: any) {
    console.error('Something went wrong in the main flow:', error.message);
    await Log('backend', 'fatal', 'service', `Critical failure in main flow: ${error.message}`);
  }
}

// Starting the express server on port 3000
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Kick off the evaluation steps
  await runEvaluation();
});
