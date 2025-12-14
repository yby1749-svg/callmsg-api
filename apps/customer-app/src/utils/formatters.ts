import {format, formatDistance, parseISO} from 'date-fns';

export function formatCurrency(amount: number): string {
  return '₱' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return hour12 + ':' + minutes.toString().padStart(2, '0') + ' ' + period;
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), {addSuffix: true});
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return (
      '(' +
      cleaned.slice(0, 3) +
      ') ' +
      cleaned.slice(3, 6) +
      '-' +
      cleaned.slice(6)
    );
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return (
      '0' +
      cleaned.slice(1, 4) +
      ' ' +
      cleaned.slice(4, 7) +
      ' ' +
      cleaned.slice(7)
    );
  }
  return phone;
}
