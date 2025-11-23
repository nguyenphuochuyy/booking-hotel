// // import React, { useState, useEffect } from 'react'
// // import { 
// //   Card, Button, Typography, Space, Divider, 
// //   Alert, Result, Tag, Spin, message
// // } from 'antd'
// // import { 
// //   CheckCircleOutlined, CloseCircleOutlined, HomeOutlined
// // } from '@ant-design/icons'
// // import { useSearchParams, useNavigate } from 'react-router-dom'
// // import { 
// //   getBookingById, 
// //   formatPrice, 
// //   formatDate, 
// //   calculateNights,
// //   downloadInvoicePDF,
// //   getPaymentStatusText,
// //   getPaymentStatusColor,
// //   getUserBookings
// // } from '../../services/booking.service'
// // import httpClient from '../../services/httpClient'
// // import { getPendingPayment, clearPendingPayment, removePendingPayment, getAllPendingPayments } from '../../utils/pendingPayment.util'
// // import './PaymentSuccess.css'
// // import { useAuth } from '../../context/AuthContext'

// // const { Title, Text } = Typography

// // const PaymentSuccess = () => {
// //   const [searchParams] = useSearchParams()
// //   const navigate = useNavigate()
// //   const { user } = useAuth()
// //   const [loading, setLoading] = useState(true)
// //   const [booking, setBooking] = useState(null)
// //   const [error, setError] = useState(null)

// //   // Parse query params từ URL
// //   const code = searchParams.get('code')
// //   const id = searchParams.get('id')
// //   const cancel = searchParams.get('cancel')
// //   const status = searchParams.get('status')
// //   const orderCode = searchParams.get('orderCode')

// //   // Xác định trạng thái thanh toán
// //   const isSuccess = code === '00' && status === 'PAID' && cancel === 'false'
// //   const isFailed = code !== '00' || status !== 'PAID' || cancel === 'true'

// //   useEffect(() => {
// //     fetchBookingData()
// //   }, [orderCode, code, status])

// //   // Tìm booking theo orderCode từ webhook PayOS
// //   const fetchBookingData = async () => {
// //     try {
// //       setLoading(true)
// //       setError(null)
      
// //       // Lấy userId từ user context hoặc localStorage
// //       const storedUser = (() => {
// //         try {
// //           const raw = localStorage.getItem('user')
// //           return raw ? JSON.parse(raw) : null
// //         } catch {
// //           return null
// //         }
// //       })()
// //       const userId = user?.user_id || user?.id || storedUser?.user_id || storedUser?.id || storedUser?.userId || null
      
// //       // Ưu tiên: Nếu có orderCode từ query params (từ webhook PayOS), xóa booking trong localStorage ngay
// //       if (orderCode && userId && isSuccess) {
// //         console.log(`[PaymentSuccess] Xóa booking có orderCode từ webhook: ${orderCode}`)
// //         const removed = removePendingPayment(userId, orderCode)
// //         if (removed) {
// //           console.log(`[PaymentSuccess] Đã xóa booking có orderCode: ${orderCode}`)
// //         }
        
// //         // Xóa các temp booking cũ (tương thích ngược)
// //         localStorage.removeItem('temp_booking_key')
// //         localStorage.removeItem('temp_booking_info')
// //       }
      
// //       // Tìm booking từ backend theo orderCode (thông qua payment transaction_id)
// //       if (orderCode) {
// //         try {
// //           const response = await getUserBookings({ limit: 1000 })
// //           const bookings = response?.bookings || response?.data?.bookings || []
          
// //           // Tìm booking có payment với transaction_id = orderCode
// //           for (const b of bookings) {
// //             try {
// //               const bookingDetail = await getBookingById(b.booking_id)
// //               const payments = bookingDetail?.booking?.payments || []
// //               const payment = payments.find(p => 
// //                 p.transaction_id === orderCode || 
// //                 p.transaction_id === orderCode?.toString() ||
// //                 p.order_code === orderCode ||
// //                 p.order_code === orderCode?.toString()
// //               )
              
// //               if (payment) {
// //                 setBooking(bookingDetail?.booking || bookingDetail)
// //                 // Đảm bảo xóa booking trong localStorage (đã xóa ở trên nhưng xóa lại để chắc chắn)
// //                 if (userId && orderCode) {
// //                   removePendingPayment(userId, orderCode)
// //                 }
// //                 return
// //               }
// //             } catch (err) {
// //               console.error('Error checking booking:', err)
// //             }
// //           }
// //         } catch (err) {
// //           console.error('Error fetching bookings by orderCode:', err)
// //         }
// //       }
      
// //       // Fallback: Thử lấy booking_code từ localStorage (nếu có)
// //       const pendingPayment = getPendingPayment(userId)
// //       const bookingCode = pendingPayment?.bookingCode || null

// //       // Nếu có bookingCode, tìm booking theo code bằng API findBookingByCode
// //       if (bookingCode) {
// //         try {
// //           const response = await httpClient.get(`/bookings/code/${bookingCode}`)
// //           const bookingData = response?.booking || response?.data?.booking
          
// //           if (bookingData) {
// //             // Lấy chi tiết đầy đủ booking bằng ID
// //             try {
// //               const bookingDetail = await getBookingById(bookingData.booking_id)
// //               console.log("bookingDetail", bookingDetail);
              
// //               setBooking(bookingDetail?.booking || bookingDetail || bookingData)
// //             } catch (err) {
// //               // Nếu không lấy được chi tiết, dùng dữ liệu từ findBookingByCode
// //               setBooking(bookingData)
// //             }
// //             // Xóa pendingPayment và temp booking sau khi lấy được booking
// //             clearPendingPayment()
            
