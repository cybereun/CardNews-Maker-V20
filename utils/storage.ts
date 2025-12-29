// Simple XOR cipher for obfuscation (Not military-grade encryption, but prevents plain text storage)
const SALT = "GEM_CARD_NEWS_SECURE_KEY_V1";

const xorEncrypt = (text: string): string => {
  const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code: number) =>
    textToChars(SALT).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map((c) => c.charCodeAt(0))
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

const xorDecrypt = (encoded: string): string => {
  const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code: number) =>
    textToChars(SALT).reduce((a, b) => a ^ b, code);

  return (encoded.match(/.{1,2}/g) || [])
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};

export const saveApiKey = (apiKey: string) => {
  if (!apiKey) return;
  const encrypted = xorEncrypt(apiKey);
  localStorage.setItem("gem_api_key", encrypted);
};

export const getApiKey = (): string | null => {
  const encrypted = localStorage.getItem("gem_api_key");
  if (!encrypted) return null;
  try {
    return xorDecrypt(encrypted);
  } catch (e) {
    console.error("Failed to decrypt API key", e);
    return null;
  }
};

export const hasApiKey = (): boolean => {
  return !!localStorage.getItem("gem_api_key");
};

export const removeApiKey = () => {
  localStorage.removeItem("gem_api_key");
};
