// import React, { useState, useEffect } from 'react'
// import { 
//   Card, Row, Col, Typography, Space, Divider, 
//   Alert, Spin, message, Button
// } from 'antd'
// import { 
//   QrcodeOutlined, CheckCircleOutlined, ClockCircleOutlined,
//   SafetyCertificateOutlined, CreditCardOutlined
// } from '@ant-design/icons'
// import { useLocation, useNavigate } from 'react-router-dom'
// import formatPrice from '../../utils/formatPrice'
// import './Payment.css'
// import QRCode from 'antd/es/qr-code'
// const { Title, Text } = Typography
// import { calculateNights, checkPaymentStatus, findBookingByCode, formatDate } from '../../services/booking.service'
// import {  getPendingPayment, clearPendingPayment, getRemainingTime, getPendingPaymentByIdentifier, removePendingPayment } from '../../utils/pendingPayment.util'
// import { useAuth } from '../../context/AuthContext'
// const Payment = () => {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { user } = useAuth()
//   const [paymentStatus, setPaymentStatus] = useState('pending')
//   const [remainingSeconds, setRemainingSeconds] = useState(1800) // 30 phút = 1800 giây
  
//   const stateData = location.state || {}

//   const storedUser = (() => {
//     try {
//       const raw = localStorage.getItem('user')
//       return raw ? JSON.parse(raw) : null
//     } catch {
//       return null
//     }
//   })()

//   const userId = user?.user_id || user?.id || storedUser?.user_id || storedUser?.id || storedUser?.userId || null

//   const bookingData = (() => {
//     let booking = null
//     const identifierCandidates = [
//       stateData?.tempBookingKey,
//       stateData?.orderCode,
//       stateData?.bookingCode,
//       stateData?.bookingData?.tempBookingKey,
//       stateData?.bookingData?.orderCode,
//       stateData?.bookingData?.bookingCode
//     ].filter(Boolean)

//     if (userId && identifierCandidates.length > 0) {
//       for (const identifier of identifierCandidates) {
//         booking = getPendingPaymentByIdentifier(userId, identifier)
//         if (booking) break
//       }
//     }

//     if (!booking && stateData?.bookingData) {
//       booking = stateData.bookingData
//     }

//     if (!booking && userId) {
//       booking = getPendingPayment(userId)
//     }

//     if (!booking) {
//       booking = getPendingPayment()
//     }

//     return booking
//   })()
  
//   // Đồng hồ đếm ngược 30 phút từ lúc đặt phòng
//   useEffect(() => {
//     if (bookingData && bookingData.bookingInfo) {
//       // Ưu tiên lấy thời gian còn lại từ bookingData.expiresAt
//       if (bookingData.expiresAt) {
//         const now = Date.now()
//         const expiry = typeof bookingData.expiresAt === 'string' 
//           ? new Date(bookingData.expiresAt).getTime() 
//           : bookingData.expiresAt
//         const remaining = Math.max(Math.floor((expiry - now) / 1000), 0)
//         if (remaining > 0) {
//           setRemainingSeconds(remaining)
//           return
//         }
//       }
      
//       // Nếu không có expiresAt, thử lấy từ localStorage
//       const initialRemain = getRemainingTime()
//       if (initialRemain > 0) {
//         setRemainingSeconds(initialRemain)
//       } else {
//         // Nếu không có trong localStorage, tính từ thời gian tạo (createdAt) hoặc mặc định 30 phút
//         if (bookingData.createdAt) {
//           const createdAt = typeof bookingData.createdAt === 'string'
//             ? new Date(bookingData.createdAt).getTime()
//             : bookingData.createdAt
//           const now = Date.now()
//           const elapsed = Math.floor((now - createdAt) / 1000) // Thời gian đã trôi qua (giây)
//           const remaining = Math.max(1800 - elapsed, 0) // 30 phút - thời gian đã trôi qua
//           setRemainingSeconds(remaining)
//         } else {
//           // Mặc định 30 phút nếu không có thông tin thời gian
//           setRemainingSeconds(1800) // 30 phút = 1800 giây
//         }
//       }
//     } else {
//       message.error('Thông tin thanh toán không hợp lệ')
//       navigate('/')
//     }
    
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   // Cập nhật đồng hồ đếm ngược mỗi giây
//   useEffect(() => {
//     if (remainingSeconds <= 0 || paymentStatus !== 'pending') {
//       if (remainingSeconds <= 0 && paymentStatus === 'pending') {
//         setPaymentStatus('expired')
//       }
//       return
//     }

