function normalizeDate(dateStr?: string): string {
  if (!dateStr) return "";

  const normalized = dateStr.trim();

  // Handle format: "21-Oct-1977" -> "1977-10-21"
  const monthNames: { [key: string]: string } = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  // Pattern: DD-MMM-YYYY or DD-MMM-YY
  const pattern1 = /^(\d{1,2})-([a-zA-Z]{3})-(\d{2,4})$/;
  const match1 = normalized.match(pattern1);

  if (match1) {
    const day = match1[1].padStart(2, "0");
    const month = monthNames[match1[2].toLowerCase()];
    let year = match1[3];

    // Handle 2-digit years
    if (year.length === 2) {
      year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    }

    return `${year}-${month}-${day}`;
  }

  // Pattern: YYYY-MM-DD (already in correct format)
  const pattern2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match2 = normalized.match(pattern2);

  if (match2) {
    const year = match2[1];
    const month = match2[2].padStart(2, "0");
    const day = match2[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // If no pattern matches, return normalized string
  return normalized;
}

export { normalizeDate };
