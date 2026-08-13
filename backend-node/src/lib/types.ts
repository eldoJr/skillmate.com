import type { users } from '../db/schema.js'

export type UserRow = typeof users.$inferSelect

export type AppEnv = {
  Variables: {
    user: UserRow
  }
}