//     const timer = setInterval(() => {
//       setRemainingSeconds(prev => {
//         if (prev <= 1) {
//           setPaymentStatus('expired')
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [remainingSeconds, paymentStatus])

//   // Format thời gian đếm ngược: MM:SS
//   const formatCountdown = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
//   }



//   // Lấy thông tin từ bookingData
//   const {
//     qrCode,
//     paymentUrl,
//     bookingCode,
//     orderCode,
//     amount = 0,
//     bookingInfo,
//     tempBookingKey,
//     promoCode,
//     selectedServices = []
//   } = bookingData || {}
  
//   const nights = bookingInfo ? calculateNights(bookingInfo.checkIn, bookingInfo.checkOut) : 0
//   const roomSubtotal = bookingInfo?.roomType?.price_per_night * nights || 0
//   const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0)
//   const totalWithServices = roomSubtotal + servicesTotal
//   // Polling: Cứ mỗi 6 giây gọi API lấy booking theo bookingCode
//   useEffect(() => {
//     if (!bookingCode || paymentStatus === 'success') return
//     const checkBookingStatus = async () => {
//       try {
//         const response = await findBookingByCode(bookingCode)
//         const booking = response?.booking || response?.data?.booking
        
//         if (booking) {
//           // Tìm thấy booking, dừng polling và chuyển sang trang thành công
//           console.log('[Payment] Đã tìm thấy booking, chuyển sang trang thành công')
//           setPaymentStatus('success')
          
//           // Xóa booking trong localStorage theo orderCode
//           if (userId) {
//             if (orderCode) {
//               removePendingPayment(userId, orderCode)
//             }
//             if (bookingCode) {
//               removePendingPayment(userId, bookingCode)
//             }
//             if (tempBookingKey) {
//               removePendingPayment(userId, tempBookingKey)
//             }
//           } else {
//             clearPendingPayment()
//           }
          
//           // Chuyển sang trang thành công
//           setTimeout(() => {
//             const successUrl = `/payment/success?code=00&id=${encodeURIComponent(orderCode || bookingCode || tempBookingKey || '')}&cancel=false&status=PAID&orderCode=${encodeURIComponent(orderCode || '')}`
//             navigate(successUrl, { replace: true })
//           }, 500)
//         }
//       } catch (error) {
//         // Nếu không tìm thấy booking (404), tiếp tục polling
//         // if (error?.status !== 404) {
//         //   console.error('[Payment] Error checking booking status:', error)
//         // }
//       }
//     }

//     // Gọi ngay lần đầu
//     checkBookingStatus()

//     // Thiết lập interval để gọi mỗi 6 giây
//     const intervalId = setInterval(checkBookingStatus, 5000)

//     // Cleanup: dừng polling khi component unmount hoặc khi paymentStatus thay đổi
//     return () => {
//       clearInterval(intervalId)
//     }
//   }, [bookingCode, paymentStatus, orderCode, tempBookingKey, userId])

//   // Xử lý thanh toán thành công (Test button)
//   const handlePaymentSuccess = async () => {
//     if (paymentStatus === 'success') return // Tránh gọi nhiều lần
    
//     try {
//       // Khi click test, gọi API findBookingByCode để kiểm tra booking
//       if (bookingCode) {
//         try {
//           const response = await findBookingByCode(bookingCode)
//           const booking = response?.booking || response?.data?.booking
          
//           if (booking) {
//             // Tìm thấy booking, xử lý như polling đã tìm thấy
//             console.log('[Payment] Test: Đã tìm thấy booking')
//             setPaymentStatus('success')
            
//             // Xóa booking trong localStorage
//             if (userId) {
//               if (orderCode) {
//                 removePendingPayment(userId, orderCode)
//               }
//               if (bookingCode) {
//                 removePendingPayment(userId, bookingCode)
//               }
//               if (tempBookingKey) {
//                 removePendingPayment(userId, tempBookingKey)
//               }
//             } else {
//               clearPendingPayment()
//             }
            
