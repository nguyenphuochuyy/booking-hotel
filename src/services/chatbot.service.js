import http from './httpClient'

export async function sendChatMessage({ message, history = [], session_id = null }) {
  try {
    const data = await http.post('/chat', { message })
    return data
  } catch (err) {
    console.error('sendChatMessage error:', err)
    throw err
  }
}

export async function getAllTools() {
  try {
    const data = await http.get('/chat/tools')
    return data
  } catch (err) {
    console.error('getAllTools error:', err)
    throw err
  }
}
export async function getChatHistoryByUserId({user_id}) {
  try {
    const data = await http.get(`/chat/sessions/by-user/${user_id}`)
    return data
  } catch (err) {
    console.error('getChatHistory error:', err)
    throw err
  }
}


