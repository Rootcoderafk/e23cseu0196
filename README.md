# AffordMed Evaluation Assignment Submission

This repository contains the backend implementation for the AffordMed evaluation assignment.

## Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **API Client:** Axios
- **Task Runner:** ts-node-dev

## Project Structure
- `src/config`: API endpoints and Authentication logic.
- `src/middleware`: Logging middleware and utility.
- `src/notification-system`: Design documents (Stages 1-5) and Priority Inbox implementation (Stage 6).
- `src/vehicle-scheduling`: Vehicle Maintenance Scheduler using 0/1 Knapsack Dynamic Programming.
- `src/index.ts`: Entry point that executes the evaluation flow.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Copy the `.env.example` file to create a new `.env` file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   EMAIL=your_email@example.com
   NAME=Your Name
   MOBILE_NO=1234567890
   GITHUB_USERNAME=your_github
   ROLL_NO=your_roll_no
   ACCESS_CODE=your_access_code
   ```

3. **Run the Application:**
   ```bash
   npm run dev
   ```
   The application will automatically:
   - Register you with the evaluation service (if credentials aren't present).
   - Authenticate and retrieve a Bearer token.
   - Fetch and display the **Top 10 Priority Unread Notifications**.
   - Solve the **Vehicle Maintenance Scheduling** problem for each depot using DP.
   - Log all major events to the remote logging service.

## Implementation Details

### Part 1: Logging
The `Log` function validates parameters (stack, level, package) and sends a POST request to the logging API asynchronously. It is designed to be resilient and never crash the application on network failure.

### Part 2: Notification Microservice
- **Stages 1-5:** Detailed design and strategy documents are located in `src/notification-system/`.
- **Stage 6:** Priority inbox sorting uses a weighted score combining `Type` (Placement > Result > Event) and `Recency` (Timestamp).

### Part 3: Vehicle Scheduling
The scheduler implements the **0/1 Knapsack algorithm** using a 2D Dynamic Programming table. For each depot, it calculates the subset of vehicles that maximizes the `impact` score without exceeding the `mechanicHours` capacity.