//             // Chuyển sang trang thành công
//             // setTimeout(() => {
//             //   const successUrl = `/payment/success?code=00&id=${encodeURIComponent(orderCode || bookingCode || tempBookingKey || '')}&cancel=false&status=PAID&orderCode=${encodeURIComponent(orderCode || '')}`
//             //   navigate(successUrl, { replace: true })
//             // }, 500)
//             return
//           }
//         } catch (error) {
//           // Nếu chưa tìm thấy booking, để polling tiếp tục chạ
//         }
//       }
      
//       // Fallback: Nếu không có bookingCode hoặc chưa tìm thấy, vẫn gọi checkPaymentStatus
//       const buyerName = bookingInfo?.customerInfo?.fullName || ''
//       const buyerEmail = bookingInfo?.customerInfo?.email || ''
//       const res = await checkPaymentStatus(
//         {
//           orderCode : orderCode,
//           status : "PAID",
//           buyerName,
//           buyerEmail,
//         }
//       )
//       const data = res?.data || res
//       if (data?.status === 'success' || data?.statusCode === 200) {
//         message.success('Thanh toán thành công!')
//         // Xóa booking trong localStorage theo orderCode (ưu tiên) hoặc các identifier khác
//         if (userId) {
//           // Ưu tiên xóa theo orderCode vì đây là identifier chính xác nhất
//           if (orderCode) {
//             const removed = removePendingPayment(userId, orderCode)
//             if (removed) {
//               console.log(`[Payment] Đã xóa booking có orderCode: ${orderCode}`)
//             }
//           }
//           // Xóa theo các identifier khác để đảm bảo (nếu orderCode không tìm thấy)
//           if (bookingCode && !orderCode) {
//             removePendingPayment(userId, bookingCode)
//           }
//           if (tempBookingKey && !orderCode && !bookingCode) {
//             removePendingPayment(userId, tempBookingKey)
//           }
//         } else {
//           clearPendingPayment()
//         }
//       } else {
//         message.error('Thanh toán chưa được xác nhận. Vui lòng thử lại.')
//       }
//     } catch (err) {
//       console.error('[Payment] Error in handlePaymentSuccess:', err)
//       message.error('Không thể xác nhận thanh toán. Vui lòng thử lại.')
//     }
//   }

//   return (
//     <div className="payment-page-new">
//       <div className="container">
//         {/* Header */}
//         <div className="payment-header-new">
//           <Title level={2} style={{ margin: 0, textAlign: 'center' }}>
//             Thanh toán đặt phòng
//           </Title>
      
//         </div>

//         <Row gutter={32}>
//           {/* Cột trái - QR Code */}
//           <Col xs={24} md={10}>
//             <Card className="qr-code-card">
//               {/* Tạo đồng hồ đếm ngược 30p  */}
//               <div className="qr-code-section">
//                 <Title level={4} style={{ textAlign: 'center', marginTop: '16px' }}>
//                   Quét mã QR để thanh toán
//                 </Title>
//                 <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginBottom: '24px' }}>
//                   Sử dụng ứng dụng ngân hàng để quét và thanh toán
//                 </Text>
                
//                 {/* QR Code */}
//                 {qrCode && paymentStatus !== 'expired' ? (
//                   <div className="qr-code-container">
//                     <QRCode value={qrCode} />
//                   </div>
//                 ) : (
//                   <div className="qr-code-placeholder">
//                     <Spin size="large" />
//                     <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
//                       {paymentStatus === 'expired' ? 'Mã QR đã hết hạn. Vui lòng tạo lại đơn thanh toán.' : 'Đang tải mã QR...'}
//                     </Text>
//                   </div>
//                 )}