// //             // Xóa temp booking từ danh sách theo userId
// //             const bookingCode = pendingPayment?.bookingCode || bookingData?.booking_code
// //             const orderCode = pendingPayment?.orderCode || bookingData?.payos_order_code
// //             const tempBookingKey = pendingPayment?.tempBookingKey
            
// //             // Lấy userId từ pendingPayment, user context hoặc từ localStorage
// //             const userId = pendingPayment?.userId || user?.user_id || user?.id || null
// //             if (userId && (bookingCode || orderCode || tempBookingKey)) {
// //               // Xóa temp booking theo bookingCode, orderCode hoặc tempBookingKey
// //               if (bookingCode) {
// //                 removePendingPayment(userId, bookingCode)
// //               }
// //               if (orderCode) {
// //                 removePendingPayment(userId, orderCode)
// //               }
// //               if (tempBookingKey) {
// //                 removePendingPayment(userId, tempBookingKey)
// //               }
// //             }
            
// //             // Xóa temp booking cũ (tương thích ngược)
// //             localStorage.removeItem('temp_booking_key')
// //             localStorage.removeItem('temp_booking_info')
// //             return
// //           }
// //         } catch (err) {
// //           console.error('Error fetching booking by code:', err)
// //           // Tiếp tục tìm bằng cách khác
// //         }
// //       }

// //       // Nếu không tìm thấy booking, vẫn hiển thị thông tin thanh toán từ query params
// //       // (Đã xóa booking trong localStorage ở trên nếu có orderCode)
// //     } catch (err) {
// //       console.error('Error fetching booking data:', err)
// //       setError('Không thể tải thông tin đặt phòng. Vui lòng thử lại sau.')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // Xử lý tải hóa đơn PDF
// //   const handleDownloadInvoice = async () => {
// //     if (!booking?.booking_id) {
// //       message.warning('Không có thông tin đặt phòng để tải hóa đơn')
// //       return
// //     }

// //     try {
// //       message.loading({ content: 'Đang tải hóa đơn...', key: 'downloadInvoice' })
// //       const blob = await downloadInvoicePDF(booking.booking_id)
// //       // Tạo URL và tải file
// //       const url = window.URL.createObjectURL(blob)
// //       const link = document.createElement('a')
// //       link.href = url
// //       link.download = `hoa-don-${booking.booking_code || booking.booking_id}.pdf`
// //       document.body.appendChild(link)
// //       link.click()
// //       document.body.removeChild(link)
// //       window.URL.revokeObjectURL(url)
// //       message.success({ content: 'Đã tải hóa đơn thành công!', key: 'downloadInvoice' })
// //     } catch (err) {
// //       console.error('Error downloading invoice:', err)
// //       message.error({ content: 'Không thể tải hóa đơn. Vui lòng thử lại.', key: 'downloadInvoice' })
// //     }
// //   }

// //   // Xử lý in hóa đơn
// //   const handlePrintInvoice = async () => {
// //     if (!booking?.booking_id) {
// //       message.warning('Không có thông tin đặt phòng để in hóa đơn')
// //       return
// //     }

// //     try {
// //       message.loading({ content: 'Đang tải hóa đơn...', key: 'printInvoice' })
// //       const blob = await downloadInvoicePDF(booking.booking_id)
      
// //       // Tạo URL và mở cửa sổ in
// //       const url = window.URL.createObjectURL(blob)
// //       const printWindow = window.open(url, '_blank')
      
// //       if (printWindow) {
// //         printWindow.onload = () => {
// //           printWindow.print()
// //         }
// //       }
      
// //       message.success({ content: 'Đã mở cửa sổ in!', key: 'printInvoice' })
// //     } catch (err) {
// //       console.error('Error printing invoice:', err)
// //       message.error({ content: 'Không thể in hóa đơn. Vui lòng thử lại.', key: 'printInvoice' })
// //     }
// //   }

// //   const handleGoHome = () => {
// //     // Nếu tab này được mở từ window.open (tab thanh toán)
// //     if (window.opener && !window.opener.closed) {
// //       // Focus và navigate tab gốc về trang chủ
// //       window.opener.location.href = '/'
// //       window.opener.focus()
// //       // Đóng tab thanh toán hiện tại
// //       window.close()
// //     } else {
// //       // Nếu không phải tab mới, navigate bình thường
// //       navigate('/')
// //     }
// //   }

// //   const handleViewBookings = () => {
// //     navigate('/user/bookings')
// //   }

// //   // Tính toán các giá trị
// //   const nights = booking ? calculateNights(booking.check_in_date, booking.check_out_date) : 0
// //   const services = booking?.booking_services || booking?.services || []
// //   const servicesTotal = services.reduce((sum, s) => sum + (Number(s.total_price) || 0), 0)
// //   const roomPrice = booking?.room_type?.price_per_night || 0
// //   const roomTotal = roomPrice * nights * (booking?.num_rooms || 1)
// //   const totalPrice = booking?.final_price || booking?.total_price || (roomTotal + servicesTotal)

