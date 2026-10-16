import { z } from 'zod'

export const userSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email()
})

export const userBatchSchema = z.array(userSchema)
