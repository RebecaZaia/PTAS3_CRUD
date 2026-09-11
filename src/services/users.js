export function findAll(users) {
  return users.filter(user => !user.deletedAt)
}

export function findById(users, id) {
  return users.find(user => user.id === id)
}

export function create(users, nome, email) {
  const novoId = users.length ? Math.max(...users.map(user => user.id)) + 1 : 1
  const novoUser = { id: novoId, nome, email }
  users.push(novoUser)
  return novoUser
}

export function update(users, id, nome, email) {
  const index = users.findIndex(user => user.id === id)
  if (index === -1) return null
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