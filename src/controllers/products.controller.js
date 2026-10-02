//controllers/products.controller.js
// Coordena: recebe a requisição, chama o model e monta a resposta HTTP.
import { productsModel } from '../models/products.model.js'

export async function listProducts(req, res, next) {
  try {
    const products = await productsModel.findAll()
    const { min } = req.query
    if (min) {
      products = products.filter(
        product => product.preco >= Number(min)
      )
    }

    res.json(products) // 200 implícito
  
  } catch (err) { next(err) // entrega ao middleware global de erro (aula 07)
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await productsModel.findById(Number(req.params.id))
    if (!product) { return res.status(404).json({ erro: 'não encontrado' }) }
    res.json(product)
  } catch (err) {next(err)}
}

export async function createProduct(req, res, next) {
  try {
    const { nome, preco } = req.body || {}

    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ erro: 'Nome é obrigatório e deve ser uma string' })
    }
    if (!preco || typeof preco !== 'number' || preco <= 0) {
      return res.status(400).json({ erro: 'Preço é obrigatório e deve ser um número positivo' })
    }

    const novo = await productsModel.create({ nome, preco })
    res.status(201).json(novo)
  } catch (err) { next(err) }
}

export async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id)
    const { nome, preco } = req.body || {}

    if (!nome || preco === undefined || preco <= 0) {
      return res.status(400).json({ erro: 'nome e preço são obrigatórios para PUT (substituição completa)'})
    }

    const product = await productsModel.update(id, {nome, preco})

    if (!product) { return res.status(404).json({erro: 'Produto não encontrado'}) }

    res.json(product)

  } catch (err) { next(err) }
}

export async function patchProduct(req, res, next) {
  try {
    const id = Number(req.params.id)
    const { id: _, createdAt: __, updatedAt: ___, ...dadosPermitidos } = req.body || {}

    const product = await productsModel.patch( id, dadosPermitidos )

    if (!product) { return res.status(404).json({ erro: 'Produto não encontrado' }) }

    res.json(product)

  } catch (err) { next(err) }
}

export async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id)
    const result = await productsModel.remove(id)

    if (!result) return res.status(404).json({erro: 'Produto não encontrado'})

    if (result === 'Já removido') return res.status(409).json({erro: 'Já removido'})

    res.status(204).end()

  } catch (err) {next(err)}
}