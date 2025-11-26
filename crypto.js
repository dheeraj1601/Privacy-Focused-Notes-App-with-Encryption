import CryptoJS from 'crypto-js'

// Derive a strong key from passphrase (simple PBKDF2)
export function deriveKey(passphrase) {
  // 256-bit key with salt (for demo, salt is fixed — in production consider per-user salt storage)
  const salt = CryptoJS.enc.Utf8.parse('privacy-notes-salt-v1')
  const key = CryptoJS.PBKDF2(passphrase, salt, { keySize: 256/32, iterations: 1000 })
  return key.toString()
}

export function encryptText(plainText, passphrase) {
  if (!passphrase) throw new Error('Passphrase required')
  // AES encryption with base64 output
  const ciphertext = CryptoJS.AES.encrypt(plainText, passphrase).toString()
  return ciphertext
}

export function decryptText(cipherText, passphrase) {
  if (!passphrase) throw new Error('Passphrase required')
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, passphrase)
    const text = bytes.toString(CryptoJS.enc.Utf8)
    return text
  } catch (e) {
    return '' // on failure return empty
  }
}