//                 {/* Đồng hồ đếm ngược */}
//                 {qrCode && paymentStatus === 'pending' && remainingSeconds > 0 && (
//                   <div 
//                     className={`countdown-timer ${remainingSeconds <= 300 ? 'urgent' : ''}`}
//                     style={{ 
//                       marginTop: '24px', 
//                       padding: '16px',
//                       background: remainingSeconds <= 300 ? '#fff1f0' : '#f6ffed', // Đỏ nhạt khi còn < 5 phút
//                       borderRadius: '8px',
//                       border: `2px solid ${remainingSeconds <= 300 ? '#ffccc7' : '#b7eb8f'}`
//                     }}
//                   >
//                     <Space direction="vertical" size={8} style={{ width: '100%', textAlign: 'center' }}>
//                       <ClockCircleOutlined style={{ 
//                         fontSize: '24px', 
//                         color: remainingSeconds <= 300 ? '#ff4d4f' : '#52c41a' 
//                       }} />
//                       <Text strong style={{ 
//                         fontSize: '24px', 
//                         color: remainingSeconds <= 300 ? '#ff4d4f' : '#52c41a',
//                         fontFamily: 'monospace',
//                         letterSpacing: '2px'
//                       }}>
//                         {formatCountdown(remainingSeconds)}
//                       </Text>
//                       <Text type="secondary" style={{ fontSize: '13px' }}>
//                         {remainingSeconds <= 300 
//                           ? 'Thời gian thanh toán sắp hết hạn!' 
//                           : 'Thời gian còn lại để hoàn tất thanh toán'}
//                       </Text>
//                     </Space>
//                   </div>
//                 )}
//                 {/* Status Indicator */}
//                 <div className="payment-status" style={{ marginTop: '24px' }}>
//                   {paymentStatus === 'pending' && (
//                     <Alert
//                       message="Đang chờ thanh toán"
//                       description="Vui lòng quét mã QR và hoàn tất thanh toán"
//                       type="info"
//                       showIcon
//                       icon={<ClockCircleOutlined />}
//                     />
//                   )}
//                   {paymentStatus === 'expired' && (
//                     <Alert
//                       message="Mã QR đã hết hạn"
//                       description="Vui lòng quay lại và tạo lại thanh toán để tiếp tục."
//                       type="warning"
//                       showIcon
//                     />
//                   )}
//                   {paymentStatus === 'success' && (
//                     <Alert
//                       message="Thanh toán thành công!"
//                       description="Đang chuyển hướng đến trang xác nhận..."
//                       type="success"
//                       showIcon
//                       icon={<CheckCircleOutlined />}
//                     />
//                   )}
//                 </div>

//                 {/* Test Button (Remove in production) */}
//                 {paymentStatus === 'pending' && (
//                   <div style={{ marginTop: '16px' }}>
//                     <Button 
//                       type="dashed" 
//                       block
//                       onClick={handlePaymentSuccess}
//                       style={{ color: '#52c41a', borderColor: '#52c41a' }}
//                     >
//                       Test: Đã thanh toán
//                     </Button>
//                   </div>
//                 )}

//                 {/* Security Info */}
//                 <div className="security-info" style={{ marginTop: '24px' }}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text type="secondary" style={{ fontSize: '13px' }}>
//                       <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
//                       Giao dịch được bảo mật bởi PayOS
//                     </Text>
//                     <Text type="secondary" style={{ fontSize: '13px' }}>
//                       <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
//                       Không lưu trữ thông tin thẻ tín dụng
//                     </Text>
//                   </Space>
//                 </div>
//               </div>
//             </Card>
//           </Col>

//           {/* Cột phải - Thông tin hóa đơn */}
//           <Col xs={24} md={14}>
//             <Card className="invoice-card">
//               {/* Booking Code */}
//               <div className="invoice-section">
//                 <Text strong style={{ fontSize: '16px' }}>Mã đặt phòng</Text>
//                 <Text code style={{ fontSize: '18px', color: '#1890ff' }}>
//                   {bookingCode || 'Chưa có'}
//                 </Text>
//               </div>

//               <Divider />

//               {/* Booking Details */}
//               {bookingInfo && (
//                 <>
//                   <div className="invoice-section">
//                     <Title level={5}>Chi tiết đặt phòng</Title>
                    
//                     <div className="invoice-item">
//                       <Text type="secondary">Loại phòng:</Text>
//                       <Text strong>{bookingInfo.roomType?.room_type_name}</Text>
//                     </div>
                    
//                     <div className="invoice-item">
//                       <Text type="secondary">Check-in:</Text>
//                       <Text 
//                       strong>{formatDate(bookingInfo.checkIn)}
//                       </Text>
//                     </div>
                    
//                     <div className="invoice-item">
//                       <Text type="secondary">Check-out:</Text>
//                       <Text strong>{formatDate(bookingInfo.checkOut)}</Text>
//                     </div>
                    
