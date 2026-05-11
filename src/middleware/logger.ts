import api, { ENDPOINTS } from '../config/api';

type Stack = 'backend' | 'frontend';
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type Package = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';

// Simple logger function to push logs to the evaluation API
export async function Log(stack: Stack, level: Level, pkg: Package, message: string) {
  // Just making sure we are sending valid stuff to the API
  const allowedStacks = ['backend', 'frontend'];
  const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const allowedPackages = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];

  if (!allowedStacks.includes(stack) || !allowedLevels.includes(level) || !allowedPackages.includes(pkg)) {
    console.warn(`[Logger] Something is wrong with the log params: stack=${stack}, level=${level}, package=${pkg}`);
    return;
  }

  // The API has a strict 48 char limit for messages, so we truncate it if it's too long
  const truncatedMessage = message.length > 48 ? message.substring(0, 45) + '...' : message;

  const logPayload = { 
    stack, 
    level, 
    'package': pkg, 
    message: truncatedMessage
  };

  try {
    // Send the log and also print it to our console
    await api.post(ENDPOINTS.LOGS, logPayload);
    console.log(`[LOG] ${pkg}: ${message}`);
  } catch (error: any) {
    // If the logging fails, we just print the error and move on. Don't want to crash the app.
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Logger Error] Couldn't send log: ${errorMsg}`);
  }
}

// Middleware if we want to log every single incoming request
export const requestLogger = async (req: any, res: any, next: any) => {
  await Log('backend', 'info', 'route', `${req.method} ${req.url}`);
  next();
};
