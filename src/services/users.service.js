//services/users.service.js
export function findAll(users) { return users.filter(user => !user.deletedAt) }

export function findById(users, id) { return users.find(user => user.id === id) }

function nextId(items) { return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1}

export function createUser(users, nome, email) {
  if (users.some(user => user.email === email)) {
    const erro = new Error('email já cadastrado')
    erro.status = 409
    throw erro
  }
  
  const novoUser = { id: nextId(users), nome, email}
  users.push(novoUser)
  return novoUser
}

export function updateUser(users, id, nome, email) {
  const index = users.findIndex(user => user.id === id)
  
  if (index === -1) {
    const erro = new Error('Usuário não encontrado')
    erro.status = 404
    throw erro
  }

  users[index] = {id, nome, email}
  return users[index]
}

export function remove(users, id, force = false) {
  const user = users.find(user => user.id === id)

  if (!user) { return null }
  if (force) {
    const index = users.findIndex(user => user.id === id)
    users.splice(index, 1)
    return user
  }
  if (user.deletedAt) { return 'Já removido'}

  user.deletedAt = new Date().toISOString()
  return user
}