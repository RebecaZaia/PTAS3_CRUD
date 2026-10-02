import { usersModel } from '../models/users.model.js'

export async function authenticate(email) {
  const users = await usersModel.findAll() // Procura os usuários usando o model
  const user = users.find(user => user.email === email) // Procura pelo e-mail
  if (!user) return null // Se não encontrou, não autentica
  return user
}

/* O auth.service.js usa as funções do usersModel para buscar os dados dos usuários e verificar se as informações de 
autenticação são válidas. Se trocarmos o JSON por MongoDB, o auth.service.js pode continuar praticamente igual, pois 
ele não acessa diretamente o arquivo ou banco. A mudança ficaria principalmente no usersModel, que passaria a buscar os
usuários no MongoDB em vez de usar readUsers() e writeUsers().
*/