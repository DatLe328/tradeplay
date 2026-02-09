export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date'; 
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    // console.error("Error formatting date:", dateString);
    return 'Error Date';
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
    return formatDate(dateString); 
}

export function formatTimeAgo(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date'; 
    }
    
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (secondsAgo < 60) {
      return 'just now';
    }
    
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
      return minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;
    }
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
      return hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
    }
    
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 7) {
      return daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
    }
    
    const weeksAgo = Math.floor(daysAgo / 7);
    if (weeksAgo < 4) {
      return weeksAgo === 1 ? '1 week ago' : `${weeksAgo} weeks ago`;
    }
    
    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) {
      return monthsAgo === 1 ? '1 month ago' : `${monthsAgo} months ago`;
    }
    
    const yearsAgo = Math.floor(monthsAgo / 12);
    return yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`;
  } catch (error) {
    return 'Error Date';
  }
}