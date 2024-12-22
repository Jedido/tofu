
import dotenv from 'dotenv'
import crypto from "crypto"

dotenv.config({ path: `.env.local` })
dotenv.config()

const secretKey = process.env.CIPHER_SECRET || (() => {
  console.warn("CIPHER_SECRET was not configured in the environment! Generating a random key...")
  return crypto.randomBytes(32).toString("hex")
})()

const algorithm = "aes-256-cbc"
const keyBuffer = Buffer.from(secretKey, "hex")

export function encrypt(plaintext: string) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv)
  return {
    iv: iv.toString('hex'),
    content: cipher.update(plaintext, "utf8", "hex") + cipher.final("hex")
  } 
}

export function decrypt(encrypted: string, iv: string): string {
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, Buffer.from(iv, "hex"))
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8")
}
