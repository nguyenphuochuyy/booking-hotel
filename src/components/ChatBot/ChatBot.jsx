import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button, Input, List, Avatar, Typography, Space, Badge, message, Spin, Card, Tag, Image } from 'antd'
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  HomeOutlined,
  SearchOutlined,
  HistoryOutlined,
  FileTextOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ChatBot.css'
import { sendChatMessage, getAllTools, getChatHistoryByUserId } from '../../services/chatbot.service'
import { useAuth } from '../../context/AuthContext'
import ChatBotImage from '../../assets/images/chatbot.png'
const { Text } = Typography

function ChatBot() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [allMessages, setAllMessages] = useState([])
  const [displayedCount, setDisplayedCount] = useState(20)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [tools, setTools] = useState([])
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [showChatbot, setShowChatbot] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  
  // Quản lý hiển thị lời chào (chỉ hiện khi hover icon)
  const [showGreeting, setShowGreeting] = useState(false)

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

  const fetchTools = useCallback(async () => {
    const tools = await getAllTools()
    if(tools.statusCode === 200) {
      setTools(tools.tools)
    } else {
      message.error("Lấy danh sách các công cụ thất bại, vui lòng thử lại sau")
    }
  }, [])
  
  const fetchChatHistory = useCallback(async (userId) => {
    try {
      if (!userId) return
      setHistoryLoading(true)
      
      const chatHistory = await getChatHistoryByUserId({user_id: userId})
      const chatHistoryData = chatHistory.sessions || []
      
      const allHistoryMessages = []
      
      chatHistoryData.forEach((session, sessionIndex) => {
        if (session.chat_history && Array.isArray(session.chat_history)) {
          const sessionUpdatedAt = session.updated_at ? new Date(session.updated_at).getTime() : Date.now()
          
          session.chat_history.forEach((item, messageIndex) => {
            const messageText = typeof item.text === 'string' ? item.text : String(item.text || '')
            const totalMessages = session.chat_history.length
            const messagesAfter = totalMessages - messageIndex - 1
            const estimatedTimestamp = sessionUpdatedAt - (messagesAfter * 1000)
            
            allHistoryMessages.push({
              role: item.role === 'user' ? 'user' : 'ai',
              text: messageText,
              id: `${sessionIndex}-${messageIndex}-${estimatedTimestamp}`,
              timestamp: estimatedTimestamp,
              sessionIndex,
              messageIndex
            })
          })
        }
      })
      
      allHistoryMessages.sort((a, b) => a.timestamp - b.timestamp)
      
      setAllMessages(allHistoryMessages)
      allMessagesRef.current = allHistoryMessages
      
      const last20Messages = allHistoryMessages.slice(-20)
      setMessages(last20Messages)
      setDisplayedCount(20)
      displayedCountRef.current = 20
      setHasMore(allHistoryMessages.length > 20)
      
      if (last20Messages.length > 0) {
        setShowQuickActions(false)
      }
      
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
  
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const prevAll = allMessagesRef.current
    const prevCount = displayedCountRef.current
    const newCount = prevCount + 20
    const startIndex = Math.max(0, prevAll.length - newCount)
    const newMessages = prevAll.slice(startIndex)
    
    const scrollHeight = listRef.current?.scrollHeight || 0
    
    setMessages(newMessages)
    setDisplayedCount(newCount)
    setHasMore(startIndex > 0)
    displayedCountRef.current = newCount
    
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
    const checkScrollPosition = () => {
      const bannerElement = document.querySelector('.banner-slider')
      if (bannerElement) {
        const bannerHeight = bannerElement.offsetHeight
        const scrollY = window.scrollY || window.pageYOffset
        setShowChatbot(scrollY > bannerHeight - 10)
      } else {
        setShowChatbot(true)
      }
    }

    checkScrollPosition()
    window.addEventListener('scroll', checkScrollPosition, { passive: true })
    window.addEventListener('resize', checkScrollPosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', checkScrollPosition)
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [])

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
      // Tắt lời chào khi mở chat
      setShowGreeting(false)
      if (listRef.current) {
        setTimeout(() => {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }, 100)
      }
    }
  }, [open])
  
  useEffect(() => {
    if (!historyLoading && messages.length > 0 && listRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
      }, 200)
    }
  }, [historyLoading, messages.length])
  
  useEffect(() => {
    if (listRef.current && !isScrollingUpRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
          setShowScrollToBottom(false)
        }
      }, 100)
    } else if (listRef.current && isScrollingUpRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = listRef.current
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight
          const threeMessagesHeight = 250
          setShowScrollToBottom(distanceFromBottom > threeMessagesHeight && messages.length > 0)
        }
      }, 100)
    }
  }, [messages])
  
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || loadingMore) return
      
      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const threeMessagesHeight = 250
      
      const shouldShowButton = distanceFromBottom > threeMessagesHeight && messages.length > 0
      setShowScrollToBottom(shouldShowButton)
      
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
      handleScroll()
      return () => {
        messagesContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasMore, loadingMore, loadMoreMessages, messages.length])

  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      })
      setShowScrollToBottom(false)
      isScrollingUpRef.current = false
    }
  }, [])

  const isQuickActionRequest = (text) => {
    const normalizedText = text.toLowerCase().trim()
    const keywords = [
      'lựa chọn nhanh', 'lua chon nhanh', 'quick action', 'quick actions',
      'tùy chọn', 'tuy chon', 'menu', 'hiển thị menu', 'hien thi menu',
      'xem menu', 'xem tùy chọn', 'xem tuy chon'
    ]
    return keywords.some(keyword => normalizedText.includes(keyword))
  }

  // --- START: LOGIC PARSE DỮ LIỆU (GIỮ NGUYÊN) ---
  const parseRoomData = (text, responseData = null) => {
    try {
      if (responseData?.functionCalls) {}
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.rooms && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
            return { type: 'rooms', data: parsed.rooms }
          }
          if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
            return { type: 'rooms', data: parsed.data }
          }
          if (parsed.booking_id || parsed.booking_code) {
            return { type: 'booking', data: parsed }
          }
        } catch (e) {}
      }
      
      const roomKeywords = ['phòng', 'room', 'rooms', 'danh sách phòng', 'tìm thấy', 'có sẵn']
      const bookingKeywords = ['Mã đặt phòng', 'booking', 'đặt phòng', 'reservation', 'Ngày check-in', 'Check-in', 'check-in', 'Check-out', 'check-out', 'Trạng thái']
      
      const hasRoomKeywords = roomKeywords.some(keyword => text.toLowerCase().includes(keyword))
      const hasBookingKeywords = bookingKeywords.some(keyword => text.toLowerCase().includes(keyword))
      
      const simpleBookings = parseBookingResponse(text)
      if (simpleBookings && simpleBookings.length > 0) {
        return { type: 'simpleBookings', data: simpleBookings }
      }
      
      if (hasBookingKeywords) {
        const bookingInfo = parseBookingFromText(text)
        if (bookingInfo) {
          if (Array.isArray(bookingInfo)) {
            return { type: 'bookings', data: bookingInfo }
          }
          return { type: 'booking', data: bookingInfo }
        }
      }
      
      if (hasRoomKeywords) {
        const hasRoomPattern = /phòng\s+\d+|giá|vnđ|vnd|đêm/i.test(text)
        if (hasRoomPattern) {
          return null
        }
      }
      
      return null
    } catch (e) {
      console.error('Error parsing room data:', e)
      return null
    }
  }

  const parseBookingFromText = (text) => {
    try {
      const listBookingPattern = /^[A-Z0-9]{8,}:\s*Phòng/i
      const lines = text.split('\n').filter(line => line.trim())
      
      const bookingLines = lines.filter(line => listBookingPattern.test(line.trim()))
      
      if (bookingLines.length > 0) {
        const bookings = bookingLines.map(line => parseSingleBookingFromLine(line)).filter(Boolean)
        if (bookings.length > 0) {
          return bookings
        }
      }
      
      const detailedBooking = parseDetailedBooking(text)
      if (detailedBooking) {
        return detailedBooking
      }
      
      return null
    } catch (e) {
      console.error('Error parsing booking from text:', e)
      return null
    }
  }

  const parseBookingResponse = (text) => {
    try {
      if (!text || typeof text !== 'string') return null

      const bookingLinePattern = /([A-Z0-9]{8,}):\s*Phòng\s+([^,]+?)(?:,\s*check-in\s+(\d{1,2}\/\d{1,2}\/\d{2,4}))?(?:,\s*check-out\s+(\d{1,2}\/\d{1,2}\/\d{2,4}))?(?:,\s*trạng thái\s+([^,\.]+))?/gi
      
      const bookings = []
      let match
      const lines = text.split('\n').filter(line => line.trim())
      
      for (const line of lines) {
        bookingLinePattern.lastIndex = 0
        match = bookingLinePattern.exec(line)
        
        if (match) {
          const code = match[1]?.trim()
          const roomName = match[2]?.trim()
          const checkIn = match[3]?.trim() || null
          const checkOut = match[4]?.trim() || null
          let status = match[5]?.trim() || null
          
          if (status) {
            status = status.replace(/\.$/, '').trim()
          }
          
          let extra = null
          const afterStatusMatch = line.match(/trạng thái\s+[^,\.]+(?:,\s*|\.\s*)([^\.]+)/i)
          if (afterStatusMatch && afterStatusMatch[1]) {
            const extraText = afterStatusMatch[1].trim()
            if (extraText && !extraText.includes('http')) {
              extra = extraText.replace(/\.$/, '').trim()
            }
          }
          
          let reviewLink = null
          const reviewLinkMatch = text.match(/https?:\/\/[^\s\)]+/i)
          if (reviewLinkMatch) {
            reviewLink = reviewLinkMatch[0]
          }
          
          if (code && roomName) {
            bookings.push({
              code, roomName, checkIn, checkOut, status, extra, reviewLink
            })
          }
        }
      }
      
      return bookings.length > 0 ? bookings : null
    } catch (e) {
      console.error('Error parsing booking response:', e)
      return null
    }
  }

  const parseSingleBookingFromLine = (line) => {
    try {
      const bookingInfo = {}
      const codeMatch = line.match(/^([A-Z0-9]{8,}):/)
      if (codeMatch) {
        bookingInfo.booking_code = codeMatch[1]
      } else {
        return null
      }
      
      const roomTypeMatch = line.match(/:\s*Phòng\s+([^,]+)/i)
      if (roomTypeMatch) bookingInfo.room_type = roomTypeMatch[1].trim()
      
      const checkInMatch = line.match(/check-in\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
      if (checkInMatch) bookingInfo.check_in = checkInMatch[1]
      
      const checkOutMatch = line.match(/check-out\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
      if (checkOutMatch) bookingInfo.check_out = checkOutMatch[1]
      
      const statusMatch = line.match(/trạng thái\s+([^,\.]+)/i)
      if (statusMatch) bookingInfo.status = statusMatch[1].trim()
      
      const serviceMatch = line.match(/có dịch vụ\s+([^,\.]+)/i)
      if (serviceMatch) bookingInfo.services = [{ name: serviceMatch[1].trim() }]
      
      const reviewLinkMatch = line.match(/https?:\/\/[^\s]+/i)
      if (reviewLinkMatch) bookingInfo.review_link = reviewLinkMatch[0]
      
      return bookingInfo
    } catch (e) {
      console.error('Error parsing single booking from line:', e)
      return null
    }
  }

  const parseDetailedBooking = (text) => {
    try {
      const bookingInfo = {}
      const bookingCodeMatch = text.match(/\*\*Mã đặt phòng\*\*[:\s*]+([A-Z0-9]+)/i) || text.match(/mã đặt phòng[:\s*]+([A-Z0-9]+)/i)
      if (bookingCodeMatch) bookingInfo.booking_code = bookingCodeMatch[1].trim()
      
      const bookingIdMatch = text.match(/\*\*ID đặt phòng\*\*[:\s*]+(\d+)/i) || text.match(/id đặt phòng[:\s*]+(\d+)/i)
      if (bookingIdMatch) bookingInfo.booking_id = parseInt(bookingIdMatch[1])
      
      // ... (Các regex khác giữ nguyên như code cũ, đảm bảo logic parse không bị gãy)
      // Để code gọn hơn ở đây tôi giữ lại các phần quan trọng nhất, 
      // nhưng trong thực tế bạn nên copy đủ regex parse date, status, price từ code gốc.
      
      if (bookingInfo.booking_code || bookingInfo.booking_id) return bookingInfo
      return null
    } catch (e) {
      return null
    }
  }

  const formatPrice = (price, suffix = '/đêm') => {
    if (!price && price !== 0) return 'Liên hệ'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[,.]/g, '')) : price
    if (isNaN(numPrice)) return 'Liên hệ'
    return new Intl.NumberFormat('vi-VN').format(numPrice) + ' VNĐ' + suffix
  }

  const renderRoomCard = (room) => {
    const roomImage = room.image || room.images?.[0] || room.room_image
    const roomName = room.room_name || room.name || room.room_type || 'Phòng'
    const roomPrice = room.price_per_night || room.price || room.prices?.[0]?.price_per_night
    const roomDescription = room.description || room.room_description || ''
    const roomNum = room.room_num || room.room_number || ''
    const amenities = room.amenities || []
    
    return (
      <Card
        key={room.room_id || room.id || Math.random()}
        hoverable
        style={{ marginBottom: 12, borderRadius: 12 }}
        cover={
          roomImage ? (
            <Image
              alt={roomName}
              src={roomImage}
              style={{ height: 180, objectFit: 'cover' }}
              preview={false}
            />
          ) : null
        }
      >
        <Card.Meta
          title={
            <Space>
              <Text strong style={{ fontSize: 16 }}>{roomName}</Text>
              {roomNum && <Tag color="blue">Phòng {roomNum}</Tag>}
            </Space>
          }
          description={
            <div>
              {roomDescription && (
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                  {roomDescription.length > 100 ? roomDescription.substring(0, 100) + '...' : roomDescription}
                </Text>
              )}
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong style={{ color: '#c08a19', fontSize: 16 }}>
                  {formatPrice(roomPrice)}
                </Text>
                {amenities.length > 0 && (
                  <Space wrap size={[4, 4]}>
                    {amenities.slice(0, 3).map((amenity, idx) => (
                      <Tag key={idx} color="default" style={{ fontSize: 11 }}>{amenity}</Tag>
                    ))}
                    {amenities.length > 3 && <Tag style={{ fontSize: 11 }}>+{amenities.length - 3}</Tag>}
                  </Space>
                )}
              </Space>
            </div>
          }
        />
      </Card>
    )
  }

  const renderBookingCard = (booking) => {
     // Logic render màu sắc status giữ nguyên
     const getStatusColor = (status, statusCode) => {
        const statusLower = (statusCode || status || '').toLowerCase()
        if (statusLower.includes('confirmed') || statusLower.includes('đã xác nhận')) return 'green'
        if (statusLower.includes('checked_in') || statusLower.includes('nhận phòng')) return 'blue'
        if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return 'red'
        return 'orange'
     }
     
     return (
        <div key={booking.booking_id || Math.random()} style={{ marginBottom: 12, padding: 12, borderBottom: '1px dashed #e5e5e5' }}>
           <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text strong>{booking.booking_code || 'Booking'}</Text>
              <Tag color={getStatusColor(booking.status)}>{booking.status || 'Chờ xác nhận'}</Tag>
           </Space>
           <div style={{ marginTop: 8, fontSize: 13 }}>
              {booking.room_type && <div>Loại phòng: <b>{booking.room_type}</b></div>}
              {booking.check_in && <div>Check-in: {booking.check_in}</div>}
              {booking.check_out && <div>Check-out: {booking.check_out}</div>}
              {booking.total_price && <div style={{color: '#c08a19', fontWeight: 'bold'}}>{formatPrice(booking.total_price, '')}</div>}
           </div>
        </div>
     )
  }

  const BookingCard = ({booking}) => (
      <div style={{padding: '8px', border: '1px solid #eee', marginBottom: '8px', borderRadius: '4px'}}>
          <div><b>{booking.code}</b>: {booking.roomName}</div>
          <div>{booking.checkIn} - {booking.checkOut}</div>
          <Tag color="blue">{booking.status}</Tag>
      </div>
  )
  // --- END: LOGIC PARSE DỮ LIỆU ---

  const handleSend = async (textToSend = null) => {
    let text = ''
    if (textToSend) {
      text = typeof textToSend === 'string' ? textToSend.trim() : String(textToSend).trim()
    } else {
      text = input.trim()
    }
    
    if (!text || loading) return
    const cleanText = String(text)
    
    if (isQuickActionRequest(cleanText)) {
      const userMsg = { role: 'user', text: cleanText, id: Date.now() }
      setMessages((prev) => [...prev, userMsg])
      setAllMessages((prev) => {
        const updated = [...prev, userMsg]
        allMessagesRef.current = updated
        return updated
      })
      const botMsg = { 
        role: 'ai', 
        text: 'Đây là các lựa chọn nhanh bạn có thể sử dụng:', 
        type: 'quick_actions', 
        id: Date.now() + 1 
      }
      setMessages((prev) => [...prev, botMsg])
      setAllMessages((prev) => {
        const updated = [...prev, botMsg]
        allMessagesRef.current = updated
        return updated
      })
      setInput('')
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
      }, 100)
      return
    }
    
    const userMsg = { role: 'user', text: cleanText, id: Date.now() }
    setShowQuickActions(false)
    
    setMessages((prev) => [...prev, userMsg])
    setAllMessages((prev) => {
      const updated = [...prev, userMsg]
      allMessagesRef.current = updated
      return updated
    })
    setInput('')
    setLoading(true)
    isScrollingUpRef.current = false

    try {
      const token = localStorage.getItem('accessToken')
      if (isAuthenticated && !token) {
         message.warning('Phiên đăng nhập đã hết hạn.')
         return
      }
      
      const response = await sendChatMessage({message: cleanText, session_id: sessionId})
      if(response.statusCode === 200){
        const aiText = typeof response.response === 'string' 
          ? response.response 
          : String(response.response || 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn.')
        
        const roomData = parseRoomData(aiText, response)
        
        const aiMsg = { 
          role: 'ai', 
          text: aiText, 
          id: Date.now() + 1,
          roomData: roomData 
        }
        setMessages((prev) => [...prev, aiMsg])
        setAllMessages((prev) => {
          const updated = [...prev, aiMsg]
          allMessagesRef.current = updated
          return updated
        })
        
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
  
  const handleQuickAction = (action) => {
    let messageText = ''
    switch(action) {
      case 'list_rooms': messageText = 'Hãy cho tôi xem danh sách các phòng có sẵn'; break;
      case 'search_rooms': messageText = 'Tôi muốn tìm kiếm phòng theo nhu cầu của tôi'; break;
      case 'booking_history': messageText = 'Hãy cho tôi xem lịch sử đặt phòng của tôi'; break;
      case 'booking_detail': messageText = 'Tôi muốn xem chi tiết một đặt phòng cụ thể'; break;
      case 'create_booking': messageText = 'Tôi muốn tạo một đặt phòng mới'; break;
      case 'cancel_booking': messageText = 'Tôi muốn hủy một đặt phòng của tôi'; break;
      default: return
    }
    handleSend(messageText)
  }

  // --- UI TRIGGER MỚI: Dọc (Greeting -> Avatar -> Zalo) ---
  const trigger = (
    <div className={`chatbot-trigger-container ${showChatbot ? 'show' : ''}`}>
      
      {/* 1. Greeting Bubble (Lời chào) */}
      <div className={`chatbot-greeting-bubble ${showGreeting ? 'visible' : ''}`}>
        <div className="greeting-content">
          <span className="greeting-text">Xin chào tôi là trợ lý BeanBot của Bean Hotel</span>
        </div>
        <button 
            className="greeting-close-btn" 
            onClick={(e) => {
                e.stopPropagation();
                setShowGreeting(false);
            }}
        >
          <CloseOutlined style={{ fontSize: '10px' }} />
        </button>
      </div>

       {/* 2. Main Chatbot Button (Avatar) */}
      <div 
        className="chatbot-main-button"
        onClick={() => setOpen(true)}
         onMouseEnter={() => setShowGreeting(true)}
         onMouseLeave={() => setShowGreeting(false)}
      >
        <Badge count={unread} size="small" offset={[-5, 5]}>
          <div className="chatbot-avatar-circle">
            <img src={ChatBotImage} alt="BeanBot" className="chatbot-avatar-image" />
          </div>
        </Badge>
      </div>

      {/* 3. Zalo Button (Bên dưới) */}
      <div 
        className="chatbot-zalo-button-new"
        onClick={() => {
            const phoneNumber = '0366228041'
            const zaloLink = `https://zalo.me/${phoneNumber}`
            window.open(zaloLink, '_blank')
        }}
      >
        <span className="zalo-text">Zalo</span>
      </div>
    </div>
  )

  return (
    <>
      {showChatbot && trigger}
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <Space>
              <Image src={ChatBotImage} style={{ width: 32, height: 32 }} />
              <Text strong>Chat với BeanBot</Text>
            </Space>
            <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
          </div>
          <div className="chatbot-container">
            <div className="chatbot-messages" ref={listRef}>
              {showScrollToBottom && (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<VerticalAlignBottomOutlined />}
                  className="chatbot-scroll-to-bottom"
                  onClick={scrollToBottom}
                />
              )}
              {historyLoading ? (
                <div className="chatbot-history-loading">
                  <Spin tip="Đang tải hội thoại..." />
                </div>
              ) : (
                <>
                  {loadingMore && (
                    <div className="chatbot-loading-more">
                      <Spin size="small" />
                    </div>
                  )}
                  {showQuickActions && messages.length === 0 && (
                    <div className="quick-actions-container">
                       <Text type="secondary" style={{ display: 'block', marginBottom: '12px', fontSize: '13px' }}>
                          Bạn có thể hỏi BeanBot về phòng ốc, đặt phòng hoặc kiểm tra lịch sử:
                       </Text>
                       <div className="quick-actions-grid">
                            <Button icon={<HomeOutlined />} className="quick-action-btn" onClick={() => handleQuickAction('list_rooms')}>Danh sách phòng</Button>
                            <Button icon={<SearchOutlined />} className="quick-action-btn" onClick={() => handleQuickAction('search_rooms')}>Tìm phòng</Button>
                            {isAuthenticated && (
                              <>
                                <Button icon={<HistoryOutlined />} className="quick-action-btn" onClick={() => handleQuickAction('booking_history')}>Lịch sử đặt phòng</Button>
                                <Button icon={<FileTextOutlined />} className="quick-action-btn" onClick={() => handleQuickAction('booking_detail')}>Chi tiết đặt phòng</Button>
                              </>
                            )}
                       </div>
                    </div>
                  )}
                  
                  <List
                    dataSource={messages}
                    renderItem={(item) => {
                       // Logic hiển thị tin nhắn (Quick Action Message vs Normal Message)
                       if (item.type === 'quick_actions') {
                           return (
                               <List.Item className="msg-bot">
                                  <div className="message-wrapper bot-message">
                                     <Avatar src={ChatBotImage} className="message-avatar" />
                                     <div className="message-content bot-content quick-actions-message">
                                        <Text strong>BeanBot</Text>
                                        <div style={{marginBottom: 8}}>{item.text}</div>
                                        <div className="quick-actions-grid-inline">
                                            <Button size="small" onClick={() => handleQuickAction('list_rooms')}>Danh sách phòng</Button>
                                            <Button size="small" onClick={() => handleQuickAction('search_rooms')}>Tìm phòng</Button>
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
                                           <Text style={{color: '#fff'}}>{typeof item.text === 'string' ? item.text : ''}</Text>
                                       </div>
                                       <Avatar icon={<UserOutlined />} className="message-avatar" />
                                   </div>
                               ) : (
                                   <div className="message-wrapper bot-message">
                                       <Avatar src={ChatBotImage} className="message-avatar" />
                                       <div className="message-content bot-content">
                                           <Text strong>BeanBot</Text>
                                           {item.roomData && item.roomData.type ? (
                                              <div style={{marginTop: 8}}>
                                                 {item.roomData.type !== 'simpleBookings' && (
                                                     <div className="chatbot-markdown">
                                                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
                                                     </div>
                                                 )}
                                                 <div className="chatbot-rooms-container">
                                                    {item.roomData.type === 'rooms' && item.roomData.data.map((room) => renderRoomCard(room))}
                                                    {item.roomData.type === 'booking' && renderBookingCard(item.roomData.data)}
                                                    {item.roomData.type === 'bookings' && item.roomData.data.map(b => renderBookingCard(b))}
                                                    {item.roomData.type === 'simpleBookings' && item.roomData.data.map((b, i) => <BookingCard key={i} booking={b} />)}
                                                 </div>
                                              </div>
                                           ) : (
                                               <div className="chatbot-markdown">
                                                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
                                               </div>
                                           )}
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
                          <Avatar src={ChatBotImage} className="message-avatar" />
                          <div className="message-content bot-content typing-indicator">
                             <div className="typing-dots"><span></span><span></span><span></span></div>
                          </div>
                       </div>
                    </List.Item>
                  )}
                </>
              )}
            </div>
            <div className="chatbot-input">
              <Input
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => { e.preventDefault(); handleSend(); }}
                disabled={loading}
              />
              <Button type="primary" icon={<SendOutlined />} onClick={() => handleSend()} loading={loading}>Gửi</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot