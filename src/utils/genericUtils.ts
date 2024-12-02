export const getFormattedDate = (type: string) => {
    const now = new Date();

    const pad = (num: number) => String(num).padStart(2, '0');

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1); // I mesi sono indicizzati da 0
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    const dateOnly = `${day}-${month}-${year}`;
    const fullDate = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}-${milliseconds}`;
    if (type === 'parziale') {
      return dateOnly;
    } else if (type === 'completa') {
      return fullDate;
    }
  };