// //   if (loading) {
// //     return (
// //       <div className="payment-success-page">
// //         <div className="container">
// //           <Spin size="large" tip="Đang tải thông tin thanh toán..." />
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="payment-success-page">
// //       <div className="container">
// //         {/* Payment Status Header */}
// //         <div className="payment-status-header">
// //           {isSuccess ? (
// //             <Result
// //               status="success"
// //               icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
// //               title="Thanh toán thành công!"
// //               subTitle={
// //                 <div>
// //                   <Text type="secondary">
// //                     Giao dịch của bạn đã được xử lý thành công
// //                   </Text>
// //                   {orderCode && (
// //                     <>
// //                       <br />
// //                       <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
// //                         Mã giao dịch: {orderCode}
// //                       </Text>
// //                     </>
// //                   )}
// //                 </div>
// //               }
// //             />
// //           ) : (
// //             <Result
// //               status="error"
// //               icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
// //               title="Thanh toán không thành công"
// //               subTitle={
// //                 <div>
// //                   <Text type="secondary">
// //                     Giao dịch của bạn không thể hoàn tất
// //                   </Text>
// //                   {orderCode && (
// //                     <>
// //                       <br />
// //                       <Text strong style={{ fontSize: 16 }}>
// //                         Mã giao dịch: {orderCode}
// //                       </Text>
// //                     </>
// //                   )}
// //                 </div>
// //               }
// //             />
// //           )}
// //         </div>

// //         {error && !booking && (
// //           <Alert
// //             message="Thông báo"
// //             description={error}
// //             type="warning"
// //             showIcon
// //             style={{ marginBottom: 24 }}
// //           />
// //         )}

// //         {booking && (
// //           <Card className="booking-info-card">
// //             <div className="booking-info-content">
// //               <div className="info-row">
// //                 <Text type="secondary">Mã đặt phòng:</Text>
// //                 <Text code strong style={{ fontSize: 16 }}>
// //                   {booking.booking_code}
// //                 </Text>
// //               </div>

// //               <Divider style={{ margin: '16px 0' }} />

// //               <div className="info-row">
// //                 <Text type="secondary">Loại phòng:</Text>
// //                 <Text strong>{booking.room_type?.room_type_name || 'N/A'}</Text>
// //               </div>

// //               <div className="info-row">
// //                 <Text type="secondary">Số lượng:</Text>
// //                 <Text strong>{booking.num_rooms || booking.rooms?.length || 0} phòng</Text>
// //               </div>

// //               <div className="info-row">
// //                 <Text type="secondary">Số khách:</Text>
// //                 <Text strong>{booking.num_person || 0} người</Text>
// //               </div>

// //               <div className="info-row">
// //                 <Text type="secondary">Số đêm:</Text>
// //                 <Text strong>{nights} đêm</Text>
// //               </div>

// //               <Divider style={{ margin: '16px 0' }} />

// //               <div className="info-row">
// //                 <Text type="secondary">Tổng tiền:</Text>
// //                 <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
// //                   {formatPrice(totalPrice)}
// //                 </Text>
// //               </div>

// //               <div className="info-row">
// //                 <Text type="secondary">Trạng thái thanh toán:</Text>
// //                 <Tag color={getPaymentStatusColor(status === 'PAID' ? 'paid' : 'pending')}>
// //                   {getPaymentStatusText(status === 'PAID' ? 'paid' : 'pending')}
// //                 </Tag>
// //               </div>
// //             </div>

// //             <Divider />

// //             <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
// //               <Button
// //                 type="primary"
// //                 size="large"
// //                 icon={<HomeOutlined />}
// //                 onClick={handleGoHome}
// //               >
// //                 Về trang chủ
// //               </Button>
// //               <Button
// //                 size="large"
// //                 onClick={handleViewBookings}
// //               >
// //                 Xem lịch sử đặt phòng
// //               </Button>
// //             </Space>
// //           </Card>
// //         )}

// //         {/* Nếu không có booking nhưng thanh toán thành công */}
// //         {!booking && isSuccess && (
// //           <Card>
// //             <Alert
// //               message="Thanh toán đã được xử lý"
// //               description={
// //                 <div>
// //                   <p>Giao dịch của bạn đã được xử lý thành công với mã: <Text code>{orderCode}</Text></p>
// //                   <p>Vui lòng kiểm tra email hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ.</p>
// //                 </div>
// //               }
// //               type="success"
// //               showIcon
// //             />
// //             <div style={{ marginTop: 16 }}>
// //               <Button type="primary" onClick={handleGoHome}>
// //                 Về trang chủ
// //               </Button>
// //               <Button onClick={handleViewBookings} style={{ marginLeft: 8 }}>
// //                 Xem lịch sử đặt phòng
// //               </Button>
// //             </div>
// //           </Card>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// // export default PaymentSuccess
// import React, { useState, useEffect } from 'react'
// import { 
//   Card, Button, Typography, Space, Divider, 
//   Result, Tag, Spin, message, Row, Col, Image
// } from 'antd'
// import { 
//   CheckCircleFilled, 
//   HomeOutlined, 
//   FilePdfOutlined, 
//   PrinterOutlined,
//   CalendarOutlined,
//   UserOutlined,
//   EnvironmentOutlined,
//   CopyOutlined
// } from '@ant-design/icons'
// import { useSearchParams, useNavigate } from 'react-router-dom'
// import { 
//   getBookingById, 
//   formatPrice, 
//   formatDate, 
//   calculateNights,
//   downloadInvoicePDF,
//   getUserBookings
// } from '../../services/booking.service'
// import httpClient from '../../services/httpClient'
// import { getPendingPayment, clearPendingPayment, removePendingPayment } from '../../utils/pendingPayment.util'
// import { useAuth } from '../../context/AuthContext'
// import './PaymentSuccess.css'

// const { Title, Text } = Typography

// const PaymentSuccess = () => {
//   // --- GIỮ NGUYÊN LOGIC CŨ ---
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { user } = useAuth()
//   const [loading, setLoading] = useState(true)
//   const [booking, setBooking] = useState(null)
//   const [error, setError] = useState(null)

