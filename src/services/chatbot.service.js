import http from './httpClient'

export async function sendChatMessage({ message, history = [], session_id = null }) {
  try {
    const payload = { message }
    // Chỉ thêm history và session_id nếu có
    if (history && history.length > 0) {
      payload.history = history
    }
    if (session_id) {
      payload.session_id = session_id
    }
    const data = await http.post('/chat', payload)
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


