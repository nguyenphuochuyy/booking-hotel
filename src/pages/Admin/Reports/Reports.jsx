import React, { useEffect, useState, useCallback } from 'react'
import { Row, Col, Card, Space, Button, DatePicker, message, Typography, Statistic, Select } from 'antd'
import { FileExcelOutlined, FilePdfOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import httpClient from '../../../services/httpClient'
import { getAllRoomTypes } from '../../../services/admin.service'
import { exportRevenueReportExcel, exportRevenueReportPDF, exportTaxReport, downloadBlob, getMonthlyRevenue, getDailyRevenue } from '../../../services/report.service'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const { RangePicker } = DatePicker
const { Text } = Typography
const { Option } = Select

function Reports() {
  const [excelLoading, setExcelLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [taxLoading, setTaxLoading] = useState(false)

  // Hàm xuất báo cáo Excel
  const handleExportExcel = async () => {
    try {
      setExcelLoading(true)

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
      setExcelLoading(false)
    }
  }

  // Hàm xuất báo cáo PDF
  const handleExportPDF = async () => {
    try {
      setPdfLoading(true)

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
      setPdfLoading(false)
    }
  }

  // Hàm xuất báo cáo thuế
  const handleExportTax = async () => {
    try {
      setTaxLoading(true)

      if (!range || range.length !== 2) {
        message.warning('Vui lòng chọn khoảng thời gian để xuất báo cáo thuế')
        return
      }

      const [s, e] = range
      const start_date = s.format('YYYY-MM-DD')
      const end_date = e.format('YYYY-MM-DD')

      const blob = await exportTaxReport(start_date, end_date)
      downloadBlob(blob, `bao-cao-thue-${start_date}-${end_date}.xlsx`)
      message.success('Đã xuất báo cáo thuế thành công!')
    } catch (error) {
      console.error('Error exporting tax report:', error)
      const errorMessage = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi xuất báo cáo thuế'
      message.error(errorMessage)
    } finally {
      setTaxLoading(false)
    }
  }

  const [range, setRange] = useState(null)
  const [date, setDate] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null)
  const [roomTypes, setRoomTypes] = useState([])
  const [roomTypesLoading, setRoomTypesLoading] = useState(false)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [monthlyRevenueLoading, setMonthlyRevenueLoading] = useState(false)
  const [dailyRevenue, setDailyRevenue] = useState([])
  const [dailyRevenueLoading, setDailyRevenueLoading] = useState(false)
  const [chartType, setChartType] = useState('day') // 'day' hoặc 'month'
  const [rangeRevenue, setRangeRevenue] = useState([])
  const [rangeRevenueLoading, setRangeRevenueLoading] = useState(false)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    roomNightsSold: 0,
    totalCancelled: 0,
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

  const fetchMonthlyRevenue = async () => {
    try {
      setMonthlyRevenueLoading(true)
      const response = await getMonthlyRevenue()
      setMonthlyRevenue(response || [])
    } catch (error) {
      console.error('Error fetching monthly revenue:', error)
      message.error('Không thể tải dữ liệu doanh thu theo tháng')
    } finally {
      setMonthlyRevenueLoading(false)
    }
  }

  const fetchDailyRevenue = async () => {
    try {
      setDailyRevenueLoading(true)
      const response = await getDailyRevenue()
      setDailyRevenue(response || [])
    } catch (error) {
      console.error('Error fetching daily revenue:', error)
      message.error('Không thể tải dữ liệu doanh thu theo ngày')
    } finally {
      setDailyRevenueLoading(false)
    }
  }

  // Lấy doanh thu theo khoảng thời gian đã chọn
  const fetchRevenueByRange = async (rangeValue, type = chartType) => {
    if (!rangeValue || !Array.isArray(rangeValue) || rangeValue.length !== 2) {
      setRangeRevenue([])
      return
    }

    try {
      setRangeRevenueLoading(true)
      const response = await httpClient.get('/bookings', {
        params: { page: 1, limit: 1000 },
      })

      const bookings = Array.isArray(response?.bookings) ? response.bookings : []
      const [startDate, endDate] = rangeValue
      
      // Đảm bảo startDate và endDate là dayjs objects
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      
      if (!start.isValid() || !end.isValid()) {
        console.warn('Invalid date range for filtering')
        setRangeRevenue([])
        return
      }

      // Filter bookings theo khoảng thời gian
      const filteredBookings = bookings.filter((booking) => {
        if (!booking || booking.booking_status === 'cancelled') return false
        
        const bookingDate = dayjs(booking.created_at || booking.check_in_date)
        if (!bookingDate.isValid()) return false

        return (
          bookingDate.isSameOrAfter(start, 'day') &&
          bookingDate.isSameOrBefore(end, 'day')
        )
      })

      // Nhóm doanh thu theo ngày hoặc tháng tùy theo type
      const revenueMap = {}
      
      filteredBookings.forEach((booking) => {
        const bookingDate = dayjs(booking.created_at || booking.check_in_date)
        const revenue = parseFloat(booking.final_price) || parseFloat(booking.total_price) || 0
        
        if (Number.isNaN(revenue) || revenue <= 0) return

        let key
        let label

        if (type === 'day') {
          // Nhóm theo ngày
          key = bookingDate.format('YYYY-MM-DD')
          label = bookingDate.format('DD/MM/YYYY')
        } else {
          // Nhóm theo tháng
          key = bookingDate.format('YYYY-MM')
          const month = bookingDate.month() + 1
          label = `Tháng ${month}`
        }

        if (!revenueMap[key]) {
          revenueMap[key] = {
            date: label,
            revenue: 0,
          }
        }

        revenueMap[key].revenue += revenue
      })

      // Chuyển đổi thành mảng và sắp xếp
      const result = Object.keys(revenueMap)
        .sort()
        .map((key) => revenueMap[key])

      setRangeRevenue(result)
    } catch (error) {
      console.error('Error fetching revenue by range:', error)
      message.error('Không thể tải dữ liệu doanh thu theo khoảng thời gian')
      setRangeRevenue([])
    } finally {
      setRangeRevenueLoading(false)
    }
  }

  // Tải danh sách loại phòng và dữ liệu doanh thu 7 ngày gần nhất khi component mount
  useEffect(() => {
    fetchRoomTypes()
    fetchDailyRevenue() // Mặc định load dữ liệu 7 ngày gần nhất
  }, [])

  const computeRevenueMetrics = useCallback(async (rangeValue = null, roomTypeValue = null) => {
    try {
      setCalcLoading(true)
      const response = await httpClient.get('/bookings', {
        params: { page: 1, limit: 1000 },
      })

      const hasRangeFilter =
        Array.isArray(rangeValue) &&
        rangeValue.length === 2 &&
        rangeValue[0] &&
        rangeValue[1]

      let filteredBookings = Array.isArray(response?.bookings) ? response.bookings : []
      if (roomTypeValue) {
        filteredBookings = filteredBookings.filter((booking) => {
          const bookingRoomTypeId =
            booking.room_type?.room_type_id ?? booking.room_type_id
          if (!bookingRoomTypeId) return false
          return String(bookingRoomTypeId) === String(roomTypeValue)
        })
      }

      if (hasRangeFilter) {
        const [startDate, endDate] = rangeValue
        // Đảm bảo startDate và endDate là dayjs objects
        const start = dayjs(startDate)
        const end = dayjs(endDate)
        
        if (!start.isValid() || !end.isValid()) {
          console.warn('Invalid date range for filtering')
          return
        }
        
        filteredBookings = filteredBookings.filter((booking) => {
          if (!booking.check_in_date) return false
          const checkIn = dayjs(booking.check_in_date)
          if (!checkIn.isValid()) return false
          return (
            checkIn.isSameOrAfter(start, 'day') &&
            checkIn.isSameOrBefore(end, 'day')
          )
        })
      }

      let totalRevenue = 0
      let roomNightsSold = 0
      let totalCancelled = 0

      filteredBookings.forEach((booking) => {
        const checkIn = booking.check_in_date ? dayjs(booking.check_in_date) : null
        const checkOut = booking.check_out_date ? dayjs(booking.check_out_date) : null
        const nights =
          checkIn && checkOut && checkOut.isAfter(checkIn)
            ? checkOut.diff(checkIn, 'day')
            : 0
        const roomsCount = booking.rooms?.length || booking.num_rooms || 1

        if (booking.booking_status === 'cancelled') {
          totalCancelled += 1
          return
        }

        roomNightsSold += nights * roomsCount

        const price =
          parseFloat(booking.final_price) ||
          parseFloat(booking.total_price) ||
          0

        if (!Number.isNaN(price) && price > 0) {
          totalRevenue += price
        }
      })

      setMetrics({
        totalRevenue,
        totalBookings: filteredBookings.length,
        roomNightsSold,
        totalCancelled,
      })
    } catch (error) {
      console.error('Error computing revenue metrics:', error)
      message.error('Không thể lấy dữ liệu báo cáo')
    } finally {
      setCalcLoading(false)
    }
  }, [])

  // Tự động cập nhật số liệu mỗi khi range hoặc room type thay đổi
  useEffect(() => {
    computeRevenueMetrics(range, selectedRoomTypeId)
  }, [range, selectedRoomTypeId, computeRevenueMetrics])

  // Tự động lấy doanh thu theo khoảng thời gian khi range hoặc chartType thay đổi
  useEffect(() => {
    if (range && Array.isArray(range) && range.length === 2) {
      fetchRevenueByRange(range, chartType)
    } else {
      setRangeRevenue([])
    }
  }, [range, chartType])

  // Hàm format doanh thu: 20tr, 500k, v.v.
  const formatRevenue = (value) => {
    if (!value || value === 0) return '0'
    const num = Number(value)
    if (num >= 1000000) {
      const tr = num / 1000000
      return tr % 1 === 0 ? `${tr}tr` : `${tr.toFixed(1)}tr`
    }
    if (num >= 1000) {
      const k = num / 1000
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
    }
    return num.toLocaleString('vi-VN')
  }

  // Xử lý khi chuyển đổi loại biểu đồ
  const handleChartTypeChange = (type) => {
    setChartType(type)
    if (type === 'day' && dailyRevenue.length === 0) {
      fetchDailyRevenue()
    } else if (type === 'month' && monthlyRevenue.length === 0) {
      fetchMonthlyRevenue()
    }
  }

  // Map dữ liệu doanh thu theo loại đã chọn (ngày hoặc tháng) sang format cho BarChart
  // Ưu tiên dữ liệu từ range nếu có, nếu không thì dùng daily/monthly revenue
  const chartData = range && range.length === 2 && rangeRevenue.length > 0
    ? rangeRevenue.map((item) => ({
        date: item.date,
        value: item.revenue || 0,
      }))
    : chartType === 'day' 
      ? dailyRevenue.map((item) => ({
          date: item.date,
          value: item.revenue || 0,
        }))
      : monthlyRevenue.map((item) => {
          // Parse date từ format DD/MM/YYYY để lấy tháng
          const dateParts = item.date.split('/')
          if (dateParts.length === 3) {
            const month = parseInt(dateParts[1], 10)
            return {
              date: `Tháng ${month}`,
              value: item.revenue || 0,
            }
          }
          return {
            date: item.date,
            value: item.revenue || 0,
          }
        })
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
                loading={excelLoading}
                onClick={handleExportExcel}
              >
                Xuất Excel
              </Button>
              <Button
                style={{ marginRight: 14 }}
                icon={<FilePdfOutlined />}
                loading={pdfLoading}
                onClick={handleExportPDF}
              >
                Xuất PDF
              </Button>
              <Button
                style={{ marginRight: 14 }}
                type="default"
                icon={<FileTextOutlined />}
                loading={taxLoading}
                onClick={handleExportTax}
              >
                Xuất báo cáo thuế
              </Button>
              <Button icon={<ReloadOutlined />} loading={calcLoading} onClick={async () => {
                // Reset tất cả filter
                setRange(null)
                setSelectedRoomTypeId(null)
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
                      setRange(v && v.length === 2 ? v : null)
                    }} 
                    allowClear 
                    placeholder={['Từ ngày', 'Đến ngày']}
                  />
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
                      setSelectedRoomTypeId(value || null)
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
                  <Statistic title="Tổng Doanh thu" value={metrics.totalRevenue} precision={0} valueStyle={{ fontWeight: 'bold' }} />
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
                  <Statistic title="Booking bị hủy" value={metrics.totalCancelled} precision={0} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      {/* Biểu đồ doanh thu */}
      <Row gutter={[16, 16]}>
        <Col sm={24} md={24} lg={24}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>
                  {range && range.length === 2
                    ? `Biểu đồ doanh thu từ ${range[0].format('DD/MM/YYYY')} đến ${range[1].format('DD/MM/YYYY')}`
                    : chartType === 'day' 
                      ? 'Biểu đồ doanh thu 7 ngày gần nhất' 
                      : 'Biểu đồ doanh thu theo tháng'}
                </Text>
                <Space>
                  <Button
                    type={chartType === 'day' ? 'primary' : 'default'}
                    onClick={() => handleChartTypeChange('day')}
                    size="small"
                    disabled={range && range.length === 2}
                  >
                    Theo ngày
                  </Button>
                  <Button
                    type={chartType === 'month' ? 'primary' : 'default'}
                    onClick={() => handleChartTypeChange('month')}
                    size="small"
                    disabled={range && range.length === 2}
                  >
                    Theo tháng
                  </Button>
                </Space>
              </div>
            }
            loading={
              range && range.length === 2
                ? rangeRevenueLoading
                : chartType === 'day' 
                  ? dailyRevenueLoading 
                  : monthlyRevenueLoading
            }
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    formatter={(value) => [`Doanh thu: ${formatRevenue(value)}`]}
                  />
                  <Legend />
                  <XAxis dataKey="date" />
                  <YAxis
                    width={80}
                    tickFormatter={(value) => formatRevenue(value)}
                  />
                  <Bar dataKey="value" fill="#1890ff" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">
                  {range && range.length === 2
                    ? `Không có dữ liệu doanh thu trong khoảng thời gian từ ${range[0].format('DD/MM/YYYY')} đến ${range[1].format('DD/MM/YYYY')}`
                    : chartType === 'day' 
                      ? 'Không có dữ liệu doanh thu 7 ngày gần nhất' 
                      : 'Không có dữ liệu doanh thu theo tháng'}
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Reports