//   const code = searchParams.get('code')
//   const cancel = searchParams.get('cancel')
//   const status = searchParams.get('status')
//   const orderCode = searchParams.get('orderCode')
//   const isSuccess = code === '00' && status === 'PAID' && cancel === 'false'

//   useEffect(() => {
//     fetchBookingData()    
    
//   }, [orderCode, code, status])

//   const fetchBookingData = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const storedUser = (() => {
//         try {
//           const raw = localStorage.getItem('user')
//           return raw ? JSON.parse(raw) : null
//         } catch {
//           return null
//         }
//       })()
//       const userId = user?.user_id || user?.id || storedUser?.user_id || storedUser?.id || storedUser?.userId || null
      
//       if (orderCode && userId && isSuccess) {
//         removePendingPayment(userId, orderCode)
//         localStorage.removeItem('temp_booking_key')
//         localStorage.removeItem('temp_booking_info')
//       }
      
//       if (orderCode) {
//         try {
//           const response = await getUserBookings({ limit: 1000 })
//           const bookings = response?.bookings || response?.data?.bookings || []
          
//           for (const b of bookings) {
//             try {
//               const bookingDetail = await getBookingById(b.booking_id)
//               const payments = bookingDetail?.booking?.payments || []
//               const payment = payments.find(p => 
//                 p.transaction_id === orderCode || 
//                 p.transaction_id === orderCode?.toString() ||
//                 p.order_code === orderCode ||
//                 p.order_code === orderCode?.toString()
//               )
              
//               if (payment) {
//                 setBooking(bookingDetail?.booking || bookingDetail)
                
//                 if (userId && orderCode) removePendingPayment(userId, orderCode)
//                 return
//               }
//             } catch (err) {}
//           }
//         } catch (err) {}
//       }
      
//       const pendingPayment = getPendingPayment(userId)
//       const bookingCode = pendingPayment?.bookingCode || null

//       if (bookingCode) {
//         try {
//           const response = await httpClient.get(`/bookings/code/${bookingCode}`)
//           const bookingData = response?.booking || response?.data?.booking
//           if (bookingData) {
//             try {
//               const bookingDetail = await getBookingById(bookingData.booking_id)
//               setBooking(bookingDetail?.booking || bookingDetail || bookingData)
//             } catch (err) {
//               setBooking(bookingData)
//             }
//             clearPendingPayment()
            
//             const bkCode = pendingPayment?.bookingCode || bookingData?.booking_code
//             const ordCode = pendingPayment?.orderCode || bookingData?.payos_order_code
//             const tmpKey = pendingPayment?.tempBookingKey
//             const uId = pendingPayment?.userId || user?.user_id || user?.id || null
            
//             if (uId) {
//               if (bkCode) removePendingPayment(uId, bkCode)
//               if (ordCode) removePendingPayment(uId, ordCode)
//               if (tmpKey) removePendingPayment(uId, tmpKey)
//             }
//             localStorage.removeItem('temp_booking_key')
//             localStorage.removeItem('temp_booking_info')
//             return
//           }
//         } catch (err) {}
//       }
//     } catch (err) {
//       setError('Không thể tải thông tin đặt phòng. Vui lòng kiểm tra lại lịch sử.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDownloadInvoice = async () => {
//     if (!booking?.booking_id) return message.warning('Không có thông tin đặt phòng')
//     try {
//       message.loading({ content: 'Đang tải hóa đơn...', key: 'downloadInvoice' })
//       const blob = await downloadInvoicePDF(booking.booking_id)
//       const url = window.URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = `hoa-don-${booking.booking_code || booking.booking_id}.pdf`
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//       window.URL.revokeObjectURL(url)
//       message.success({ content: 'Đã tải hóa đơn thành công!', key: 'downloadInvoice' })
//     } catch (err) {
//       message.error({ content: 'Lỗi khi tải hóa đơn', key: 'downloadInvoice' })
//     }
//   }

//   const handlePrintInvoice = async () => {
//     if (!booking?.booking_id) return message.warning('Không có thông tin')
//     try {
//       message.loading({ content: 'Chuẩn bị in...', key: 'printInvoice' })
//       const blob = await downloadInvoicePDF(booking.booking_id)
//       const url = window.URL.createObjectURL(blob)
//       const printWindow = window.open(url, '_blank')
//       if (printWindow) {
//         printWindow.onload = () => printWindow.print()
//       }
//       message.success({ content: 'Đã mở cửa sổ in!', key: 'printInvoice' })
//     } catch (err) {
//       message.error({ content: 'Lỗi khi in hóa đơn', key: 'printInvoice' })
//     }
//   }

//   const handleGoHome = () => {
//     if (window.opener && !window.opener.closed) {
//       window.opener.location.href = '/'
//       window.opener.focus()
//       window.close()
//     } else {
//       navigate('/')
//     }
//   }

//   // Calculations
//   const nights = booking ? calculateNights(booking.check_in_date, booking.check_out_date) : 0
//   const roomPrice = booking?.room_type?.price_per_night || 0
//   const numRooms = booking?.num_rooms || 1
//   const services = booking?.booking_services || booking?.services || []
//   const servicesTotal = services.reduce((sum, s) => sum + (Number(s.total_price) || Number(s.price) || 0), 0)
//   const roomTotal = roomPrice * nights * numRooms
//   const subtotal = roomTotal + servicesTotal
//   const finalPrice = booking?.final_price || booking?.total_price || subtotal
//   const discountAmount = subtotal - finalPrice


//   if (loading) {
//     return (
//       <div className="payment-success-page loading-state">
//         <Spin size="large" tip="Đang xác nhận giao dịch..." />
//       </div>
//     )
//   }

