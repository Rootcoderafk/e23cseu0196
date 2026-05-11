import api, { ENDPOINTS } from '../config/api';

type Stack = 'backend' | 'frontend';
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type Package = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';

/**
 * Reusable logging function that sends logs to the evaluation service.
 * @param stack - backend or frontend
 * @param level - debug, info, warn, error, fatal
 * @param pkg - package name
 * @param message - log message
 */
export async function Log(stack: Stack, level: Level, pkg: Package, message: string) {
  // Simple validation
  const allowedStacks = ['backend', 'frontend'];
  const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const allowedPackages = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];

  if (!allowedStacks.includes(stack) || !allowedLevels.includes(level) || !allowedPackages.includes(pkg)) {
    console.warn(`[Logger] Invalid log parameters: stack=${stack}, level=${level}, package=${pkg}`);
    return;
  }

  // Truncate message to 48 characters as required by API
  const truncatedMessage = message.length > 48 ? message.substring(0, 45) + '...' : message;

  const logPayload = { 
    stack, 
    level, 
    'package': pkg, 
    message: truncatedMessage
  };

  try {
    await api.post(ENDPOINTS.LOGS, logPayload);
    console.log(`[INFO] ${pkg}: ${message}`);
  } catch (error: any) {
    // Handle API failures gracefully - never crash app
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Logger] Failed to send log to API: ${errorMsg}`);
  }
}

// Example usage middleware for Express (optional but good for a backend)
export const requestLogger = async (req: any, res: any, next: any) => {
  await Log('backend', 'info', 'route', `${req.method} ${req.url}`);
  next();
};