//                     <div className="invoice-item">
//                       <Text type="secondary">Số khách:</Text>
//                       <Text strong>
//                         {bookingInfo.guests?.adults || 0} người lớn
//                         {bookingInfo.guests?.children > 0 && `, ${bookingInfo.guests?.children} trẻ em`}
//                       </Text>
//                     </div>

//                     <div className="invoice-item">
//                       <Text type="secondary">Số đêm:</Text>
//                       <Text strong>{nights}</Text>
//                     </div>
//                     <div className="invoice-item">
//                       <Text type="secondary">Số phòng:</Text>
//                       <Text strong>{bookingInfo.numRooms}</Text>
//                     </div>
//                   </div>
//                   <Divider/>
//                 </>
//               )}

//               {/* Services Details */}
//               {selectedServices && selectedServices.length > 0 && (
//                 <>
//                   <div className="invoice-section">
//                     <Title level={5}>Dịch vụ bổ sung</Title>
//                     {selectedServices.map((svc, idx) => (
//                       <div className="invoice-item" key={`${svc.service_id || svc.name}-${idx}`}>
//                         <Text type="secondary">{svc.name} x {svc.quantity || 1}</Text>
//                         <Text>{formatPrice((svc.price || 0) * (svc.quantity || 1))}</Text>
//                       </div>
//                     ))}
//                     <div className="invoice-item">
//                       <Text strong>Tổng dịch vụ</Text>
//                       <Text strong>{formatPrice(servicesTotal)}</Text>
//                     </div>
//                   </div>
//                   <Divider />
//                 </>
//               )}

//               {/* Price Breakdown */}
//               <div className="invoice-section">
//                 <Title level={5}>Chi tiết giá</Title>
                
//                 <div className="invoice-item">
//                   <Text>Phòng</Text>
//                   <Text>{formatPrice(bookingInfo?.roomType?.price_per_night || 0)}</Text>
//                 </div>
                
//                 <div className="invoice-item">
//                   <Text type="secondary">Số đêm: </Text>
//                   <Text type="secondary">
//                     {nights | 0}
//                   </Text>
//                 </div>

               
                
//                 <Divider style={{ margin: '16px 0' }} />
                
//                 <div className="invoice-item total">
//                   <Text strong style={{ fontSize: '18px' }}>Khuyến mãi</Text>
//                   <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
//                     {formatPrice(totalWithServices || 0)}
//                   </Text>
//                 </div>
//                 <div className="invoice-item total">
//                   <Text strong style={{ fontSize: '18px' }}>Tổng cộng</Text>
//                   <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
//                     {formatPrice(totalWithServices || 0)}
//                   </Text>
//                 </div>
//               </div>

//               <Divider />

//               {/* Customer Info */}
//               {bookingInfo?.customerInfo && (
//                 <>
//                   <div className="invoice-section">
//                     <Title level={5}>Thông tin khách hàng</Title>
                    
//                     <div className="invoice-item">
//                       <Text type="secondary">Họ tên:</Text>
//                       <Text>
//                         {bookingInfo.customerInfo.fullName}
//                       </Text>
//                     </div>
                    
//                     <div className="invoice-item">
//                       <Text type="secondary">Email:</Text>
//                       <Text>{bookingInfo.customerInfo.email}</Text>
//                     </div>
//                   </div>

//                   <Divider />
//                 </>
//               )}

//               {/* Payment Info */}
//               <div className="invoice-section">
//                 <Title level={5}>Thông tin thanh toán</Title>
                
//                 <div className="invoice-item">
//                   <Text type="secondary">Mã giao dịch:</Text>
//                   <Text code>{orderCode || 'Chưa có'}</Text>
//                 </div>
                
//                 <div className="invoice-item">
//                   <Text type="secondary">Phương thức:</Text>
//                   <Text>Quét QR Code (PayOS)</Text>
//                 </div>
                
//                 <div className="invoice-item">
//                   <Text type="secondary">Trạng thái:</Text>
//                   {paymentStatus === 'pending' && (
//                     <Text style={{ color: '#faad14' }}>Đang chờ thanh toán</Text>
//                   )}
//                   {paymentStatus === 'success' && (
//                     <Text style={{ color: '#52c41a' }}>Đã thanh toán</Text>
//                   )}
//                 </div>
//               </div>

