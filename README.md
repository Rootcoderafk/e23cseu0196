# AffordMed Backend Assignment - Aditya Kumar

This is my submission for the AffordMed evaluation project. I've built a Node.js backend using TypeScript that handles the authentication, a priority-based notification system, and a vehicle maintenance scheduler.

## Tech Used
- Node.js & TypeScript
- Express (for the server)
- Axios (for API calls)
- ts-node-dev (to run everything)

## Folders
- `src/config`: Has the API URLs and all the auth/registration logic.
- `src/middleware`: Just a simple logger that sends logs to the server.
- `src/notification-system`: Contains the design docs (Stages 1-5) and the priority inbox code.
- `src/vehicle-scheduling`: My DP solution for the vehicle scheduling task.
- `src/index.ts`: The main file that runs everything in order.

## How to get it running

1. **Install stuff:**
   ```bash
   npm install
   ```

2. **Setup your environment:**
   First, copy the example file to make your own `.env`:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in your actual details (Email, Name, Roll No, Access Code, etc.).

3. **Start the app:**
   ```bash
   npm run dev
   ```

When you run it, the script will:
- Automatically register you and get your IDs.
- Log in to get a fresh token.
- Print the **Top 10 Priority Notifications** to the console.
- Calculate the best **Vehicle Maintenance Schedule** for each depot using Dynamic Programming.
- Send logs for everything to the AffordMed logging service.

## My Implementation

### Part 1: Logging
I made a `Log` function that checks the level and package name before sending it off. It's asynchronous so it doesn't slow down the main logic, and it handles errors gracefully so the app won't crash if the log server is down.

### Part 2: Notification Inbox
I wrote out the full design for the notification system (see the .md files in the folder). For the priority logic, I used a weighted scoring system: **Placement > Result > Event**. If two have the same type, the newer one wins.

### Part 3: Vehicle Scheduling
This was a classic **0/1 Knapsack problem**. I used a 2D DP table to find the best combination of tasks for each depot's hour limit. It works out the max possible impact score for every depot based on the vehicles available.
