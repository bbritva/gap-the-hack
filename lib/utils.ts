// Utility functions

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculatePoints(
  isCorrect: boolean,
  timeTaken: number,
  basePoints: number = 100
): number {
  if (!isCorrect) return 0;

  let points = basePoints;

  // Speed bonus (answered in less than 10 seconds)
  if (timeTaken < 10) {
    points += 50;
  } else if (timeTaken < 20) {
    points += 25;
  }

  return points;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getPerformanceColor(successRate: number): string {
  if (successRate >= 0.7) return 'text-green-600';
  if (successRate >= 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

export function getPerformanceEmoji(successRate: number): string {
  if (successRate >= 0.9) return '🔥';
  if (successRate >= 0.7) return '✅';
  if (successRate >= 0.5) return '👍';
  if (successRate >= 0.3) return '⚠️';
  return '❌';
}
