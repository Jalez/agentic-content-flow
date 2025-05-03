export function withErrorHandler<T extends (...args: any[]) => any>(
  context: string,
  fn: T
): T {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      // Optionally, rethrow or return a fallback value
      throw error;
    }
  }) as T;
}
