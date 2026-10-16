import { z } from 'zod'

export function valida(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        erro: z.flattenError(result.error).fieldErrors
      })
    }

    req.body = result.data
    next()
  }
}
