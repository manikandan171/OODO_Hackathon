/**
 * Live license validation utility to verify driver's compliance.
 * Performs a live date comparison between the current date and the license expiry date.
 */
export function isLicenseValid(expiryDateString: string): boolean {
  if (!expiryDateString) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDateString);
  // Ensure invalid date strings don't crash the server
  if (isNaN(expiry.getTime())) {
    return false;
  }
  expiry.setHours(0, 0, 0, 0);
  
  return expiry >= today;
}
