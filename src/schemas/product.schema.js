import { z } from 'zod'

export const productSchema = z.object({
  nome: z.string().min(1),
  preco: z.number().positive()
})