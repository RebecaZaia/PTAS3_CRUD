//routes/products.routes.js
// Só o mapa: URL + método HTTP → função do controller.
import { Router } from 'express'
import { listProducts, getProduct, createProduct, updateProduct, patchProduct, deleteProduct } from '../controllers/products.controller.js'
import { valida } from '../middlewares/valida.js'
import { productSchema } from '../schemas/product.schema.js'

const router = Router()

router.get('/', listProducts)
router.get('/:id', getProduct)
router.post('/', valida(productSchema), createProduct)
router.put('/:id', valida(productSchema), updateProduct)
router.patch('/:id', patchProduct)
router.delete('/:id', deleteProduct)

export default router