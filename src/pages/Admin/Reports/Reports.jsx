import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Space, Button, DatePicker, message, Typography, Statistic } from 'antd'
import { FileExcelOutlined, FilePdfOutlined, ReloadOutlined } from '@ant-design/icons'
import httpClient, { getBaseUrl } from '../../../services/httpClient'

const { RangePicker } = DatePicker
const { Text } = Typography

function Reports() {
  const [loading, setLoading] = useState(false)
  // Sử dụng helper function từ httpClient để đảm bảo nhất quán
  const apiBaseUrl = getBaseUrl()

  const downloadFile = async (url, filename, headers = {}) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, ...headers } })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Tải file thất bại')
      }
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href)
    } catch (e) {
      message.error(e.message || 'Có lỗi xảy ra khi tải file')
    } finally {
      setLoading(false)
    }
  }

  const [range, setRange] = useState([])
  const [date, setDate] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    roomNightsSold: 0,
    serviceRevenue: 0,
  })

  // Tính chỉ số doanh thu theo khoảng thời gian
  const computeRevenueMetrics = async (pickedRange) => {
    const currentRange = pickedRange || range
    if (!currentRange || currentRange.length !== 2) return
    try {
      setCalcLoading(true)
      const [s, e] = currentRange
      const start = s.startOf('day')
      const end = e.endOf('day')

      // Lấy bookings (admin)
      const bookingsRes = await httpClient.get('/bookings', { params: { page: 1, limit: 1000 } })
      const bookings = Array.isArray(bookingsRes?.bookings) ? bookingsRes.bookings : []
      // Lọc theo created_at trong range và trạng thái hợp lệ
      const inRange = bookings.filter(b => {
        const createdAt = b?.created_at ? new Date(b.created_at) : null
        if (!createdAt) return false
        return createdAt >= start.toDate() && createdAt <= end.toDate()
      }).filter(b => ['confirmed', 'checked_in', 'checked_out'].includes(b?.booking_status))

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

  // Khởi tạo khoảng thời gian mặc định: tháng hiện tại, và tính chỉ số ban đầu
  useEffect(() => {
    if (!range || range.length === 0) {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      // Chuyển qua dayjs bằng RangePicker: hack đơn giản dùng Date, RangePicker vẫn chấp nhận dayjs; người dùng sẽ chọn lại range nếu cần
      // Để tránh phụ thuộc dayjs ở đây, ta chỉ tính ngay và chờ người dùng chọn lại để cập nhật UI RangePicker
      computeRevenueMetrics([
        { startOf: () => ({ toDate: () => startOfMonth }), endOf: () => ({ toDate: () => startOfMonth }), toDate: () => startOfMonth, format: () => '' },
        { startOf: () => ({ toDate: () => endOfMonth }), endOf: () => ({ toDate: () => endOfMonth }), toDate: () => endOfMonth, format: () => '' }
      ])
    }
    
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
              <Button style={{ marginRight: 14 }} type="primary" icon={<FileExcelOutlined />} onClick={() => {
                if (!range || range.length !== 2) return message.warning('Chọn khoảng thời gian')
                const [s, e] = range
                const start_date = s.format('YYYY-MM-DD')
                const end_date = e.format('YYYY-MM-DD')
                downloadFile(`${apiBaseUrl}/reports/revenue?start_date=${start_date}&end_date=${end_date}`, `bao-cao-doanh-thu-${start_date}-${end_date}.xlsx`)
              }}>Xuất Excel</Button>
              <Button style={{ marginRight: 14 }} icon={<FilePdfOutlined />} onClick={() => message.info('Báo cáo Doanh thu hiện chỉ hỗ trợ Excel')}>Xuất PDF</Button>
              <Button icon={<ReloadOutlined />} loading={calcLoading || loading} onClick={async () => {
                if (!range || range.length !== 2) {
                  return message.warning('Chọn khoảng thời gian')
                }
                await computeRevenueMetrics(range)
                message.success('Đã làm mới số liệu doanh thu')
              }}>Làm mới</Button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>Khoảng thời gian:</Text>
                <RangePicker value={range} onChange={(v) => { setRange(v); computeRevenueMetrics(v) }} allowClear={false} />
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


