/**
 * Generates an enterprise-grade, cryptographically strong random password.
 * Length: 16 characters
 * Guarantee: Includes at least 2 uppercase, 2 lowercase, 2 numbers, and 2 special characters.
 */
export function generateStrongPassword(length = 16): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=[]{}';
  const allChars = uppers + lowers + numbers + symbols;

  const getRandomChar = (charset: string): string => {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return charset[randomBuffer[0] % charset.length];
  };

  // Ensure mandatory requirements are satisfied
  const passwordArray = [
    getRandomChar(uppers),
    getRandomChar(uppers),
    getRandomChar(lowers),
    getRandomChar(lowers),
    getRandomChar(numbers),
    getRandomChar(numbers),
    getRandomChar(symbols),
    getRandomChar(symbols),
  ];

  // Fill remaining slots
  while (passwordArray.length < length) {
    passwordArray.push(getRandomChar(allChars));
  }

  // Cryptographically shuffle array using Fisher-Yates
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}
