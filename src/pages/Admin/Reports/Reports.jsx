import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Space, Button, DatePicker, message, Typography, Statistic, Select } from 'antd'
import { FileExcelOutlined, FilePdfOutlined, ReloadOutlined } from '@ant-design/icons'
import httpClient from '../../../services/httpClient'
import { getAllRoomTypes } from '../../../services/admin.service'
import { exportRevenueReportExcel, exportRevenueReportPDF, downloadBlob } from '../../../services/report.service'

const { RangePicker } = DatePicker
const { Text } = Typography
const { Option } = Select

function Reports() {
  const [loading, setLoading] = useState(false)

  // Hàm xuất báo cáo Excel
  const handleExportExcel = async () => {
    try {
      setLoading(true)
      
      if (!range || range.length !== 2) {
        message.warning('Vui lòng chọn khoảng thời gian để xuất báo cáo Excel')
        return
      }
      
      const [s, e] = range
      const start_date = s.format('YYYY-MM-DD')
      const end_date = e.format('YYYY-MM-DD')
      
      const blob = await exportRevenueReportExcel(start_date, end_date)
      downloadBlob(blob, `bao-cao-doanh-thu-${start_date}-${end_date}.xlsx`)
      message.success('Đã xuất báo cáo Excel thành công!')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      message.error(error.message || 'Có lỗi xảy ra khi xuất báo cáo Excel')
    } finally {
      setLoading(false)
    }
  }

  // Hàm xuất báo cáo PDF
  const handleExportPDF = async () => {
    try {
      setLoading(true)
      
      if (!range || range.length !== 2) {
        message.warning('Vui lòng chọn khoảng thời gian để xuất báo cáo PDF')
        return
      }
      
      const [s, e] = range
      const start_date = s.format('YYYY-MM-DD')
      const end_date = e.format('YYYY-MM-DD')
      
      const blob = await exportRevenueReportPDF(start_date, end_date)
      downloadBlob(blob, `bao-cao-doanh-thu-${start_date}-${end_date}.pdf`)
      message.success('Đã xuất báo cáo PDF thành công!')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      message.error(error.message || 'Có lỗi xảy ra khi xuất báo cáo PDF')
    } finally {
      setLoading(false)
    }
  }

  const [range, setRange] = useState([])
  const [date, setDate] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null)
  const [roomTypes, setRoomTypes] = useState([])
  const [roomTypesLoading, setRoomTypesLoading] = useState(false)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    roomNightsSold: 0,
    serviceRevenue: 0,
  })

  // Tải danh sách loại phòng
  const fetchRoomTypes = async () => {
    try {
      setRoomTypesLoading(true)
      const response = await getAllRoomTypes({})
      const roomTypesData = response?.roomTypes || []
      setRoomTypes(roomTypesData)
    } catch (error) {
      console.error('Error fetching room types:', error)
      message.error('Không thể tải danh sách loại phòng')
    } finally {
      setRoomTypesLoading(false)
    }
  }

  // Tính chỉ số doanh thu theo khoảng thời gian và loại phòng
  const computeRevenueMetrics = async (pickedRange, roomTypeId = null) => {
    const currentRange = pickedRange !== undefined ? pickedRange : range
    const currentRoomTypeId = roomTypeId !== null ? roomTypeId : selectedRoomTypeId
    try {
      setCalcLoading(true)

      // Lấy bookings (admin)
      const bookingsRes = await httpClient.get('/bookings', { params: { page: 1, limit: 1000 } })
      const bookings = Array.isArray(bookingsRes?.bookings) ? bookingsRes.bookings : []
      
      // Lọc theo trạng thái hợp lệ trước
      let inRange = bookings.filter(b => ['confirmed', 'checked_in', 'checked_out'].includes(b?.booking_status))
      
      // Lọc theo created_at trong range nếu có chọn khoảng thời gian
      if (currentRange && currentRange.length === 2) {
        const [s, e] = currentRange
        const start = s.startOf('day')
        const end = e.endOf('day')
        inRange = inRange.filter(b => {
          const createdAt = b?.created_at ? new Date(b.created_at) : null
          if (!createdAt) return false
          return createdAt >= start.toDate() && createdAt <= end.toDate()
        })
      }

      // Lọc theo loại phòng nếu có chọn
      if (currentRoomTypeId) {
        inRange = inRange.filter(b => {
          // Kiểm tra room_type_id từ booking hoặc từ booking_rooms
          if (b.room_type_id === currentRoomTypeId) return true
          if (Array.isArray(b.booking_rooms) && b.booking_rooms.length > 0) {
            return b.booking_rooms.some(br => br.room?.room_type_id === currentRoomTypeId)
          }
          return false
        })
      }

      // Tổng doanh thu (ưu tiên payments completed)
      let totalRevenue = 0
      inRange.forEach(b => {
        let bookingRevenue = 0
        const payments = Array.isArray(b.payments) ? b.payments : []
        payments.forEach(p => {
          if ((p.status === 'completed' || p.payment_status === 'paid') && Number(p.amount) > 0) {
            bookingRevenue += Number(p.amount)
          }
        })
        if (bookingRevenue === 0) {
          bookingRevenue = Number(b.final_price || b.total_price || 0)
        }
        totalRevenue += bookingRevenue
      })
      // Tổng số đặt phòng
      const totalBookings = inRange.length
      // Room nights sold
      let roomNightsSold = 0
      inRange.forEach(b => {
        const checkIn = b?.check_in_date ? new Date(b.check_in_date) : null
        const checkOut = b?.check_out_date ? new Date(b.check_out_date) : null
        if (!checkIn || !checkOut) return
        const nights = Math.max(0, Math.round((checkOut - checkIn) / (1000*60*60*24)))
        const numRooms = (Array.isArray(b.booking_rooms) && b.booking_rooms.length) ? b.booking_rooms.length : (b.num_rooms || 1)
        roomNightsSold += nights * numRooms
      })

      // Doanh thu dịch vụ
      let serviceRevenue = 0
      inRange.forEach(b => {
        const svcs = Array.isArray(b.booking_services) ? b.booking_services : []
        svcs.forEach(bs => {
          if (bs.status !== 'cancelled') {
            serviceRevenue += Number(bs.total_price || 0)
          }
        })
      })

      setMetrics({ totalRevenue, totalBookings, roomNightsSold, serviceRevenue })
    } catch (e) {
      console.error(e)
      message.error('Không tính được số liệu. Vui lòng thử lại.')
    } finally {
      setCalcLoading(false)
    }
  }

  // Tải danh sách loại phòng khi component mount
  useEffect(() => {
    fetchRoomTypes()
  }, [])

  // Tính toán doanh thu ban đầu khi component mount (toàn bộ doanh thu nếu không có range)
  useEffect(() => {
    // Tự động tính toàn bộ doanh thu khi mount (không có range)
    computeRevenueMetrics(null)
  }, [])



  return (
    <div style={{ padding: 24 }}>
      <Row>
        <Col span={24}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Text strong style={{ fontSize: 20 }}>BÁO CÁO DOANH THU</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Button 
                style={{ marginRight: 14 }} 
                type="primary" 
                icon={<FileExcelOutlined />} 
                loading={loading}
                onClick={handleExportExcel}
              >
                Xuất Excel
              </Button>
              <Button 
                style={{ marginRight: 14 }} 
                icon={<FilePdfOutlined />} 
                loading={loading}
                onClick={handleExportPDF}
              >
                Xuất PDF
              </Button>
              <Button icon={<ReloadOutlined />} loading={calcLoading || loading} onClick={async () => {
                // Reset tất cả filter
                setRange(null)
                setSelectedRoomTypeId(null)
                // Tính lại toàn bộ doanh thu
                await computeRevenueMetrics(null, null)
                message.success('Đã làm mới và hiển thị toàn bộ doanh thu')
              }}>Làm mới</Button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Space>
                  <Text strong>Khoảng thời gian:</Text>
                  <RangePicker 
                    value={range} 
                    onChange={(v) => { 
                      setRange(v)
                      computeRevenueMetrics(v)
                    }} 
                    allowClear 
                    placeholder={['Từ ngày', 'Đến ngày']}
                  />
                  {(!range || range.length === 0) && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (Đang hiển thị toàn bộ doanh thu)
                    </Text>
                  )}
                </Space>
                <Space>
                  <Text strong>Doanh thu theo loại phòng:</Text>
                  <Select
                    style={{ width: 250 }}
                    placeholder="Chọn loại phòng (tất cả)"
                    allowClear
                    loading={roomTypesLoading}
                    value={selectedRoomTypeId}
                    onChange={(value) => {
                      setSelectedRoomTypeId(value)
                      // Tính lại metrics với range hiện tại (có thể null nếu không chọn)
                      computeRevenueMetrics(range, value)
                    }}
                  >
                    {roomTypes.map(rt => (
                      <Option key={rt.room_type_id} value={rt.room_type_id}>
                        {rt.room_type_name}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Space>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={6}>
                <Card loading={calcLoading}>
                  <Statistic title="Tổng Doanh thu" value={Math.round(metrics.totalRevenue)} precision={0} prefix="₫" />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Card loading={calcLoading}>
                  <Statistic title="Tổng Đặt phòng" value={metrics.totalBookings} precision={0} />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Card loading={calcLoading}>
                  <Statistic title="Số đêm đã đặt" value={metrics.roomNightsSold} precision={0} />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Card loading={calcLoading}>
                  <Statistic title="Tổng Doanh thu dịch vụ" value={Math.round(metrics.serviceRevenue)} precision={0} prefix="₫" />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Reports


