import api, { ENDPOINTS } from '../config/api';
import { Log } from '../middleware/logger';

interface Vehicle {
  TaskID: string;
  Duration: number; // weight
  Impact: number;   // value
}

interface Depot {
  ID: number;
  MechanicHours: number; // capacity
}

// Standard 0/1 Knapsack problem using Dynamic Programming to find the best mix of tasks
function solveKnapsack(vehicles: Vehicle[], capacity: number) {
  const n = vehicles.length;
  // Create a 2D table to store the results of sub-problems
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (Duration <= w) {
        // Either include the vehicle or skip it, whichever gives more impact
        dp[i][w] = Math.max(Impact + dp[i - 1][w - Duration], dp[i - 1][w]);
      } else {
        // Can't fit this vehicle, so just take the result from the previous one
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Work backwards from the table to see exactly which vehicles were picked
  const selected: Vehicle[] = [];
  let w = capacity;
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }

  return { maxImpact: dp[n][capacity], selected };
}

// Function to fetch the data and run the scheduler for every depot we have
export async function scheduleVehicles() {
  try {
    await Log('backend', 'info', 'service', 'Fetching depots and vehicles for scheduling...');

    // Fetch both lists at the same time to save time
    const [depotsRes, vehiclesRes] = await Promise.all([
      api.get(ENDPOINTS.DEPOTS),
      api.get(ENDPOINTS.VEHICLES),
    ]);

    const depots: Depot[] = depotsRes.data.depots;
    const vehicles: Vehicle[] = vehiclesRes.data.vehicles;

    if (!Array.isArray(depots) || !Array.isArray(vehicles)) {
      throw new Error('The API returned something that isn\'t an array.');
    }

    console.log('\n--- VEHICLE MAINTENANCE SCHEDULE PER DEPOT ---');

    // Calculate the best schedule for each depot individually
    depots.forEach(depot => {
      const { maxImpact, selected } = solveKnapsack(vehicles, depot.MechanicHours);
      
      console.log(`\nDepot ID: ${depot.ID} (Limit: ${depot.MechanicHours} hrs)`);
      console.log(`Max Impact Score: ${maxImpact}`);
      console.log(`Selected Tasks (${selected.length}):`);
      selected.forEach(v => {
        console.log(` - Task: ${v.TaskID.slice(0, 8)} (Duration: ${v.Duration}h, Impact: ${v.Impact})`);
      });
      
      if (selected.length === 0) {
        console.log(' - The limit is too small to schedule anything.');
      }
    });

    console.log('\n----------------------------------------------\n');

    await Log('backend', 'info', 'service', `Successfully scheduled vehicles for ${depots.length} depots.`);
  } catch (error: any) {
    // Log the error so we can debug it later
    await Log('backend', 'error', 'service', `Vehicle scheduling failed: ${error.message}`);
    console.error('Vehicle Scheduler Error:', error.message);
  }
}
