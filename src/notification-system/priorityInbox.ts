import api, { ENDPOINTS } from '../config/api';
import { Log } from '../middleware/logger';

interface Notification {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event';
  Message: string;
  Timestamp: string;
  isRead?: boolean; // API might not return this, we assume all fetched are unread or handled by client
}

/**
 * Calculates priority based on type and recency.
 */
function getPriorityScore(notification: Notification): number {
  const typeWeight: Record<string, number> = {
    'Placement': 3,
    'Result': 2,
    'Event': 1,
  };

  const weight = typeWeight[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();

  return weight * 1e13 + timestamp; 
}

/**
 * Fetches notifications and displays the top 10 unread ones based on priority.
 */
export async function getPriorityNotifications() {
  try {
    await Log('backend', 'info', 'service', 'Fetching notifications for priority inbox...');
    
    const response = await api.get(ENDPOINTS.NOTIFICATIONS);
    const notifications: Notification[] = response.data.notifications;

    if (!Array.isArray(notifications)) {
      throw new Error('Expected array of notifications');
    }

    // Filter unread (Assuming all returned are relevant)
    const unread = notifications; 

    // Sort by priority (Type > Recency)
    const sorted = unread.sort((a, b) => {
      const scoreA = getPriorityScore(a);
      const scoreB = getPriorityScore(b);
      return scoreB - scoreA; // Descending
    });

    // Take top 10
    const top10 = sorted.slice(0, 10);

    console.log('\n--- TOP 10 PRIORITY UNREAD NOTIFICATIONS ---');
    if (top10.length === 0) {
      console.log('No notifications found.');
    } else {
      top10.forEach((n, i) => {
        console.log(`${i + 1}. [${n.Type}] ${n.Message.slice(0, 50)}... (${new Date(n.Timestamp).toLocaleString()})`);
      });
    }
    console.log('--------------------------------------------\n');

    await Log('backend', 'info', 'service', `Successfully displayed ${top10.length} priority notifications.`);
    return top10;
  } catch (error: any) {
    await Log('backend', 'error', 'service', `Failed to process priority inbox: ${error.message}`);
    console.error('Priority Inbox Error:', error.message);
  }
}
