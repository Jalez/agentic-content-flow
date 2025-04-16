/** @format */

/**
 * Log a message with a stack trace to help debug function call paths
 * @param message The message to log
 * @param data Optional data to include in the log
 */
export const logWithStack = (message: string, data?: any) => {
  // Create an Error to get the stack trace
  const stackTrace = new Error().stack;
  
  // Format the stack trace for better readability
  const formattedStack = stackTrace
    ?.split('\n')
    .slice(2) // Skip the Error constructor and this function call
    .map(line => line.trim())
    .join('\n');
  
  console.group(`%c${message}`, 'color: #0066cc; font-weight: bold;');
  if (data !== undefined) {
    console.log('Data:', data);
  }
  console.log('%cCall Stack:', 'color: #cc6600; font-weight: bold;');
  console.log(formattedStack);
  console.groupEnd();
};

/**
 * Create a version of a function that logs when it's called with a stack trace
 * @param fn The function to wrap with logging
 * @param name The name of the function for the log
 * @returns A wrapped version of the function that logs when called
 */
export const traceFunction = <T extends (...args: any[]) => any>(fn: T, name: string): T => {
  return ((...args: any[]) => {
    logWithStack(`FUNCTION CALLED: ${name}`);
    return fn(...args);
  }) as T;
};