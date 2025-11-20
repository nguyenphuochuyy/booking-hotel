import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button, Input, List, Avatar, Typography, Space, Badge, message, Spin } from 'antd'
import {
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  HomeOutlined,
  SearchOutlined,
  HistoryOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ChatBot.css'
import { sendChatMessage, getAllTools, getChatHistoryByUserId } from '../../services/chatbot.service'
import { useAuth } from '../../context/AuthContext'

const { Text } = Typography

function ChatBot() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([]) // Tin nhắn đang hiển thị
  const [allMessages, setAllMessages] = useState([]) // Tất cả tin nhắn từ DB
  const [displayedCount, setDisplayedCount] = useState(20) // Số tin nhắn đã hiển thị
  const [hasMore, setHasMore] = useState(false) // Còn tin nhắn cũ không
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false) // Đang load thêm tin nhắn cũ
  const [historyLoading, setHistoryLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [tools, setTools] = useState([])
  const [showQuickActions, setShowQuickActions] = useState(true) // Hiển thị quick actions khi chưa có tin nhắn
  const listRef = useRef(null)
  const isScrollingUpRef = useRef(false)
  const allMessagesRef = useRef([])
  const displayedCountRef = useRef(20)

  const clearChatState = useCallback(() => {
    setMessages([])
    setAllMessages([])
    allMessagesRef.current = []
    setDisplayedCount(20)
    displayedCountRef.current = 20
    setHasMore(false)
    setSessionId(null)
    setUnread(0)
    setShowQuickActions(true)
    setInput('')
    setLoading(false)
    setLoadingMore(false)
    setHistoryLoading(false)
  }, [])

  // lấy danh sách các tools 
  const fetchTools = useCallback(async () => {
    const tools = await getAllTools()
    if(tools.statusCode === 200) {
      setTools(tools.tools)
    }
    else {
      message.error("Lấy danh sách các công cụ thất bại, vui lòng thử lại sau")
    }
  }, [])
  
  // lấy lịch sử chat của user - chỉ lấy 20 tin nhắn gần nhất ban đầu
  const fetchChatHistory = useCallback(async (userId) => {
    try {
      if (!userId) return
      setHistoryLoading(true)
      
      const chatHistory = await getChatHistoryByUserId({user_id: userId})
      const chatHistoryData = chatHistory.sessions || []
      // Gộp tất cả tin nhắn từ tất cả sessions, sắp xếp theo thời gian
      const allHistoryMessages = []
      chatHistoryData.forEach(session => {
        if (session.chat_history && Array.isArray(session.chat_history)) {
          session.chat_history.forEach(item => {
            // Đảm bảo text là string
            const messageText = typeof item.text === 'string' 
              ? item.text 
              : String(item.text || '')
            
            allHistoryMessages.push({
              role: item.role === 'user' ? 'user' : 'ai',
              text: messageText,
              id: Date.now() + Math.random() // Tạo ID tạm
            })
          })
        }
      })
      
      // Lưu tất cả tin nhắn
      setAllMessages(allHistoryMessages)
      allMessagesRef.current = allHistoryMessages
      
      // Chỉ hiển thị 20 tin nhắn cuối cùng
      const last20Messages = allHistoryMessages.reverse().slice(-20)
      setMessages(last20Messages)
      setDisplayedCount(20)
      displayedCountRef.current = 20
      setHasMore(allHistoryMessages.length > 20)
      
      // Ẩn quick actions nếu đã có lịch sử chat
      if (last20Messages.length > 0) {
        setShowQuickActions(false)
      }
      
      // Lấy session_id mới nhất nếu có
      if (chatHistoryData.length > 0) {
        const latestSession = chatHistoryData[0]
        if (latestSession.session_id) {
          setSessionId(latestSession.session_id)
        }
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }, [])
  
  // Load thêm tin nhắn cũ khi scroll lên
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    // Giả lập delay để UX tốt hơn
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Lấy giá trị hiện tại từ ref
    const prevAll = allMessagesRef.current
    const prevCount = displayedCountRef.current
    const newCount = prevCount + 20
    const startIndex = Math.max(0, prevAll.length - newCount)
    const newMessages = prevAll.slice(startIndex)
    
    // Giữ vị trí scroll trước khi thay đổi
    const scrollHeight = listRef.current?.scrollHeight || 0
    
    // Cập nhật state
    setMessages(newMessages)
    setDisplayedCount(newCount)
    setHasMore(startIndex > 0)
    displayedCountRef.current = newCount
    
    // Giữ vị trí scroll sau khi load thêm
    if (listRef.current && scrollHeight > 0) {
      setTimeout(() => {
        if (listRef.current) {
          const newScrollHeight = listRef.current.scrollHeight
          const heightDiff = newScrollHeight - scrollHeight
          listRef.current.scrollTop = heightDiff
        }
      }, 50)
    }
    
    setLoadingMore(false)
  }, [loadingMore, hasMore])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchChatHistory(user.user_id)
    } else {
      clearChatState()
      try {
        localStorage.removeItem('chatbot_session_id')
      } catch (_err) {}
    }
  }, [isAuthenticated, user?.user_id, fetchChatHistory, clearChatState])

  useEffect(() => {
    if (open) {
      setUnread(0)
      // Scroll xuống cuối khi mở chat
      if (listRef.current) {
        setTimeout(() => {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }, 100)
      }
    }
  }, [open])
  
  // Scroll xuống cuối khi có tin nhắn mới (không phải khi load thêm tin nhắn cũ)
  useEffect(() => {
    if (listRef.current && !isScrollingUpRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
      }, 100)
    }
  }, [messages])
  
  // Xử lý scroll để load thêm tin nhắn cũ
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || loadingMore) return
      
      const { scrollTop } = listRef.current
      
      // Nếu scroll gần đầu (trong vòng 100px) và còn tin nhắn cũ
      if (scrollTop < 100 && hasMore) {
        isScrollingUpRef.current = true
        loadMoreMessages()
      } else if (scrollTop > 100) {
        isScrollingUpRef.current = false
      }
    }
    
    const messagesContainer = listRef.current
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll)
      return () => {
        messagesContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasMore, loadingMore, loadMoreMessages])

  // Kiểm tra xem message có phải là yêu cầu hiển thị quick actions không
  const isQuickActionRequest = (text) => {
    const normalizedText = text.toLowerCase().trim()
    const keywords = [
      'lựa chọn nhanh',
      'lua chon nhanh',
      'quick action',
      'quick actions',
      'tùy chọn',
      'tuy chon',
      'menu',
      'hiển thị menu',
      'hien thi menu',
      'xem menu',
      'xem tùy chọn',
      'xem tuy chon'
    ]
    return keywords.some(keyword => normalizedText.includes(keyword))
  }

  const handleSend = async (textToSend = null) => {
    // Đảm bảo text là string, không phải event object
    let text = ''
    if (textToSend) {
      text = typeof textToSend === 'string' ? textToSend.trim() : String(textToSend).trim()
    } else {
      text = input.trim()
    }
    
    if (!text || loading) return
    
    // Đảm bảo text là string trước khi gửi
    const cleanText = String(text)
    
    // Kiểm tra nếu là yêu cầu hiển thị quick actions
    if (isQuickActionRequest(cleanText)) {
      // Thêm tin nhắn user vào lịch sử
      const userMsg = { role: 'user', text: cleanText, id: Date.now() }
      setMessages((prev) => [...prev, userMsg])
      setAllMessages((prev) => {
        const updated = [...prev, userMsg]
        allMessagesRef.current = updated
        return updated
      })
      // Thêm tin nhắn bot với quick actions như một message đặc biệt
      const botMsg = { 
        role: 'ai', 
        text: 'Đây là các lựa chọn nhanh bạn có thể sử dụng:', 
        type: 'quick_actions', // Đánh dấu là quick actions message
        id: Date.now() + 1 
      }
      setMessages((prev) => [...prev, botMsg])
      setAllMessages((prev) => {
        const updated = [...prev, botMsg]
        allMessagesRef.current = updated
        return updated
      })
      setInput('')
      // Scroll xuống cuối
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
      }, 100)
      return
    }
    
    const userMsg = { role: 'user', text: cleanText, id: Date.now() }
    
    // Ẩn quick actions khi có tin nhắn
    setShowQuickActions(false)
    
    // Thêm vào messages hiển thị và allMessages
    setMessages((prev) => [...prev, userMsg])
    setAllMessages((prev) => {
      const updated = [...prev, userMsg]
      allMessagesRef.current = updated
      return updated
    })
    setInput('')
    setLoading(true)
    isScrollingUpRef.current = false // Đảm bảo scroll xuống khi có tin nhắn mới

    try {
     const response = await sendChatMessage({message: cleanText, session_id: sessionId})
     if(response.statusCode === 200){
      // Đảm bảo aiText là string
      const aiText = typeof response.response === 'string' 
        ? response.response 
        : String(response.response || 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn.')
      const aiMsg = { role: 'ai', text: aiText, id: Date.now() + 1 }
      // Thêm vào messages hiển thị và allMessages
      setMessages((prev) => [...prev, aiMsg])
      setAllMessages((prev) => {
        const updated = [...prev, aiMsg]
        allMessagesRef.current = updated
        return updated
      })
      
      // Cập nhật session_id nếu có
      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id)
        try {
          localStorage.setItem('chatbot_session_id', response.session_id)
        } catch (_err) {}
      }
     }
    } catch (e) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại sau")
    } finally {
      setLoading(false)
    }
  }
  
  // Xử lý quick actions
  const handleQuickAction = (action) => {
    let messageText = ''
    switch(action) {
      case 'list_rooms':
        messageText = 'Hãy cho tôi xem danh sách các phòng có sẵn'
        break
      case 'search_rooms':
        messageText = 'Tôi muốn tìm kiếm phòng theo nhu cầu của tôi'
        break
      case 'booking_history':
        messageText = 'Hãy cho tôi xem lịch sử đặt phòng của tôi'
        break
      case 'booking_detail':
        messageText = 'Tôi muốn xem chi tiết một đặt phòng cụ thể'
        break
      case 'create_booking':
        messageText = 'Tôi muốn tạo một đặt phòng mới'
        break
      case 'cancel_booking':
        messageText = 'Tôi muốn hủy một đặt phòng của tôi'
        break
      default:
        return
    }
    handleSend(messageText)
  }

  const trigger = (
    <Badge count={unread} offset={[-6, 6]}>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        className="chatbot-fab"
        onClick={() => setOpen((v) => !v)}
      />
    </Badge>
  )

  return (
    <>
      {trigger}
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <Space>
              <RobotOutlined />
              <Text strong>Chat</Text>
            </Space>
            <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
          </div>
          <div className="chatbot-container">
            <div className="chatbot-messages" ref={listRef}>
              {historyLoading ? (
                <div className="chatbot-history-loading">
                  <Spin tip="Đang tải hội thoại..." />
                </div>
              ) : (
                <>
                  {loadingMore && (
                    <div className="chatbot-loading-more">
                      <Spin size="small" /> <span>Đang tải thêm tin nhắn...</span>
                    </div>
                  )}
                  
                  {/* Quick Actions - Hiển thị khi chưa có tin nhắn */}
                  {showQuickActions && messages.length === 0 && (
                    <div className="quick-actions-container">
                      <Text type="secondary" style={{ display: 'block', marginBottom: '12px', fontSize: '13px' }}>
                        Chọn một trong các tùy chọn sau:
                      </Text>
                      <div className="quick-actions-grid">
                        <Button 
                          type="default" 
                          icon={<HomeOutlined />} 
                          className="quick-action-btn"
                          onClick={() => handleQuickAction('list_rooms')}
                        >
                          Danh sách phòng
                        </Button>
                        <Button 
                          type="default" 
                          icon={<SearchOutlined />} 
                          className="quick-action-btn"
                          onClick={() => handleQuickAction('search_rooms')}
                        >
                          Tìm kiếm phòng
                        </Button>
                        {isAuthenticated && (
                          <>
                            <Button 
                              type="default" 
                              icon={<HistoryOutlined />} 
                              className="quick-action-btn"
                              onClick={() => handleQuickAction('booking_history')}
                            >
                              Lịch sử đặt phòng
                            </Button>
                            <Button 
                              type="default" 
                              icon={<FileTextOutlined />} 
                              className="quick-action-btn"
                              onClick={() => handleQuickAction('booking_detail')}
                            >
                              Chi tiết đặt phòng
                            </Button>
                            <Button 
                              type="default" 
                              icon={<PlusOutlined />} 
                              className="quick-action-btn"
                              onClick={() => handleQuickAction('create_booking')}
                            >
                              Tạo đặt phòng
                            </Button>
                            <Button 
                              type="default" 
                              icon={<DeleteOutlined />} 
                              className="quick-action-btn"
                              onClick={() => handleQuickAction('cancel_booking')}
                            >
                              Hủy đặt phòng
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <List
                    dataSource={messages}
                    renderItem={(item) => {
                  // Đảm bảo text luôn là string
                  const messageText = typeof item.text === 'string' ? item.text : String(item.text || '')
                  
                  // Nếu là quick actions message, render quick actions như tin nhắn bot
                  if (item.type === 'quick_actions') {
                    return (
                      <List.Item className="msg-bot">
                        <div className="message-wrapper bot-message">
                          <Avatar icon={<RobotOutlined />} className="message-avatar" />
                          <div className="message-content bot-content quick-actions-message">
                            <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>BeanBot</Text>
                            <Text style={{ display: 'block', marginBottom: '12px', fontSize: '13px' }}>{messageText}</Text>
                            <div className="quick-actions-grid-inline">
                              <Button 
                                type="default" 
                                size="small"
                                icon={<HomeOutlined />} 
                                className="quick-action-btn-inline"
                                onClick={() => handleQuickAction('list_rooms')}
                              >
                                Danh sách phòng
                              </Button>
                              <Button 
                                type="default" 
                                size="small"
                                icon={<SearchOutlined />} 
                                className="quick-action-btn-inline"
                                onClick={() => handleQuickAction('search_rooms')}
                              >
                                Tìm kiếm phòng
                              </Button>
                              {isAuthenticated && (
                                <>
                                  <Button 
                                    type="default" 
                                    size="small"
                                    icon={<HistoryOutlined />} 
                                    className="quick-action-btn-inline"
                                    onClick={() => handleQuickAction('booking_history')}
                                  >
                                    Lịch sử đặt phòng
                                  </Button>
                                  <Button 
                                    type="default" 
                                    size="small"
                                    icon={<FileTextOutlined />} 
                                    className="quick-action-btn-inline"
                                    onClick={() => handleQuickAction('booking_detail')}
                                  >
                                    Chi tiết đặt phòng
                                  </Button>
                                  <Button 
                                    type="default" 
                                    size="small"
                                    icon={<PlusOutlined />} 
                                    className="quick-action-btn-inline"
                                    onClick={() => handleQuickAction('create_booking')}
                                  >
                                    Tạo đặt phòng
                                  </Button>
                                  <Button 
                                    type="default" 
                                    size="small"
                                    icon={<DeleteOutlined />} 
                                    className="quick-action-btn-inline"
                                    onClick={() => handleQuickAction('cancel_booking')}
                                  >
                                    Hủy đặt phòng
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )
                  }
                  
                  return (
                    <List.Item className={item.role === 'user' ? 'msg-user' : 'msg-bot'}>
                      {item.role === 'user' ? (
                        <div className="message-wrapper user-message">
                          <div className="message-content user-content">
                            <Text>{messageText}</Text>
                          </div>
                          <Avatar icon={<UserOutlined />} className="message-avatar" />
                        </div>
                      ) : (
                        <div className="message-wrapper bot-message">
                          <Avatar icon={<RobotOutlined />} className="message-avatar" />
                          <div className="message-content bot-content">
                            <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>BeanBot</Text>
                            <div className="chatbot-markdown">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {messageText}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </List.Item>
                  )
                }}
              />
              {loading && (
                <List.Item className="msg-bot">
                  <div className="message-wrapper bot-message">
                    <Avatar icon={<RobotOutlined />} className="message-avatar" />
                    <div className="message-content bot-content typing-indicator">
                      <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>BeanBot</Text>
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
                </>
              )}
            </div>
            <div className="chatbot-input">
              <Input
                placeholder="Gõ 'menu' để xem các tùy chọn"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                disabled={loading}
                maxLength={500}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                loading={loading}
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot


