import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button, Input, List, Avatar, Typography, Space, Badge, message, Spin, Dropdown, Card, Row, Col, Tag, Image, Tooltip } from 'antd'
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
  CustomerServiceOutlined,
  VerticalAlignBottomOutlined,
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
  const [showChatbot, setShowChatbot] = useState(false) // Hiển thị chatbot sau khi scroll hết banner
  const [showScrollToBottom, setShowScrollToBottom] = useState(false) // Hiển thị nút scroll xuống dưới
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
      
      // Sessions đã được sắp xếp theo updated_at DESC (mới nhất trước) từ backend
      // Gộp tất cả tin nhắn từ tất cả sessions, sắp xếp theo thứ tự thời gian đúng
      const allHistoryMessages = []
      
      // Duyệt qua từng session (từ mới nhất đến cũ nhất)
      chatHistoryData.forEach((session, sessionIndex) => {
        if (session.chat_history && Array.isArray(session.chat_history)) {
          // Tin nhắn trong mỗi session đã được lưu theo thứ tự đúng (cũ → mới)
          // Session updated_at cho biết thời điểm tin nhắn cuối cùng được cập nhật
          const sessionUpdatedAt = session.updated_at ? new Date(session.updated_at).getTime() : Date.now()
          
          session.chat_history.forEach((item, messageIndex) => {
            // Đảm bảo text là string
            const messageText = typeof item.text === 'string' 
              ? item.text 
              : String(item.text || '')
            
            // Tính timestamp ước lượng cho mỗi tin nhắn
            // Tin nhắn cuối cùng trong session = session.updated_at
            // Tin nhắn trước đó sẽ có timestamp nhỏ hơn
            // Ước lượng: tin nhắn cuối = updated_at, tin nhắn trước = updated_at - (số tin nhắn sau nó * 1000ms)
            const totalMessages = session.chat_history.length
            const messagesAfter = totalMessages - messageIndex - 1
            const estimatedTimestamp = sessionUpdatedAt - (messagesAfter * 1000) // Mỗi tin nhắn cách nhau 1 giây
            
            allHistoryMessages.push({
              role: item.role === 'user' ? 'user' : 'ai',
              text: messageText,
              id: `${sessionIndex}-${messageIndex}-${estimatedTimestamp}`,
              timestamp: estimatedTimestamp, // Lưu timestamp để sort
              sessionIndex,
              messageIndex
            })
          })
        }
      })
      
      // Sắp xếp tất cả tin nhắn theo timestamp (cũ → mới)
      allHistoryMessages.sort((a, b) => a.timestamp - b.timestamp)
      
      // Lưu tất cả tin nhắn (đã được sắp xếp đúng thứ tự thời gian)
      setAllMessages(allHistoryMessages)
      allMessagesRef.current = allHistoryMessages
      
      // Lấy 20 tin nhắn cuối cùng (mới nhất) - không cần reverse vì đã đúng thứ tự
      const last20Messages = allHistoryMessages.slice(-20)
      setMessages(last20Messages)
      setDisplayedCount(20)
      displayedCountRef.current = 20
      setHasMore(allHistoryMessages.length > 20)
      
      // Ẩn quick actions nếu đã có lịch sử chat
      if (last20Messages.length > 0) {
        setShowQuickActions(false)
      }
      
      // Lấy session_id mới nhất nếu có (session đầu tiên trong mảng đã được sort DESC)
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

  // Kiểm tra scroll để hiển thị chatbot sau khi scroll hết banner
  useEffect(() => {
    const checkScrollPosition = () => {
      const bannerElement = document.querySelector('.banner-slider')
      if (bannerElement) {
        const bannerHeight = bannerElement.offsetHeight
        const scrollY = window.scrollY || window.pageYOffset
        // Hiển thị chatbot khi scroll vượt quá banner (thêm 50px để mượt hơn)
        setShowChatbot(scrollY > bannerHeight - 10)
      } else {
        // Nếu không tìm thấy banner (không phải trang home), hiển thị chatbot luôn
        setShowChatbot(true)
      }
    }

    // Kiểm tra ngay khi component mount
    checkScrollPosition()

    // Lắng nghe sự kiện scroll
    window.addEventListener('scroll', checkScrollPosition, { passive: true })
    
    // Lắng nghe sự kiện resize để cập nhật khi banner thay đổi kích thước
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
      // Scroll xuống cuối khi mở chat
      if (listRef.current) {
        setTimeout(() => {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }, 100)
      }
    }
  }, [open])
  
  // Scroll xuống cuối sau khi load xong chat history
  useEffect(() => {
    if (!historyLoading && messages.length > 0 && listRef.current) {
      // Đợi một chút để DOM render xong
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
      }, 200)
    }
  }, [historyLoading, messages.length])
  
  // Scroll xuống cuối khi có tin nhắn mới (không phải khi load thêm tin nhắn cũ)
  useEffect(() => {
    if (listRef.current && !isScrollingUpRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
          // Ẩn nút scroll sau khi scroll xuống
          setShowScrollToBottom(false)
        }
      }, 100)
    } else if (listRef.current && isScrollingUpRef.current) {
      // Nếu user đang scroll lên và có tin nhắn mới, kiểm tra xem có cần hiển thị nút không
      setTimeout(() => {
        if (listRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = listRef.current
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight
          const threeMessagesHeight = 250
          // Hiển thị nút nếu scroll lên hơn 3 tin nhắn
          setShowScrollToBottom(distanceFromBottom > threeMessagesHeight && messages.length > 0)
        }
      }, 100)
    }
  }, [messages])
  
  // Xử lý scroll để load thêm tin nhắn cũ và hiển thị nút scroll xuống
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || loadingMore) return
      
      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      
      // Tính khoảng cách từ vị trí hiện tại đến dưới cùng
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      
      // Ước tính chiều cao trung bình của 1 tin nhắn (khoảng 80-100px)
      // 3 tin nhắn ≈ 240-300px
      const threeMessagesHeight = 250
      
      // Hiển thị nút nếu scroll lên hơn 3 tin nhắn (khoảng 250px từ dưới cùng)
      const shouldShowButton = distanceFromBottom > threeMessagesHeight && messages.length > 0
      setShowScrollToBottom(shouldShowButton)
      
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
      // Kiểm tra ngay khi mount
      handleScroll()
      return () => {
        messagesContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasMore, loadingMore, loadMoreMessages, messages.length])

  // Hàm scroll xuống dưới cùng
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

  // Parse và kiểm tra xem response có chứa dữ liệu phòng/đặt phòng không
  const parseRoomData = (text, responseData = null) => {
    try {
      // Nếu response có functionCalls và có data, thử lấy từ đó
      if (responseData?.functionCalls) {
        // Có thể có room data trong function results
        // Backend có thể trả về structured data
      }
      
      // Thử parse JSON nếu response chứa JSON
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
          // Nếu là booking data
          if (parsed.booking_id || parsed.booking_code) {
            return { type: 'booking', data: parsed }
          }
        } catch (e) {
          // Không phải valid JSON, bỏ qua
        }
      }
      
      // Kiểm tra xem có keywords liên quan đến phòng/booking không
      const roomKeywords = ['phòng', 'room', 'rooms', 'danh sách phòng', 'tìm thấy', 'có sẵn']
      const bookingKeywords = ['Mã đặt phòng', 'booking', 'đặt phòng', 'reservation', 'Ngày check-in', 'Check-in', 'check-in', 'Check-out', 'check-out', 'Trạng thái']
      
      const hasRoomKeywords = roomKeywords.some(keyword => text.toLowerCase().includes(keyword))
      const hasBookingKeywords = bookingKeywords.some(keyword => text.toLowerCase().includes(keyword))
      
      // Thử parse format đơn giản trước: "CODE: Phòng Name, check-in..., check-out..., trạng thái..."
      const simpleBookings = parseBookingResponse(text)
      if (simpleBookings && simpleBookings.length > 0) {
        return { type: 'simpleBookings', data: simpleBookings }
      }
      
      // Nếu có keywords booking, parse thông tin booking từ text (format chi tiết)
      if (hasBookingKeywords) {
        const bookingInfo = parseBookingFromText(text)
        if (bookingInfo) {
          // Nếu là array (danh sách booking)
          if (Array.isArray(bookingInfo)) {
            return { type: 'bookings', data: bookingInfo }
          }
          // Nếu là single booking
          return { type: 'booking', data: bookingInfo }
        }
      }
      
      // Nếu có keywords phòng và có pattern như "Phòng X", "giá", "VNĐ"
      if (hasRoomKeywords) {
        const hasRoomPattern = /phòng\s+\d+|giá|vnđ|vnd|đêm/i.test(text)
        if (hasRoomPattern) {
          // Có thể có thông tin phòng nhưng không parse được, return null để hiển thị text bình thường
          return null
        }
      }
      
      return null
    } catch (e) {
      console.error('Error parsing room data:', e)
      return null
    }
  }

  // Parse thông tin booking từ text
  const parseBookingFromText = (text) => {
    try {
      // Kiểm tra xem có phải là danh sách booking không (format: CODE: Loại phòng, check-in...)
      const listBookingPattern = /^[A-Z0-9]{8,}:\s*Phòng/i
      const lines = text.split('\n').filter(line => line.trim())
      
      // Nếu có nhiều dòng match pattern danh sách booking
      const bookingLines = lines.filter(line => listBookingPattern.test(line.trim()))
      
      if (bookingLines.length > 0) {
        // Parse danh sách booking
        const bookings = bookingLines.map(line => parseSingleBookingFromLine(line)).filter(Boolean)
        if (bookings.length > 0) {
          return bookings
        }
      }
      
      // Thử parse single booking với format chi tiết (có **Mã đặt phòng**)
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

  // Parse booking response từ text format đơn giản: "CODE: Phòng Name, check-in DD/MM/YY, check-out DD/MM/YY, trạng thái..."
  // Trả về array of objects: { code, roomName, checkIn, checkOut, status, extra, reviewLink }
  const parseBookingResponse = (text) => {
    try {
      if (!text || typeof text !== 'string') return null

      // Pattern để tìm các dòng booking: CODE: Phòng Name, check-in DD/MM/YY, check-out DD/MM/YY, trạng thái...
      // Format: CZP08WBF: Phòng Deluxe, check-in 22/11/25, check-out 23/11/25, trạng thái đã check-in.
      const bookingLinePattern = /([A-Z0-9]{8,}):\s*Phòng\s+([^,]+?)(?:,\s*check-in\s+(\d{1,2}\/\d{1,2}\/\d{2,4}))?(?:,\s*check-out\s+(\d{1,2}\/\d{1,2}\/\d{2,4}))?(?:,\s*trạng thái\s+([^,\.]+))?/gi
      
      const bookings = []
      let match
      const lines = text.split('\n').filter(line => line.trim())
      
      // Tìm tất cả các match trong từng dòng
      for (const line of lines) {
        // Reset regex lastIndex để tránh lỗi
        bookingLinePattern.lastIndex = 0
        match = bookingLinePattern.exec(line)
        
        if (match) {
          const code = match[1]?.trim()
          const roomName = match[2]?.trim()
          const checkIn = match[3]?.trim() || null
          const checkOut = match[4]?.trim() || null
          let status = match[5]?.trim() || null
          
          // Làm sạch status (loại bỏ dấu chấm cuối)
          if (status) {
            status = status.replace(/\.$/, '').trim()
          }
          
          // Tìm thông tin bổ sung (extra) - có thể là dịch vụ, ghi chú, etc.
          // Tìm phần còn lại sau trạng thái
          let extra = null
          const afterStatusMatch = line.match(/trạng thái\s+[^,\.]+(?:,\s*|\.\s*)([^\.]+)/i)
          if (afterStatusMatch && afterStatusMatch[1]) {
            const extraText = afterStatusMatch[1].trim()
            if (extraText && !extraText.includes('http')) {
              extra = extraText.replace(/\.$/, '').trim()
            }
          }
          
          // Tìm review link nếu có (trong toàn bộ text)
          let reviewLink = null
          const reviewLinkMatch = text.match(/https?:\/\/[^\s\)]+/i)
          if (reviewLinkMatch) {
            reviewLink = reviewLinkMatch[0]
          }
          
          if (code && roomName) {
            bookings.push({
              code,
              roomName,
              checkIn,
              checkOut,
              status,
              extra,
              reviewLink
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

  // Parse một booking từ dòng text (format: CODE: Loại phòng, check-in DD/MM/YY, check-out DD/MM/YY, trạng thái...)
  const parseSingleBookingFromLine = (line) => {
    try {
      const bookingInfo = {}
      
      // Extract booking code (format: CODE: ...)
      const codeMatch = line.match(/^([A-Z0-9]{8,}):/)
      if (codeMatch) {
        bookingInfo.booking_code = codeMatch[1]
      } else {
        return null // Không có code thì không phải booking
      }
      
      // Extract loại phòng (sau dấu :)
      const roomTypeMatch = line.match(/:\s*Phòng\s+([^,]+)/i)
      if (roomTypeMatch) {
        bookingInfo.room_type = roomTypeMatch[1].trim()
      }
      
      // Extract check-in date (format: check-in DD/MM/YY)
      const checkInMatch = line.match(/check-in\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
      if (checkInMatch) {
        bookingInfo.check_in = checkInMatch[1]
      }
      
      // Extract check-out date (format: check-out DD/MM/YY)
      const checkOutMatch = line.match(/check-out\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
      if (checkOutMatch) {
        bookingInfo.check_out = checkOutMatch[1]
      }
      
      // Extract trạng thái
      const statusMatch = line.match(/trạng thái\s+([^,\.]+)/i)
      if (statusMatch) {
        bookingInfo.status = statusMatch[1].trim()
      }
      
      // Extract dịch vụ (nếu có)
      const serviceMatch = line.match(/có dịch vụ\s+([^,\.]+)/i)
      if (serviceMatch) {
        bookingInfo.services = [{ name: serviceMatch[1].trim() }]
      }
      
      // Extract link review (nếu có)
      const reviewLinkMatch = line.match(/https?:\/\/[^\s]+/i)
      if (reviewLinkMatch) {
        bookingInfo.review_link = reviewLinkMatch[0]
      }
      
      return bookingInfo
    } catch (e) {
      console.error('Error parsing single booking from line:', e)
      return null
    }
  }

  // Parse booking chi tiết với format markdown (có **Mã đặt phòng**)
  const parseDetailedBooking = (text) => {
    try {
      const bookingInfo = {}
      
      // Extract booking code
      const bookingCodeMatch = text.match(/\*\*Mã đặt phòng\*\*[:\s*]+([A-Z0-9]+)/i) ||
                               text.match(/mã đặt phòng[:\s*]+([A-Z0-9]+)/i)
      if (bookingCodeMatch) {
        bookingInfo.booking_code = bookingCodeMatch[1].trim()
      }
      
      // Extract booking ID
      const bookingIdMatch = text.match(/\*\*ID đặt phòng\*\*[:\s*]+(\d+)/i) ||
                             text.match(/id đặt phòng[:\s*]+(\d+)/i)
      if (bookingIdMatch) {
        bookingInfo.booking_id = parseInt(bookingIdMatch[1])
      }
      
      // Extract status (hỗ trợ format: Đã trả phòng (checked_out) hoặc Đã check-out. Anh/chị có thể...)
      // Tìm review link trong status text nếu có
      let reviewLinkInStatus = null
      const reviewLinkMatch = text.match(/https?:\/\/[^\s\)]+/i)
      if (reviewLinkMatch) {
        reviewLinkInStatus = reviewLinkMatch[0]
        bookingInfo.review_link = reviewLinkInStatus
      }
      
      const statusMatch = text.match(/\*\*Trạng thái\*\*[:\s*]+([^\.\n]+?)(?:\.|\(|$)/i) ||
                           text.match(/trạng thái[:\s*]+([^\.\n]+?)(?:\.|\(|$)/i)
      if (statusMatch) {
        let statusText = statusMatch[1].trim()
        // Loại bỏ phần text sau status nếu có (ví dụ: "Anh/chị có thể...")
        statusText = statusText.split(/\.\s+/)[0].trim()
        bookingInfo.status = statusText
        // Tìm status_code trong ngoặc nếu có
        const statusCodeMatch = text.match(/trạng thái[:\s*]+[^(]*\(([^)]+)\)/i)
        if (statusCodeMatch) {
          bookingInfo.status_code = statusCodeMatch[1].trim()
        }
      }
      
      // Extract check-in date (hỗ trợ cả "Check-in:" và "Ngày check-in:")
      const checkInMatch = text.match(/\*\*Check-in\*\*[:\s*]+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                          text.match(/\*\*Ngày check-in\*\*[:\s*]+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                          text.match(/check-in[:\s*]+(\d{1,2}\/\d{1,2}\/\d{4})/i)
      if (checkInMatch) {
        bookingInfo.check_in = checkInMatch[1]
      }
      
      // Extract check-out date (hỗ trợ cả "Check-out:" và "Ngày check-out:")
      const checkOutMatch = text.match(/\*\*Check-out\*\*[:\s*]+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                           text.match(/\*\*Ngày check-out\*\*[:\s*]+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                           text.match(/check-out[:\s*]+(\d{1,2}\/\d{1,2}\/\d{4})/i)
      if (checkOutMatch) {
        bookingInfo.check_out = checkOutMatch[1]
      }
      
      // Extract giá cuối cùng
      const priceMatch = text.match(/\*\*Giá cuối cùng\*\*[:\s*]+([\d.,]+)\s*vnđ/i) ||
                        text.match(/giá cuối cùng[:\s*]+([\d.,]+)\s*vnđ/i) ||
                        text.match(/tổng tiền[:\s*]+([\d.,]+)\s*vnđ/i)
      if (priceMatch) {
        bookingInfo.total_price = parseFloat(priceMatch[1].replace(/[,.]/g, ''))
      }
      
      // Extract số người
      const guestMatch = text.match(/\*\*Số người\*\*[:\s*]+(\d+)/i) ||
                        text.match(/số người[:\s*]+(\d+)/i)
      if (guestMatch) {
        bookingInfo.num_guests = parseInt(guestMatch[1])
      }
      
      // Extract số phòng
      const roomCountMatch = text.match(/\*\*Số phòng\*\*[:\s*]+(\d+)/i) ||
                            text.match(/số phòng[:\s*]+(\d+)/i)
      if (roomCountMatch) {
        bookingInfo.num_rooms = parseInt(roomCountMatch[1])
      }
      
      // Extract trạng thái thanh toán
      const paymentMatch = text.match(/\*\*Trạng thái thanh toán\*\*[:\s*]+([^\n*]+)/i) ||
                          text.match(/trạng thái thanh toán[:\s*]+([^\n*]+)/i)
      if (paymentMatch) {
        bookingInfo.payment_status = paymentMatch[1].trim()
      }
      
      // Extract loại phòng (hỗ trợ format: Phòng Suite (VIP))
      const roomTypeMatch = text.match(/\*\*Loại phòng\*\*[:\s*]+([^\n*]+)/i) ||
                           text.match(/loại phòng[:\s*]+([^\n*]+)/i)
      if (roomTypeMatch) {
        bookingInfo.room_type = roomTypeMatch[1].trim()
      }
      
      // Extract số phòng cụ thể
      const roomNumMatches = text.match(/\*\*Số phòng\*\*[:\s*]+(\d+)/gi)
      if (roomNumMatches && roomNumMatches.length > 1) {
        bookingInfo.room_number = parseInt(roomNumMatches[1].match(/\d+/)[0])
      }
      
      // Extract dịch vụ
      const serviceMatch = text.match(/\*\*Dịch vụ\*\*[:\s*]+([^\n*]+)/i) ||
                         text.match(/dịch vụ[:\s*]+([^\n*]+)/i)
      if (serviceMatch) {
        const serviceText = serviceMatch[1].trim()
        const servicePriceMatch = serviceText.match(/(.+?)\s*\(([\d.,]+)\s*vnđ\)/i)
        if (servicePriceMatch) {
          bookingInfo.services = [{
            name: servicePriceMatch[1].trim(),
            price: parseFloat(servicePriceMatch[2].replace(/[,.]/g, ''))
          }]
        } else {
          bookingInfo.services = [{ name: serviceText }]
        }
      }
      
      // Chỉ return nếu có ít nhất booking code hoặc booking ID
      if (bookingInfo.booking_code || bookingInfo.booking_id) {
        return bookingInfo
      }
      
      return null
    } catch (e) {
      console.error('Error parsing detailed booking:', e)
      return null
    }
  }

  // Format giá tiền
  const formatPrice = (price, suffix = '/đêm') => {
    if (!price && price !== 0) return 'Liên hệ'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[,.]/g, '')) : price
    if (isNaN(numPrice)) return 'Liên hệ'
    return new Intl.NumberFormat('vi-VN').format(numPrice) + ' VNĐ' + suffix
  }



  // Render Card cho thông tin phòng
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
                      <Tag key={idx} color="default" style={{ fontSize: 11 }}>
                        {amenity}
                      </Tag>
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

  // Render danh sách thông tin booking (format chi tiết) – không dùng Card
  const renderBookingCard = (booking) => {
    const getStatusColor = (status, statusCode) => {
      const statusLower = (statusCode || status || '').toLowerCase()
      if (statusLower.includes('confirmed') || statusLower.includes('đã xác nhận') || statusLower.includes('xác nhận')) return 'green'
      if (statusLower.includes('checked_in') || statusLower.includes('đã nhận phòng') || statusLower.includes('check-in')) return 'blue'
      if (statusLower.includes('checked_out') || statusLower.includes('đã trả phòng') || statusLower.includes('check-out')) return 'default'
      if (statusLower.includes('cancelled') || statusLower.includes('đã hủy') || statusLower.includes('hủy')) return 'red'
      return 'orange'
    }

    const getStatusText = (status) => {
      if (!status) return 'Chờ xác nhận'
      const statusLower = status.toLowerCase()
      if (statusLower.includes('đã xác nhận') || statusLower.includes('xác nhận')) return 'Đã xác nhận'
      if (statusLower.includes('đã nhận phòng') || statusLower.includes('check-in')) return 'Đã nhận phòng'
      if (statusLower.includes('đã trả phòng') || statusLower.includes('check-out')) return 'Đã trả phòng'
      if (statusLower.includes('đã hủy') || statusLower.includes('hủy')) return 'Đã hủy'
      return status
    }

    const getPaymentStatusColor = (paymentStatus) => {
      const statusLower = (paymentStatus || '').toLowerCase()
      if (statusLower.includes('đã thanh toán') || statusLower.includes('paid')) return 'green'
      if (statusLower.includes('chưa thanh toán') || statusLower.includes('unpaid')) return 'red'
      return 'orange'
    }

    return (
      <div
        key={booking.booking_id || booking.booking_code || Math.random()}
        style={{
          marginBottom: 12,
          padding: 12,
          borderBottom: '1px dashed #e5e5e5',
        }}
      >
        <Space
          style={{
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text strong style={{ fontSize: 14 }}>
            {booking.booking_code ? `Mã đặt phòng: ${booking.booking_code}` : 'Thông tin đặt phòng'}
          </Text>
          {booking.status && (
            <Tag
              color={getStatusColor(booking.status, booking.status_code)}
              style={{ fontSize: 12 }}
            >
              {getStatusText(booking.status)}
            </Tag>
          )}
        </Space>

        <Space direction="vertical" size={4} style={{ width: '100%', fontSize: 13 }}>
          {booking.booking_id && (
            <Text>
              <Text type="secondary">ID đặt phòng: </Text>
              <Text strong>#{booking.booking_id}</Text>
            </Text>
          )}

          {booking.room_type && (
            <Text>
              <Text type="secondary">Loại phòng: </Text>
              <Text strong>{booking.room_type}</Text>
            </Text>
          )}

          {booking.check_in && (
            <Text>
              <Text type="secondary">Check-in: </Text>
              <Text>{booking.check_in}</Text>
            </Text>
          )}

          {booking.check_out && (
            <Text>
              <Text type="secondary">Check-out: </Text>
              <Text>{booking.check_out}</Text>
            </Text>
          )}

          {(booking.num_guests || booking.num_rooms) && (
            <Text>
              {booking.num_guests && (
                <>
                  <Text type="secondary">Số người: </Text>
                  <Text>{booking.num_guests}</Text>
                </>
              )}
              {booking.num_rooms && (
                <>
                  {'  '}
                  <Text type="secondary">Số phòng: </Text>
                  <Text>{booking.num_rooms}</Text>
                </>
              )}
            </Text>
          )}

          {booking.room_number && (
            <Text>
              <Text type="secondary">Số phòng: </Text>
              <Text>Phòng {booking.room_number}</Text>
            </Text>
          )}

          {booking.payment_status && (
            <Text>
              <Text type="secondary">Thanh toán: </Text>
              <Tag color={getPaymentStatusColor(booking.payment_status)}>
                {booking.payment_status}
              </Tag>
            </Text>
          )}

          {booking.services && booking.services.length > 0 && (
            <div>
              <Text type="secondary">Dịch vụ: </Text>
              {booking.services.map((service, idx) => (
                <Tag key={idx} style={{ marginTop: 4 }}>
                  {service.name}
                  {service.price && (
                    <Text type="secondary" style={{ marginLeft: 4, fontSize: 11 }}>
                      ({formatPrice(service.price, '')})
                    </Text>
                  )}
                </Tag>
              ))}
            </div>
          )}

          {booking.total_price && (
            <Text>
              <Text type="secondary">Tổng tiền: </Text>
              <Text strong style={{ color: '#c08a19' }}>
                {formatPrice(booking.total_price, '')}
              </Text>
            </Text>
          )}

          {booking.review_link && (
            <div style={{ marginTop: 4 }}>
              <a
                href={booking.review_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13 }}
              >
                Để lại đánh giá
              </a>
            </div>
          )}
        </Space>
      </div>
    )
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
      // Đảm bảo token được gửi nếu đã đăng nhập
      const token = localStorage.getItem('accessToken')
      
      // Log để debug
      if (isAuthenticated) {
        if (token) {
          console.log('✅ Token found, will be sent with chat request')
        } else {
          console.warn('⚠️ User is authenticated but no token found in localStorage')
          message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          return
        }
      } else {
        console.log('ℹ️ User not authenticated, sending chat request without token')
      }
      
      const response = await sendChatMessage({message: cleanText, session_id: sessionId})
      if(response.statusCode === 200){
      // Đảm bảo aiText là string
      const aiText = typeof response.response === 'string' 
        ? response.response 
        : String(response.response || 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn.')
      
      // Kiểm tra xem response có chứa dữ liệu phòng không
      // Thử parse từ text và response data
      const roomData = parseRoomData(aiText, response)
      
      const aiMsg = { 
        role: 'ai', 
        text: aiText, 
        id: Date.now() + 1,
        roomData: roomData // Lưu dữ liệu phòng nếu có
      }
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

  // Menu items cho dropdown chatbot
  const menuItems = [
    {
      key: 'chat',
      label: (
        <Space>
          <MessageOutlined />
          <span>Chat</span>
        </Space>
      ),
    },
    {
      key: 'zalo',
      label: (
        <Space>
          <CustomerServiceOutlined />
          <span>Liên hệ Zalo</span>
        </Space>
      ),
    },
  ]

  // Xử lý khi click vào menu item chatbot
  const handleMenuClick = ({ key }) => {
    if (key === 'chat') {
      setOpen(true)
    } else if (key === 'zalo') {
      // Mở link Zalo với số điện thoại
      const phoneNumber = '0366228041'
      const zaloLink = `https://zalo.me/${phoneNumber}`
      window.open(zaloLink, '_blank')
    }
  }

  // Xử lý click vào button đặt phòng ngay
  const handleBookingClick = () => {
    const phoneNumber = '0366228041'
    // Có thể dùng tel: để gọi trực tiếp hoặc zalo link
    const zaloLink = `https://zalo.me/${phoneNumber}`
    window.open(zaloLink, '_blank')
  }

  const trigger = (
    <div className="chatbot-buttons-container">
      {/* Button Đặt phòng ngay */}
      <Button
        type="primary"
        icon={<CustomerServiceOutlined />}
        className={`chatbot-booking-btn ${showChatbot ? 'show' : ''}`}
        onClick={handleBookingClick}
      >
       đặt phòng ngay - 0366228041
      </Button>
      {/* Button Chat với dropdown */}
      <Badge count={unread} offset={[-6, 6]}>
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="topRight"
        >
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined />}
            className={`chatbot-fab chatbot-shake ${showChatbot ? 'show' : ''}`}
          />
        </Dropdown>
      </Badge>
    </div>
  )

  return (
    <>
      {showChatbot && trigger}
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
              {/* Nút scroll xuống dưới cùng */}
              {showScrollToBottom && (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<VerticalAlignBottomOutlined />}
                  className="chatbot-scroll-to-bottom"
                  onClick={scrollToBottom}
                  title="Cuộn xuống dưới cùng"
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
                            
                            {/* Hiển thị Card nếu có dữ liệu phòng/booking */}
                            {item.roomData && item.roomData.type ? (
                              <div style={{ marginTop: 8 }}>
                                {/* Hiển thị text chỉ khi không phải simpleBookings (để tránh duplicate) */}
                                {item.roomData.type !== 'simpleBookings' && (
                                  <div className="chatbot-markdown" style={{ marginBottom: 12 }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {messageText}
                                    </ReactMarkdown>
                                  </div>
                                )}
                                <div className="chatbot-rooms-container">
                                  {item.roomData.type === 'rooms' && Array.isArray(item.roomData.data) && 
                                    item.roomData.data.map((room) => renderRoomCard(room))
                                  }
                                  {item.roomData.type === 'booking' && item.roomData.data &&
                                    renderBookingCard(item.roomData.data)
                                  }
                                  {item.roomData.type === 'bookings' && Array.isArray(item.roomData.data) &&
                                    item.roomData.data.map((booking) => renderBookingCard(booking))
                                  }
                                  {item.roomData.type === 'simpleBookings' && Array.isArray(item.roomData.data) &&
                                    item.roomData.data.map((booking, index) => (
                                      <BookingCard key={booking.code || index} booking={booking} />
                                    ))
                                  }
                                </div>
                              </div>
                            ) : (
                              <div className="chatbot-markdown">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {messageText}
                                </ReactMarkdown>
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