//   // Trường hợp thất bại
//   if (!isSuccess) {
//     return (
//       <div className="payment-success-page">
//         <div className="container-narrow">
//           <Card className="luxury-card result-card error">
//             <Result
//               status="error"
//               title="Thanh toán thất bại"
//               subTitle="Giao dịch của bạn không thể hoàn tất hoặc đã bị hủy."
//               extra={[
//                 <Button type="primary" key="retry" onClick={() => navigate(-1)}>Thử lại</Button>,
//                 <Button key="home" onClick={handleGoHome}>Về trang chủ</Button>,
//               ]}
//             >
//               <div className="desc">
//                 <Text type="secondary">Mã lỗi: {code || 'Unknown'}</Text>
//               </div>
//             </Result>
//           </Card>
//         </div>
//       </div>
//     )
//   }

//   // Trường hợp thành công nhưng chưa load được booking (hiếm gặp)
//   if (!booking && isSuccess) {
//     return (
//       <div className="payment-success-page">
//         <div className="container-narrow">
//           <Card className="luxury-card result-card">
//             <Result
//               status="success"
//               title="Thanh toán thành công!"
//               subTitle={`Mã giao dịch: ${orderCode}. Hệ thống đang xử lý đơn đặt phòng của bạn.`}
//               extra={[
//                 <Button type="primary" key="home" onClick={handleGoHome}>Về trang chủ</Button>,
//                 <Button key="history" onClick={() => navigate('/user/bookings')}>Lịch sử đặt phòng</Button>
//               ]}
//             />
//           </Card>
//         </div>
//       </div>
//     )
//   }

//   // GIAO DIỆN CHÍNH: THÀNH CÔNG VÀ CÓ BOOKING INFO
//   return (
//     <div className="payment-success-page">
//       <div className="container-narrow">
        
//         {/* Success Banner */}
//         <div className="success-banner">
//           <CheckCircleFilled className="success-icon" />
//           <Title level={2} className="success-title">Đặt phòng thành công!</Title>
//           <Text className="success-subtitle">Cảm ơn bạn đã lựa chọn Bean Hotel cho kỳ nghỉ của mình.</Text>
//         </div>

//         <Card className="luxury-card booking-ticket" bordered={false}>
//           {/* Header Ticket */}
//           <div className="ticket-header">
//             <div className="ticket-row">
//               <div className="ticket-col">
//                 <Text type="secondary">Mã đặt phòng</Text>
//                 <Title level={3} className="booking-code" copyable>{booking.booking_code}</Title>
//               </div>
//               <div className="ticket-col text-right">
//                 <Tag color="success" className="status-tag">ĐÃ THANH TOÁN</Tag>
//               </div>
//             </div>
//           </div>

//           <Divider className="dashed-divider" />

//           {/* Room Info with Image */}
//           <div className="room-info-section">
//             <Row gutter={24} align="middle">
//               <Col xs={24} sm={8}>
//                 <div className="room-image-wrapper">
//                   <Image 
//                     src={booking.room_type?.images?.[0]} 
//                     fallback="https://via.placeholder.com/300x200?text=Bean+Hotel"
//                     alt="Room"
//                     preview={false}
//                     className="room-thumb-large"
//                   />
//                 </div>
//               </Col>
//               <Col xs={24} sm={16}>
//                 <Title level={4} className="room-name">{booking.room_type?.room_type_name}</Title>
//                 <div className="hotel-location">
//                   <EnvironmentOutlined /> Bean Hotel Luxury Resort
//                 </div>
//                 <div className="room-meta-grid">
//                   <div className="meta-item">
//                     <UserOutlined /> {booking.num_person || 2} Khách
//                   </div>
//                   <div className="meta-item">
//                     <HomeOutlined /> {booking.num_rooms || 1} Phòng
//                   </div>
//                 </div>
//               </Col>
//             </Row>
//           </div>

//           <div className="date-grid">
//             <div className="date-box">
//               <Text type="secondary">Nhận phòng</Text>
//               <div className="date-val">
//                 <CalendarOutlined /> {formatDate(booking.check_in_date)}
//               </div>
//               <Text type="secondary" style={{fontSize: 12}}>Từ 14:00</Text>
//             </div>
//             <div className="night-count">
//               <span className="moon-icon">🌙</span>
//               <span>{nights} đêm</span>
//               <div className="line"></div>
//             </div>
//             <div className="date-box text-right">
//               <Text type="secondary">Trả phòng</Text>
//               <div className="date-val">
//                 {formatDate(booking.check_out_date)} <CalendarOutlined />
//               </div>
//               <Text type="secondary" style={{fontSize: 12}}>Trước 12:00</Text>
//             </div>
//           </div>

//           {/* Price Breakdown */}
//           <div className="price-breakdown-section">
//             <Title level={5} style={{marginBottom: 16, fontSize: 16}}>Chi tiết thanh toán</Title>
            
//             <div className="price-detail-row">
//               <Text type="secondary">Phòng ({numRooms} phòng × {nights} đêm)</Text>
//               <Text strong>{formatPrice(roomTotal)}</Text>
//             </div>
            
//             {services.length > 0 && (
//               <>
//                 <div className="price-detail-row">
//                   <Text type="secondary">Dịch vụ bổ sung</Text>
//                   <Text strong>{formatPrice(servicesTotal)}</Text>
//                 </div>
//                 <div className="services-detail-list">
//                   {services.map((service, idx) => (
//                     <div key={idx} className="service-detail-item">
//                       <Text type="secondary" style={{fontSize: 12}}>
//                         • {service.service?.name || service.name} 
//                         {service.quantity > 1 ? ` × ${service.quantity}` : ''}
//                       </Text>
//                       <Text type="secondary" style={{fontSize: 12}}>
//                         {formatPrice(Number(service.total_price) || Number(service.price) || 0)}
//                       </Text>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
            