//               {/* Payment Instruction */}
//               <Alert
//                 message="Hướng dẫn thanh toán"
//                 description={
//                   <ol style={{ margin: 0, paddingLeft: '20px' }}>
//                     <li>Mở ứng dụng ngân hàng trên điện thoại</li>
//                     <li>Quét mã QR code bên trái</li>
//                     <li>Xác nhận thanh toán trong ứng dụng</li>
//                     <li>Chờ xác nhận tự động</li>
//                   </ol>
//                 }
//                 type="info"
//                 showIcon
//                 style={{ marginTop: '24px' }}
//               />
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </div>
//   )
// }

// export default Payment

import React, { useState, useEffect } from 'react'
import { 
  Card, Row, Col, Typography, Space, Divider, 
  Alert, Spin, message, Button, Steps, Tag
} from 'antd'
import { 
  QrcodeOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SafetyCertificateOutlined, HomeOutlined, SolutionOutlined, CreditCardOutlined,
  ScanOutlined, CopyOutlined , UserOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'antd/es/qr-code'
import formatPrice from '../../utils/formatPrice'
import { calculateNights, checkPaymentStatus, findBookingByCode, formatDate } from '../../services/booking.service'
import { getPendingPayment, clearPendingPayment, getRemainingTime, getPendingPaymentByIdentifier, removePendingPayment } from '../../utils/pendingPayment.util'
import { useAuth } from '../../context/AuthContext'
import './Payment.css'

const { Title, Text } = Typography

const Payment = () => {
  // --- GIỮ NGUYÊN LOGIC CŨ ---
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [remainingSeconds, setRemainingSeconds] = useState(1800) 
  
  const stateData = location.state || {}

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const userId = user?.user_id || user?.id || storedUser?.user_id || storedUser?.id || storedUser?.userId || null

  const bookingData = (() => {
    let booking = null
    const identifierCandidates = [
      stateData?.tempBookingKey,
      stateData?.orderCode,
      stateData?.bookingCode,
      stateData?.bookingData?.tempBookingKey,
      stateData?.bookingData?.orderCode,
      stateData?.bookingData?.bookingCode
    ].filter(Boolean)

    if (userId && identifierCandidates.length > 0) {
      for (const identifier of identifierCandidates) {
        booking = getPendingPaymentByIdentifier(userId, identifier)
        if (booking) break
      }
    }

    if (!booking && stateData?.bookingData) booking = stateData.bookingData
    if (!booking && userId) booking = getPendingPayment(userId)
    if (!booking) booking = getPendingPayment()

    return booking
  })()
  
  useEffect(() => {
    if (bookingData && bookingData.bookingInfo) {
      if (bookingData.expiresAt) {
        const now = Date.now()
        const expiry = typeof bookingData.expiresAt === 'string' 
          ? new Date(bookingData.expiresAt).getTime() 
          : bookingData.expiresAt
        const remaining = Math.max(Math.floor((expiry - now) / 1000), 0)
        if (remaining > 0) {
          setRemainingSeconds(remaining)
          return
        }
      }
      
      const initialRemain = getRemainingTime()
      if (initialRemain > 0) {
        setRemainingSeconds(initialRemain)
      } else {
        if (bookingData.createdAt) {
          const createdAt = typeof bookingData.createdAt === 'string'
            ? new Date(bookingData.createdAt).getTime()
            : bookingData.createdAt
          const now = Date.now()
          const elapsed = Math.floor((now - createdAt) / 1000)
          const remaining = Math.max(1800 - elapsed, 0)
          setRemainingSeconds(remaining)
        } else {
          setRemainingSeconds(1800)
        }
      }
    } else {
      message.error('Thông tin thanh toán không hợp lệ')
      navigate('/')
    }
  }, [])

  useEffect(() => {
    if (remainingSeconds <= 0 || paymentStatus !== 'pending') {
      if (remainingSeconds <= 0 && paymentStatus === 'pending') {
        setPaymentStatus('expired')
      }
      return
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingSeconds, paymentStatus])

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const {
    qrCode,
    bookingCode,
    orderCode,
    bookingInfo,
    tempBookingKey,
    selectedServices = []
  } = bookingData || {}
  
  const nights = bookingInfo ? calculateNights(bookingInfo.checkIn, bookingInfo.checkOut) : 0
  const roomSubtotal = bookingInfo?.roomType?.price_per_night * nights || 0
  const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0)
  const totalWithServices = roomSubtotal + servicesTotal

  useEffect(() => {
    if (!bookingCode || paymentStatus === 'success') return
    const checkBookingStatus = async () => {
      try {
        const response = await findBookingByCode(bookingCode)
        const booking = response?.booking || response?.data?.booking
        if (booking) {
          setPaymentStatus('success')
          
          if (userId) {
            if (orderCode) removePendingPayment(userId, orderCode)
            if (bookingCode) removePendingPayment(userId, bookingCode)
            if (tempBookingKey) removePendingPayment(userId, tempBookingKey)
          } else {
            clearPendingPayment()
          }
          
          setTimeout(() => {
            const successUrl = `/payment/success?code=00&id=${encodeURIComponent(orderCode || bookingCode || tempBookingKey || ''|| booking?.booking_code)}&cancel=false&status=PAID&orderCode=${encodeURIComponent(orderCode || '')}`
            navigate(successUrl, { replace: true })
          }, 500)
        }
      } catch (error) {}
    }

    checkBookingStatus()
    const intervalId = setInterval(checkBookingStatus, 5000)
    return () => clearInterval(intervalId)
  }, [bookingCode, paymentStatus, orderCode, tempBookingKey, userId])

  const handlePaymentSuccess = async () => {
    if (paymentStatus === 'success') return
    try {
      if (bookingCode) {
        try {
          const response = await findBookingByCode(bookingCode)
          const booking = response?.booking || response?.data?.booking
          
          if (booking) {
            setPaymentStatus('success')
            if (userId) {
              if (orderCode) removePendingPayment(userId, orderCode)
              if (bookingCode) removePendingPayment(userId, bookingCode)
              if (tempBookingKey) removePendingPayment(userId, tempBookingKey)
            } else {
              clearPendingPayment()
            }
            return
          }
        } catch (error) {}
      }
      
      const buyerName = bookingInfo?.customerInfo?.fullName || ''
      const buyerEmail = bookingInfo?.customerInfo?.email || ''
      const res = await checkPaymentStatus({
        orderCode : orderCode,
        status : "PAID",
        buyerName,
        buyerEmail,
      })
      const data = res?.data || res
      if (data?.status === 'success' || data?.statusCode === 200) {
        if (userId) {
          if (orderCode) removePendingPayment(userId, orderCode)
          if (bookingCode && !orderCode) removePendingPayment(userId, bookingCode)
          if (tempBookingKey && !orderCode && !bookingCode) removePendingPayment(userId, tempBookingKey)
        } else {
          clearPendingPayment()
        }
      } else {
        message.error('Thanh toán chưa được xác nhận. Vui lòng thử lại.')
      }
    } catch (err) {
      message.error('Không thể xác nhận thanh toán. Vui lòng thử lại.')
    }
  }


  return (
    <div className="luxury-payment-page">
      <div className="luxury-container">
        
        {/* Steps Indicator */}
        <div className="steps-wrapper">
          <Steps 
            current={2} 
            items={[
              { title: 'Chọn phòng', icon: <HomeOutlined /> },
              { title: 'Thông tin & Dịch vụ', icon: <SolutionOutlined /> },
              { title: 'Thanh toán', icon: <CreditCardOutlined /> },
            ]} 
          />
        </div>

        <div className="payment-header">
          <Title level={2}>Cổng thanh toán an toàn</Title>
          <Text type="secondary">Hoàn tất giao dịch để giữ phòng của bạn</Text>
        </div>

        <Row gutter={40} align="stretch">
          {/* LEFT COLUMN: Payment Area */}
          <Col xs={24} md={13}>
            <Card className="luxury-card payment-zone-card" bordered={false}>
              <div className="payment-zone-header">
                <div className="method-badge">
                  <ScanOutlined /> PayOS QR
                </div>
                <div className={`timer-badge ${remainingSeconds <= 300 ? 'urgent' : ''}`}>
                  <ClockCircleOutlined /> {formatCountdown(remainingSeconds)}
                </div>
              </div>

              <div className="qr-display-area">
                {qrCode && paymentStatus !== 'expired' ? (
                  <>
                    <div className="qr-frame">
                      <QRCode 
                        value={qrCode} 
                        size={220} 
                        iconSize={40}
                        errorLevel="H"
                        style={{ padding: 10, background: 'white', borderRadius: 8 }}
                      />
                      <div className="scan-line"></div>
                    </div>
                    <Text className="scan-instruction">
                      Mở ứng dụng ngân hàng <br/> và quét mã để thanh toán
                    </Text>
                  </>
                ) : (
                  <div className="qr-placeholder">
                    <Spin size="large" />
                    <Text>{paymentStatus === 'expired' ? 'Mã QR đã hết hạn' : 'Đang tạo mã QR...'}</Text>
                  </div>
                )}
              </div>

              {/* Status & Alerts */}
              <div className="status-area">
                {paymentStatus === 'pending' && (
                  <Alert
                    message="Đang chờ thanh toán..."
                    description="Giao dịch sẽ tự động được xác nhận sau khi bạn chuyển khoản."
                    type="info"
                    showIcon
                    className="luxury-alert"
                  />
                )}
                {paymentStatus === 'expired' && (
                  <Alert
                    message="Đơn hàng đã hết hạn"
                    description="Vui lòng thực hiện lại quy trình đặt phòng."
                    type="error"
                    showIcon
                    className="luxury-alert"
                  />
                )}
                {paymentStatus === 'success' && (
                  <Alert
                    message="Thanh toán thành công!"
                    type="success"
                    showIcon
                    className="luxury-alert"
                  />
                )}
              </div>

              {/* Dev/Test Button */}
              {paymentStatus === 'pending' && (
                <Button 
                  type="dashed" 
                  block 
                  onClick={handlePaymentSuccess}
                  className="test-btn"
                >
                  (Test) Giả lập đã thanh toán
                </Button>
              )}

              <div className="security-badges">
                <Space size="large">
                  <span className="sec-item"><SafetyCertificateOutlined /> Bảo mật tuyệt đối</span>
                  <span className="sec-item"><CreditCardOutlined /> Không lưu thẻ</span>
                </Space>
              </div>
            </Card>
          </Col>

          {/* RIGHT COLUMN: Receipt / Invoice */}
          <Col xs={24} md={11}>
            <div className="receipt-wrapper">
              <Card className="luxury-card receipt-card" bordered={false}>
                <div className="receipt-header">
                  <Title level={4}>HÓA ĐƠN TẠM TÍNH</Title>
                  <Text type="secondary">Mã đặt phòng: <strong className="code-highlight">{bookingCode || '---'}</strong></Text>
                </div>
                
                <div className="zigzag-divider"></div>

                <div className="receipt-body">
                  {/* Room Details */}
                  <div className="receipt-section">
                    <div className="receipt-row">
                      <span className="label">Loại phòng</span>
                      <span className="value highlight">{bookingInfo?.roomType?.room_type_name}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Thời gian</span>
                      <span className="value">
                        {formatDate(bookingInfo?.checkIn)} - {formatDate(bookingInfo?.checkOut)}
                      </span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Thời lượng</span>
                      <span className="value">{bookingInfo?.numRooms} phòng &times; {nights} đêm</span>
                    </div>
                  </div>

                  <Divider className="light-divider" />

                  {/* Pricing */}
                  <div className="receipt-section">
                    <div className="receipt-row">
                      <span className="label">Giá phòng</span>
                      <span className="value">{formatPrice(roomSubtotal)}</span>
                    </div>
                    
                    {selectedServices.length > 0 && (
                      <div className="receipt-services">
                        <div className="service-header">Dịch vụ bổ sung:</div>
                        {selectedServices.map((svc, idx) => (
                          <div key={idx} className="receipt-row sub-row">
                            <span className="label">• {svc.name} (x{svc.quantity})</span>
                            <span className="value">{formatPrice(svc.price * svc.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Divider className="bold-divider" />

                  <div className="receipt-total">
                    <span>TỔNG THANH TOÁN</span>
                    <span className="total-amount">{formatPrice(totalWithServices)}</span>
                  </div>
                  
                  {bookingInfo?.customerInfo && (
                    <div className="customer-mini-info">
                      <UserOutlined /> {bookingInfo.customerInfo.fullName} <br/>
                      <span className="email">{bookingInfo.customerInfo.email}</span>
                    </div>
                  )}
                </div>
                
                {/* Footer Receipt */}
                <div className="receipt-footer">
                  <Text type="secondary" style={{fontSize: 12}}>Cảm ơn bạn đã lựa chọn Bean Hotel</Text>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Payment
