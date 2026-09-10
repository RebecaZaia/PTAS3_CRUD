import express from 'express';
import { readUsers } from "./db.js";
import { readProducts } from "./db.js";
import { writeProducts } from "./db.js";
import { writeUsers } from "./db.js";

const app = express()
app.use(express.json())
const PORT = 3000

app.get('/products', async (req, res) => {
  let products =  await readProducts();

  const { min } = req.query;
  if (min) {
    products = products.filter((p) => p.preco >= Number(min));
  }

  res.json(products);
})

app.get('/products/:id', async (req, res) => {
    const products =  await readProducts();
    const product = products.find(p => p.id === Number(req.params.id))
    
    if (!product) return res.status(404).json({erro: "Produto não encontrado"});
    res.json(product);
})

app.post('/products', async (req, res) => {
  const { nome, preco } = req.body || {}

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ erro: 'Nome é obrigatório e deve ser uma string' })
  }
  if (!preco || typeof preco !== 'number' || preco <= 0) {
    return res.status(400).json({ erro: 'Preço é obrigatório e deve ser um número positivo' })
  }

  const products = await readProducts()
  const novoId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1
  const novo = { id: novoId, nome, preco }
  products.push(novo)
  await writeProducts(products)
  res.status(201).json(novo)
})


app.get('/users', async (req, res) => {
  const users =  await readUsers();
  res.json(users.filter(u => !u.deletedAt))   // só ativos
  //res.json(users);
})

app.post('/users', async (req, res) => {
  const { nome, email } = req.body || {}

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ erro: 'nome é obrigatório' })
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ erro: 'email inválido' })
  }

  const users = await readUsers()

  //5
  if (users.some(u => u.email === email)){
    return res.status(409).json({ erro: 'email já cadastrado' })
  }

  const novoId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1
  const novo = { id: novoId, nome, email }
  users.push(novo)
  await writeUsers(users)
  res.status(201).json(novo)
})

//6
app.post('/users/batch', async (req, res) => {
  const newUsers = req.body || []

  const users = await readUsers()
  for (const user of newUsers) {
    if (!user.nome || typeof user.nome !== 'string') {
      return res.status(400).json({ erro: 'nome é obrigatório' })
    }
    if (!user.email || !user.email.includes('@')) {
      return res.status(400).json({ erro: 'email inválido' })
    }
    if (users.some(u => u.email === user.email)){
      return res.status(409).json({ erro: 'email já cadastrado' })
    }
  }

  let novoId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1
  const novo = newUsers.map(u => ({ id: novoId++, ...u }))
  users.push(...novo)

  await writeUsers(users)
  res.status(201).json(novo)
})


//Aula 04
app.put('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { nome, preco } = req.body || {}

  if (!nome || preco === undefined || preco <= 0) {
    return res.status(400).json({ 
      erro: 'nome e preço são obrigatórios para PUT (substituição completa)' 
    })
  }

  const products = await readProducts()
  const idx = products.findIndex(u => u.id === id)
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' })

  products[idx] = { id, nome, preco }

  await writeProducts(products)
  res.json(products[idx])  // 200 OK
})

app.patch('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const products = await readProducts()
  const product = products.find(u => u.id === id)
  if (!product) return res.status(404).json({ erro: 'Produto não encontrado' })

  const { id: _, createdAt: __, updatedAt: ___, ...dadosPermitidos } = req.body || {}
  Object.assign(product, dadosPermitidos)

  product.updatedAt = new Date().toISOString()
  
  await writeProducts(products)
  res.json(product)  // 200 OK com recurso mesclado
})

//Aula 05
app.delete('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const products = await readProducts()

  {/*
    HARD DELETE
    const idx = products.findIndex(u => u.id === id)
    if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' })

    products.splice(idx, 1)              // remove do array
  */}

  // SOFT DELETE
  const product = products.find(p => p.id === id)
  if (!product) return res.status(404).json({ erro: 'Produto não encontrado' })
  if (product.deletedAt) return res.status(409).json({ erro: 'Já removido' })
  product.deletedAt = new Date().toISOString()  // marca remoção

  await writeProducts(products)
  res.status(204).end() // 204 = sem conteúdo
})


app.delete('/users/:id', async (req, res) => {
  const id = Number(req.params.id)
  const force = req.query.force === 'true'
  const users = await readUsers()
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' })

  if (force) {
    const idx = users.findIndex(u => u.id === id)
    users.splice(idx, 1)
    await writeUsers(users)
    return res.status(204).end()
  }
  
  if (user.deletedAt) return res.status(409).json({ erro: 'Já removido' })

  user.deletedAt = new Date().toISOString()  // marca remoção
  await writeUsers(users)
  res.status(204).end()
})

{/* app.patch('/users/:id/restore', async (req, res) => {
  const id = Number(req.params.id)
  const users = await readUsers()

  const user = users.find(u => u.id === id)

  if (!user) return res.status(404).json({ erro: 'Não encontrado' })

  user.deletedAt = null

  await writeUsers(users)

  res.json(user)
})*/}

app.listen(PORT, () => console.log(`Server ta correndo no  http://localhost:${PORT}`),);