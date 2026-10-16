// Só monta o app: middlewares globais, routers e middleware de erro.
import express from 'express'
import productsRouter from './routes/products.routes.js'
import { readUsers, writeUsers } from "./db.js";
import { findAll, findById, createUser, updateUser, remove } from "./services/users.service.js";
import { valida } from './middlewares/valida.js'
import { userSchema, userBatchSchema } from './schemas/user.schema.js'

const app = express()
app.use(express.json()) // traduz o corpo JSON da requisição
const PORT = 3000

app.use('/products', productsRouter) // tudo que começa com /products vai para o router de products


app.get('/users', async (req, res) => {
  const users =  await readUsers();
  res.json(findAll(users))
})

function nextId(items) {
  return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1
}

app.post('/users', valida(userSchema), async (req, res, next) => {
  try {
    const { nome, email } = req.body

    const users = await readUsers()
    const novo = createUser(users, nome, email)

    await writeUsers(users)
    res.status(201).json(novo)

  } catch (err) {next(err)}
})

app.post('/users/batch', valida(userBatchSchema), async (req, res, next) => {
  try {
    const newUsers = req.body
    const users = await readUsers()

    for (const user of newUsers) {
      if (users.some(u => u.email === user.email)) {
        return res.status(409).json({ erro: 'email já cadastrado' })
      }
    }

    let novoId = nextId(users)
    const novo = newUsers.map(u => ({ id: novoId++, ...u }))
    users.push(...novo)

    await writeUsers(users)
    res.status(201).json(novo)

  } catch (err) {next(err)}
})


app.put('/users/:id', valida(userSchema), async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { nome, email } = req.body

    const users = await readUsers()
    const idx = users.findIndex(u => u.id === id)

    if (idx === -1) {
      return res.status(404).json({erro: 'Usuário não encontrado'})
    }

    users[idx] = { id, nome, email }
    await writeUsers(users)
    res.json(users[idx])

  } catch (err) { next(err) }
})


//Aula 05
{/*
app.delete('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const products = await readProducts()

    //HARD DELETE
    const idx = products.findIndex(u => u.id === id)
    if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' })

    products.splice(idx, 1)              // remove do array
  

  // SOFT DELETE
  const product = products.find(p => p.id === id)
  if (!product) return res.status(404).json({ erro: 'Produto não encontrado' })
  if (product.deletedAt) return res.status(409).json({ erro: 'Já removido' })
  product.deletedAt = new Date().toISOString()  // marca remoção

  await writeProducts(products)
  res.status(204).end() // 204 = sem conteúdo
})
*/}

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


app.use((err, req, res, next) => { res.status(err.status || 500).json({ erro: err.message }) }) // Middleware global de erro: o "plano B" de qualquer next(err)
app.listen(PORT, () => console.log(`Server ta correndo no  http://localhost:${PORT}`),);