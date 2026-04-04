export const formatDate = (date: Date | string) => {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // weekday: 'long',
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateToFormat = typeof date === "string" ? new Date(date) : date;

  return dateFormatter.format(dateToFormat);
};
