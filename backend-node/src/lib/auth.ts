import 'dotenv/config'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const ACCESS_EXP  = `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES  ?? 30}m`
const REFRESH_EXP = `${(Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS ?? 30)) * 24 * 60}m`

export const hashPassword   = (p: string) => bcrypt.hash(p, 12)
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h)

export async function signToken(sub: string, type: 'access' | 'refresh') {
  return new SignJWT({ sub, type })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(type === 'access' ? ACCESS_EXP : REFRESH_EXP)
    .sign(secret)
}

export async function verifyToken(token: string, type: 'access' | 'refresh') {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== type) return null
    return payload.sub as string
  } catch {
    return null
  }
}

export function generateToken() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
}

export function tokenExpiry(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}
