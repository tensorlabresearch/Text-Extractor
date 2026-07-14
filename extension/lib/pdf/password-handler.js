// Password-protected PDF handler.

/**
 * Create a password callback for PDF.js.
 * @param {Function} promptUser - async () => string | null
 * @returns {Function}
 */
export function createPasswordHandler(promptUser) {
  return async (_updatePassword, reason) => {
    const message =
      reason === 2
        ? "Incorrect password. Please try again."
        : "This PDF is password-protected. Enter the password:";
    const password = await promptUser(message);
    if (!password) throw new Error("Password entry cancelled");
    return password;
  };
}
