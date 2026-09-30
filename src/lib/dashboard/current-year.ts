const YEAR_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  timeZone: 'America/Montevideo',
});

export function getCurrentYear(now = new Date()) {
  return Number(YEAR_FORMAT.format(now));
}
