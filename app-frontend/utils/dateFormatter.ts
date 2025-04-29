// Format a timestamp (milliseconds since epoch) into a human-readable format
export function format(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Check if it's today
  if (isSameDay(date, now)) {
    return formatTime(date);
  }
  
  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${formatTime(date)}`;
  }
  
  // Check if it's this week
  const daysDiff = getDaysDifference(date, now);
  if (daysDiff < 7) {
    return `${getDayName(date)}, ${formatTime(date)}`;
  }
  
  // Otherwise return full date
  return `${formatDate(date)}, ${formatTime(date)}`;
}

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Format time as HH:MM AM/PM
function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
}

// Format date as MMM DD, YYYY
function formatDate(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

// Get day name
function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Get days difference between two dates
function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}