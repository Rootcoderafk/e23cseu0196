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

/**
 * Main execution flow for the evaluation assignment.
 */
async function runEvaluation() {
  console.log('=== AFFORDMED EVALUATION SERVICE STARTING ===');

  try {
    // 1. Authenticate / Register
    await Log('backend', 'info', 'service', 'Initiating authentication sequence...');
    await authenticate(); // Force refresh token on every run for safety

    // 2. Part 2: Priority Inbox (Stage 6)
    await getPriorityNotifications();

    // 3. Part 3: Vehicle Scheduling
    await scheduleVehicles();

    await Log('backend', 'info', 'service', 'Evaluation flow completed successfully.');
    console.log('=== EVALUATION FLOW COMPLETED ===');
  } catch (error: any) {
    console.error('Fatal error in evaluation flow:', error.message);
    await Log('backend', 'fatal', 'service', `Critical failure in main flow: ${error.message}`);
  }
}

// Start server (though the assignment is mostly script-like execution, 
// keeping it as a server as per tech stack requirements)
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Trigger the evaluation flow
  await runEvaluation();
});
