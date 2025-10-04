export type MaskFunction = (rawValue: string) => string;

export function createNumberMask() {
  let lastValidNumber = '';

  return function numberMask(rawValue: string): string {
    // Create a regular expression to match valid number patterns with the correct decimal separator
    const regex = /^-?\d*([.,]?)\d*$/;
    const match = rawValue.match(regex);

    // If the input matches the pattern, update the last valid number and return it
    if (match) {
      lastValidNumber = match[0];
      return lastValidNumber;
    }

    // If the input does not match the pattern, return the last valid number
    return lastValidNumber;
  };
}