//             {discountAmount > 0 && (
//               <div className="price-detail-row discount">
//                 <Text type="secondary">Giảm giá</Text>
//                 <Text strong style={{color: '#52c41a'}}>-{formatPrice(discountAmount)}</Text>
//               </div>
//             )}
            
//             <Divider style={{margin: '12px 0'}} />
            
//             <div className="price-row total">
//               <Text strong style={{fontSize: 16}}>Tổng thanh toán</Text>
//               <Title level={3} style={{color: '#c08a19', margin: 0, fontSize: 28}}>
//                 {formatPrice(finalPrice)}
//               </Title>
//             </div>
//             <Text type="secondary" style={{fontSize: 12, display: 'block', textAlign: 'right', marginTop: 4}}>
//               Đã bao gồm thuế & phí dịch vụ. Thanh toán qua PayOS.
//             </Text>
//           </div>

//           {/* Customer Info */}
//           {booking.customer_name && (
//             <>
//               <Divider className="dashed-divider" />
//               <div className="customer-info-section">
//                 <Title level={5} style={{marginBottom: 12, fontSize: 16}}>Thông tin khách hàng</Title>
//                 <div className="info-item">
//                   <Text type="secondary">Họ tên:</Text>
//                   <Text strong>{booking.customer_name}</Text>
//                 </div>
//                 {booking.customer_email && (
//                   <div className="info-item">
//                     <Text type="secondary">Email:</Text>
//                     <Text>{booking.customer_email}</Text>
//                   </div>
//                 )}
//                 {booking.customer_phone && (
//                   <div className="info-item">
//                     <Text type="secondary">Số điện thoại:</Text>
//                     <Text>{booking.customer_phone}</Text>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}

//           {/* Action Buttons */}
//           <div className="ticket-actions">
//             <Row gutter={[12, 12]}>
//               <Col span={12}>
//                 <Button block icon={<FilePdfOutlined />} onClick={handleDownloadInvoice}>
//                   Tải hóa đơn
//                 </Button>
//               </Col>
//               <Col span={12}>
//                 <Button block icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
//                   In xác nhận
//                 </Button>
//               </Col>
//               <Col span={24}>
//                 <Button 
//                   type="primary" 
//                   block 
//                   size="large" 
//                   icon={<HomeOutlined />} 
//                   onClick={handleGoHome}
//                   style={{backgroundColor: '#c08a19', borderColor: '#c08a19'}}
//                 >
//                   Về trang chủ
//                 </Button>
//               </Col>
//             </Row>
//             <div style={{textAlign: 'center', marginTop: 16}}>
//               <Button type="link" onClick={() => navigate('/user/bookings')}>Xem lịch sử đặt phòng</Button>
//             </div>
//           </div>

//         </Card>
        
//         <div className="support-text">
//           Cần hỗ trợ? Liên hệ hotline <Text strong>1900 1234</Text> hoặc email <Text strong>support@beanhotel.com</Text>
//         </div>
//       </div>
//     </div> 
//   )
// }

// export default PaymentSuccess

import React, { useState, useEffect } from 'react'
import { 
  Card, Button, Typography, Space, Divider, 
  Result, Tag, Spin, message, Row, Col, Image
} from 'antd'
import { 
  CheckCircleFilled, 
  HomeOutlined, 
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  getBookingById, 
  formatPrice, 
  formatDate, 
  calculateNights,
  getUserBookings
} from '../../services/booking.service'
import httpClient from '../../services/httpClient'
import { getPendingPayment, clearPendingPayment, removePendingPayment } from '../../utils/pendingPayment.util'
import { useAuth } from '../../context/AuthContext'
import './PaymentSuccess.css'

