import api, { ENDPOINTS } from '../config/api';
import { Log } from '../middleware/logger';

interface Notification {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event';
  Message: string;
  Timestamp: string;
  isRead?: boolean; // API might not return this, we assume all fetched are unread or handled by client
}

// This function calculates a score for each notification to help us sort them
function getPriorityScore(notification: Notification): number {
  // Placement is most important, then Results, then Events
  const typeWeight: Record<string, number> = {
    'Placement': 3,
    'Result': 2,
    'Event': 1,
  };

  const weight = typeWeight[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();

  // Combine the type weight with the timestamp so newer ones of the same type rank higher
  return weight * 1e13 + timestamp; 
}

// Main function to fetch all notifications and show the top 10 most important ones
export async function getPriorityNotifications() {
  try {
    await Log('backend', 'info', 'service', 'Fetching notifications for priority inbox...');
    
    // Get the raw data from the server
    const response = await api.get(ENDPOINTS.NOTIFICATIONS);
    const notifications: Notification[] = response.data.notifications;

    if (!Array.isArray(notifications)) {
      throw new Error('Server didn\'t return an array of notifications');
    }

    // Sort them using the score function we wrote above
    const sorted = notifications.sort((a, b) => {
      const scoreA = getPriorityScore(a);
      const scoreB = getPriorityScore(b);
      return scoreB - scoreA; // Highest score first
    });

    // We only care about the top 10
    const top10 = sorted.slice(0, 10);

    console.log('\n--- TOP 10 PRIORITY UNREAD NOTIFICATIONS ---');
    if (top10.length === 0) {
      console.log('Nothing new here.');
    } else {
      top10.forEach((n, i) => {
        console.log(`${i + 1}. [${n.Type}] ${n.Message.slice(0, 50)}... (${new Date(n.Timestamp).toLocaleString()})`);
      });
    }
    console.log('--------------------------------------------\n');

    await Log('backend', 'info', 'service', `Successfully showed ${top10.length} notifications.`);
    return top10;
  } catch (error: any) {
    // Log the error and tell the user what happened
    await Log('backend', 'error', 'service', `Priority inbox broke: ${error.message}`);
    console.error('Priority Inbox Error:', error.message);
  }
}
