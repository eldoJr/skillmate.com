import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { sendVerificationEmail, sendPasswordResetEmail } from './email.js'

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

export const emailQueue = new Queue('email', { connection })

new Worker('email', async job => {
  if (job.name === 'verification') {
    await sendVerificationEmail(job.data.to, job.data.firstName, job.data.token)
  } else if (job.name === 'reset') {
    await sendPasswordResetEmail(job.data.to, job.data.firstName, job.data.token)
  }
}, { connection })

export function queueVerificationEmail(to: string, firstName: string, token: string) {
  emailQueue.add('verification', { to, firstName, token }, { attempts: 3, backoff: { type: 'fixed', delay: 60000 } })
}

export function queuePasswordResetEmail(to: string, firstName: string, token: string) {
  emailQueue.add('reset', { to, firstName, token }, { attempts: 3, backoff: { type: 'fixed', delay: 60000 } })
}
