//models/products.model.js
// Único arquivo que "sabe" que os produtos moram em um arquivo JSON.
import { readProducts, writeProducts } from '../db.js'

export const productsModel = {
  async nextId(items) {return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1},

  // Devolve apenas produtos ativos (não removidos via soft delete)
  async findAll() { return (await readProducts()).filter(p => !p.deletedAt) },

  // Busca um produtos pelo id; devolve null se não existir
  async findById(id) {
    const product = (await readProducts()).find(x => x.id === id && !x.deletedAt)
    return product || null
  },

  // Cria um produto novo, gerando o id como "maior id atual + 1"
  async create(data) {
    const products = await readProducts()
    const id = this.nextId(products)
    const novo = { id, ...data }
    products.push(novo)
    await writeProducts(products)
    return novo
  },

  async update(id, data) {
    const products = await readProducts()

    const index = products.findIndex( product => product.id === id && !product.deletedAt )
    if (index === -1) return null

    products[index] = { id, ...data }
    await writeProducts(products)
    return products[index]
  },

  // Atualiza parcialmente um produto
  async patch(id, data) {
    const products = await readProducts()

    const product = products.find(product => product.id === id && !product.deletedAt)
    if (!product) return null

    Object.assign(product, data)
    product.updatedAt = new Date().toISOString()
    await writeProducts(products)
    return product
  },

  // Soft delete
  async remove(id) {
    const products = await readProducts()

    const product = products.find(product => product.id === id)
    if (!product) return null
    if (product.deletedAt) return 'Já removido'

    product.deletedAt = new Date().toISOString()
    await writeProducts(products)
    return product
  }
}