const { Title, Text } = Typography

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation() // Hook để lấy state truyền từ navigate
  const { user } = useAuth()
  
  // Lấy booking từ state nếu có (được truyền từ trang Payment)
  const initialBooking = location.state?.booking || null

  const [loading, setLoading] = useState(!initialBooking) // Nếu có data rồi thì không loading
  const [booking, setBooking] = useState(initialBooking)
  const [error, setError] = useState(null)

  const code = searchParams.get('code')
  const cancel = searchParams.get('cancel')
  const status = searchParams.get('status')
  const orderCode = searchParams.get('orderCode')
  const isSuccess = code === '00' && status === 'PAID' && cancel === 'false'

  useEffect(() => {
    // Nếu đã có booking từ state, chỉ cần thực hiện các tác vụ dọn dẹp (clean up pending)
    // Không cần gọi API fetch lại
    if (initialBooking) {
       cleanupPendingBooking()
       setBooking(initialBooking)
       return
       
    }
     
    fetchBookingData()    
  }, [orderCode, code, status])

  // Hàm dọn dẹp localStorage riêng để tái sử dụng
  const cleanupPendingBooking = () => {
    const storedUser = (() => {
        try {
          const raw = localStorage.getItem('user')
          return raw ? JSON.parse(raw) : null
        } catch { return null }
      })()
    const userId = user?.user_id || user?.id || storedUser?.user_id || storedUser?.id || storedUser?.userId || null
    
    if (userId && orderCode && isSuccess) {
        removePendingPayment(userId, orderCode)
        localStorage.removeItem('temp_booking_key')
        localStorage.removeItem('temp_booking_info')
    }
  }
  const fetchBookingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      cleanupPendingBooking() // Gọi hàm dọn dẹp
      
      const storedUser = (() => {
        try {
          const raw = localStorage.getItem('user')
          return raw ? JSON.parse(raw) : null
        } catch { return null }
      })()
      const userId = user?.user_id || user?.id || storedUser?.user_id || storedUser?.id || storedUser?.userId || null

      if (orderCode) {
        try {
          const response = await getUserBookings({ limit: 1000 })
          const bookings = response?.bookings || response?.data?.bookings || []
          
          for (const b of bookings) {
            try {
              const bookingDetail = await getBookingById(b.booking_id)     
              const payments = bookingDetail?.booking?.payments || []
              const payment = payments.find(p => 
                p.transaction_id === orderCode || 
                p.transaction_id === orderCode?.toString() ||
                p.order_code === orderCode ||
                p.order_code === orderCode?.toString()
              )
              
              if (payment) {
                setBooking(bookingDetail?.booking || bookingDetail)
                if (userId && orderCode) removePendingPayment(userId, orderCode)
                return
              }
            } catch (err) {}
          }
        } catch (err) {}
      }
      
      // Fallback logic...
      const pendingPayment = getPendingPayment(userId)
      const bookingCode = pendingPayment?.bookingCode || null

      if (bookingCode) {
        try {
          const response = await httpClient.get(`/bookings/code/${bookingCode}`)
          const bookingData = response?.booking || response?.data?.booking
          if (bookingData) {
            try {
              const bookingDetail = await getBookingById(bookingData.booking_id)
              setBooking(bookingDetail?.booking || bookingDetail || bookingData)
            } catch (err) {
              setBooking(bookingData)
            }
            clearPendingPayment()
            
            // Dọn dẹp kỹ hơn
            const bkCode = pendingPayment?.bookingCode || bookingData?.booking_code
            const ordCode = pendingPayment?.orderCode || bookingData?.payos_order_code
            const tmpKey = pendingPayment?.tempBookingKey
            const uId = pendingPayment?.userId || user?.user_id || user?.id || null
            
            if (uId) {
              if (bkCode) removePendingPayment(uId, bkCode)
              if (ordCode) removePendingPayment(uId, ordCode)
              if (tmpKey) removePendingPayment(uId, tmpKey)
            }
            localStorage.removeItem('temp_booking_key')
            localStorage.removeItem('temp_booking_info')
            return
          }
        } catch (err) {}
      }
    } catch (err) {
      setError('Không thể tải thông tin đặt phòng. Vui lòng kiểm tra lại lịch sử.')
    } finally {
      setLoading(false)
    }
  }


  const handleGoHome = () => {
    if (window.opener && !window.opener.closed) {
      window.opener.location.href = '/'
      window.opener.focus()
      window.close()
    } else {
      navigate('/')
    }
  }

  // Calculations
  const nights = booking ? calculateNights(booking.check_in_date, booking.check_out_date) : 0
  const roomPrice = booking?.room_type?.price_per_night || 0
  const numRooms = booking?.num_rooms || 1
  const services = booking?.booking_services || booking?.services || []
  const servicesTotal = services.reduce((sum, s) => sum + (Number(s.total_price) || Number(s.price) || 0), 0)
  const roomTotal = roomPrice * nights * numRooms
  const subtotal = roomTotal + servicesTotal
  const finalPrice = booking?.final_price || booking?.total_price || subtotal
  const discountAmount = subtotal - finalPrice

  if (loading) {
    return (
      <div className="payment-success-page loading-state">
        <Spin size="large" tip="Đang xác nhận giao dịch..." />
      </div>
    )
  }

  // Trường hợp thất bại
  if (!isSuccess) {
    return (
      <div className="payment-success-page">
        <div className="container-narrow">
          <Card className="luxury-card result-card error">
            <Result
              status="error"
              title="Thanh toán thất bại"
              subTitle="Giao dịch của bạn không thể hoàn tất hoặc đã bị hủy."
              extra={[
                <Button type="primary" key="retry" onClick={() => navigate(-1)}>Thử lại</Button>,
                <Button key="home" onClick={handleGoHome}>Về trang chủ</Button>,
              ]}
            >
              <div className="desc">
                <Text type="secondary">Mã lỗi: {code || 'Unknown'}</Text>
              </div>
            </Result>
          </Card>
        </div>
      </div>
    )
  }

  // Trường hợp thành công nhưng chưa load được booking
  if (!booking && isSuccess) {
    return (
      <div className="payment-success-page">
        <div className="container-narrow">
          <Card className="luxury-card result-card">
            <Result
              status="success"
              title="Thanh toán thành công!"
              subTitle={`Mã giao dịch: ${orderCode}. Hệ thống đang xử lý đơn đặt phòng của bạn.`}
              extra={[
                <Button type="primary" key="home" onClick={handleGoHome}>Về trang chủ</Button>,
                <Button key="history" onClick={() => navigate('/user/bookings')}>Lịch sử đặt phòng</Button>
              ]}
            />
          </Card>
        </div>
      </div>
    )
  }

  // GIAO DIỆN CHÍNH: THÀNH CÔNG VÀ CÓ BOOKING INFO
  return (
    <div className="payment-success-page">
      <div className="container-narrow">
        
        {/* Success Banner */}
        <div className="success-banner">
          {/* <CheckCircleFilled className="success-icon" /> */}
          <Title level={2} className="success-title">Đặt phòng thành công!</Title>
          <Text className="success-subtitle">Cảm ơn bạn đã lựa chọn Bean Hotel cho kỳ nghỉ của mình.</Text>
        </div>

        <Card className="luxury-card booking-ticket" bordered={false}>
          {/* Header Ticket */}
          <div className="ticket-header">
            <div className="ticket-row">
              <div className="ticket-col">
                <Text type="secondary">Mã đặt phòng</Text>
                <Title level={3} className="booking-code" copyable>{booking.booking_code}</Title>
              </div>
              <div className="ticket-col text-right">
                <Tag color="success" className="status-tag">ĐÃ THANH TOÁN</Tag>
              </div>
            </div>
          </div>

          <Divider className="dashed-divider" />

          {/* Room Info with Image */}
          <div className="room-info-section">
            <Row gutter={24} align="middle">
              <Col xs={24} sm={8}>
                <div className="room-image-wrapper">
                  <Image 
                    src={booking.room_type?.images?.[0]} 
                    fallback="https://via.placeholder.com/300x200?text=Bean+Hotel"
                    alt="Room"
                    preview={false}
                    className="room-thumb-large"
                  />
                </div>
              </Col>
              <Col xs={24} sm={16}>
                <Title level={4} className="room-name">{booking.room_type?.room_type_name}</Title>
                <div className="hotel-location">
                  <EnvironmentOutlined /> Bean Hotel Luxury Resort
                </div>
                <div className="room-meta-grid">
                  <div className="meta-item">
                    <UserOutlined /> {booking.num_person || 2} Khách
                  </div>
                  <div className="meta-item">
                    <HomeOutlined /> {booking.num_rooms || 1} Phòng
                  </div>
                </div>
                <div className="room-price-chip">
                  <span>Giá phòng</span>
                  <strong>{formatPrice(roomPrice)} / đêm</strong>
                </div>
              </Col>
            </Row>
          </div>

          <div className="date-grid">
            <div className="date-box">
              <Text type="secondary">Nhận phòng</Text>
              <div className="date-val">
                <CalendarOutlined /> {formatDate(booking.check_in_date)}
              </div>
              <Text type="secondary" style={{fontSize: 12}}>Từ 14:00</Text>
            </div>
            <div className="night-count">
              <span className="moon-icon">🌙</span>
              <span>{nights} đêm</span>
              <div className="line"></div>
            </div>
            <div className="date-box text-right">
              <Text type="secondary">Trả phòng</Text>
              <div className="date-val">
                {formatDate(booking.check_out_date)} <CalendarOutlined />
              </div>
              <Text type="secondary" style={{fontSize: 12}}>Trước 12:00</Text>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown-section">
            <Title level={5} style={{marginBottom: 16, fontSize: 16}}>Chi tiết thanh toán</Title>
            
            <div className="price-detail-row">
              <Text type="secondary">Phòng ({numRooms} phòng × {nights} đêm)</Text>
              <Text strong>{formatPrice(roomTotal)}</Text>
            </div>
            
            {services.length > 0 && (
              <>
                <div className="price-detail-row">
                  <Text type="secondary">Dịch vụ bổ sung</Text>
                  <Text strong>{formatPrice(servicesTotal)}</Text>
                </div>
                <div className="services-detail-list">
                  {services.map((service, idx) => (
                    <div key={idx} className="service-detail-item">
                      <Text type="secondary" style={{fontSize: 12}}>
                        • {service.service?.name || service.name} 
                        {service.quantity > 1 ? ` × ${service.quantity}` : ''}
                      </Text>
                      <Text type="secondary" style={{fontSize: 12}}>
                        {formatPrice(Number(service.total_price) || Number(service.price) || 0)}
                      </Text>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {discountAmount > 0 && (
              <div className="price-detail-row discount">
                <Text type="secondary">Giảm giá</Text>
                <Text strong style={{color: '#52c41a'}}>-{formatPrice(discountAmount)}</Text>
              </div>
            )}
            
            <Divider style={{margin: '12px 0'}} />
            
            <div className="price-row total">
              <Text strong style={{fontSize: 16}}>Tổng thanh toán</Text>
              <Title level={3} style={{color: '#c08a19', margin: 0, fontSize: 28}}>
                {formatPrice(finalPrice)}
              </Title>
            </div>
            <Text type="secondary" style={{fontSize: 12, display: 'block', textAlign: 'right', marginTop: 4}}>
              Đã bao gồm thuế & phí dịch vụ. Thanh toán qua PayOS.
            </Text>
          </div>

          {/* Customer Info */}
          {booking.customer_name && (
            <>
              <Divider className="dashed-divider" />
              <div className="customer-info-section">
                <Title level={5} style={{marginBottom: 12, fontSize: 16}}>Thông tin khách hàng</Title>
                <div className="info-item">
                  <Text type="secondary">Họ tên:</Text>
                  <Text strong>{booking.customer_name}</Text>
                </div>
                {booking.customer_email && (
                  <div className="info-item">
                    <Text type="secondary">Email:</Text>
                    <Text>{booking.customer_email}</Text>
                  </div>
                )}
                {booking.customer_phone && (
                  <div className="info-item">
                    <Text type="secondary">Số điện thoại:</Text>
                    <Text>{booking.customer_phone}</Text>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="ticket-actions">
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  icon={<HomeOutlined />} 
                  onClick={handleGoHome}
                  style={{backgroundColor: '#c08a19', borderColor: '#c08a19'}}
                >
                  Về trang chủ
                </Button>
              </Col>
            </Row>
            <div style={{textAlign: 'center', marginTop: 16}}>
              <Button type="link" onClick={() => navigate('/user/bookings')}>Xem lịch sử đặt phòng</Button>
            </div>
          </div>

        </Card>
        
        <div className="support-text">
          Cần hỗ trợ? Liên hệ hotline <Text strong>1900 1234</Text> hoặc email <Text strong>support@beanhotel.com</Text>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess