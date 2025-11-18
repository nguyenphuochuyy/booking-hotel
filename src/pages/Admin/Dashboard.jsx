  const handleQuickCheckOut = async () => {
    if (selectedCheckOutRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một booking để check-out')
      return
    }

    try {
      setQuickCheckOutLoading(true)
      await Promise.all(
        selectedCheckOutRowKeys.map((bookingId) =>
          checkOutGuest(bookingId, { auto_release_room: true })
        )
      )
      message.success('Đã check-out thành công cho các booking đã chọn')
      const data = await getTodayCheckSchedules()
      setTodayCheckIns(data.checkIns || [])
      setTodayCheckOuts(data.checkOuts || [])
      setSelectedCheckOutRowKeys([])
    } catch (error) {
      console.error('Error during quick check-out:', error)
      message.error('Không thể check-out tự động cho các booking đã chọn')
    } finally {
      setQuickCheckOutLoading(false)
    }
  }
import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Tag,
  Empty,
  Table,
  Button,
  Modal,
  Descriptions,
  message
} from 'antd'
// import {  } from '@ant-design/charts'
import { Pie , Column } from '@ant-design/plots';
import {
  UserOutlined,
  HomeOutlined,
  ShopOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import {
  getAllDashboardStats,
  getBookingStatusColor,
  getBookingStatusText,
  formatDate,
  getRevenueByDay,
  getBookingStatusStats,
  getTodayCheckSchedules
} from '../../services/dashboard.service'
import { getBookingById, checkInGuest, checkOutGuest } from '../../services/admin.service'
import formatPrice from '../../utils/formatPrice'

const { Title, Text } = Typography

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: []
  })
  const [revenueByDay, setRevenueByDay] = useState([])
  const [bookingStatusData, setBookingStatusData] = useState([])
  const [bookingStatusTotal, setBookingStatusTotal] = useState(0)
  const [bookingStatusLoading, setBookingStatusLoading] = useState(true)
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [todayCheckIns, setTodayCheckIns] = useState([])
  const [todayCheckOuts, setTodayCheckOuts] = useState([])
  const [selectedCheckInRowKeys, setSelectedCheckInRowKeys] = useState([])
  const [selectedCheckOutRowKeys, setSelectedCheckOutRowKeys] = useState([])
  const [quickCheckInLoading, setQuickCheckInLoading] = useState(false)
  const [quickCheckOutLoading, setQuickCheckOutLoading] = useState(false)
  const [detailModal, setDetailModal] = useState({
    visible: false,
    loading: false,
    data: null,
  })

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'green',
      pending: 'orange',
      partial_refunded: 'gold',
      refunded: 'blue',
      failed: 'red',
    }
    return colors[status] || 'default'
  }

  const getPaymentStatusText = (status) => {
    const texts = {
      paid: 'Đã thanh toán',
      pending: 'Chờ thanh toán',
      partial_refunded: 'Chờ hoàn tiền',
      refunded: 'Đã hoàn tiền',
      failed: 'Thanh toán thất bại',
    }
    return texts[status] || status || 'N/A'
  }
  const recentBookingsData = (stats.recentBookings || []).slice(0, 5).map((booking) => ({
    key: booking.booking_id,
    booking_code: booking.booking_code || `BK-${booking.booking_id}`,
    customer_name: booking.user?.full_name || booking.customer_name || 'N/A',
    room_type: booking.room_type?.room_type_name || booking.room_type_name || 'N/A',
    check_in_date: booking.check_in_date,
    booking_status: booking.booking_status,
    booking_id: booking.booking_id,
    final_price: booking.final_price || booking.total_price || 0,
  }))

  const handleViewBooking = async (bookingId) => {
    if (!bookingId) return
    setDetailModal({
      visible: true,
      loading: true,
      data: null,
    })
    try {
      const response = await getBookingById(bookingId)
      const booking = response?.booking || response
      setDetailModal({
        visible: true,
        loading: false,
        data: booking,
      })
    } catch (error) {
      console.error('Error fetching booking detail:', error)
      message.error('Không thể tải chi tiết booking')
      setDetailModal({
        visible: false,
        loading: false,
        data: null,
      })
    }
  }

  const handleQuickCheckIn = async () => {
    if (selectedCheckInRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một booking để check-in')
      return
    }

    try {
      setQuickCheckInLoading(true)
      await Promise.all(
        selectedCheckInRowKeys.map((bookingId) =>
          checkInGuest(bookingId, { auto_assign_room: true })
        )
      )
      message.success('Đã check-in thành công cho các booking đã chọn')
      const data = await getTodayCheckSchedules()
      setTodayCheckIns(data.checkIns || [])
      setTodayCheckOuts(data.checkOuts || [])
      setSelectedCheckInRowKeys([])
    } catch (error) {
      console.error('Error during quick check-in:', error)
      message.error('Không thể check-in tự động cho các booking đã chọn')
    } finally {
      setQuickCheckInLoading(false)
    }
  }

  const recentBookingColumns = [
    {
      title: 'Mã booking',
      dataIndex: 'booking_code',
      key: 'booking_code',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Loại phòng',
      dataIndex: 'room_type',
      key: 'room_type',
    },
    {
      title: 'Check-in',
      dataIndex: 'check_in_date',
      key: 'check_in_date',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'booking_status',
      key: 'booking_status',
      render: (status) => (
        <Tag color={getBookingStatusColor(status)}>
          {getBookingStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button size="small" type="link" onClick={() => handleViewBooking(record.booking_id)}>
          Xem
        </Button>
      ),
    },
  ]

  const scheduleColumns = [
    {
      title: 'Mã booking',
      dataIndex: 'booking_code',
      key: 'booking_code',
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      responsive: ['sm', 'md', 'lg'],
    },
    {
      title: 'Loại phòng',
      dataIndex: 'room_type',
      key: 'room_type',
      responsive: ['md', 'lg'],
    },
    {
      title: 'Thời gian',
      dataIndex: 'check_time',
      key: 'check_time',
      responsive: ['md', 'lg'],
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'booking_status',
      key: 'booking_status',
      responsive: ['xs', 'sm', 'md', 'lg'],
      render: (status) => (
        <Tag color={getBookingStatusColor(status)}>
          {getBookingStatusText(status)}
        </Tag>
      ),
    },
  ]
  // tải dữ liệu thống kê
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getAllDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  // tải dữ liệu doanh thu theo ngày
  useEffect(() => {
    const loadRevenueByDay = async () => {
      try {
        setChartLoading(true)
        const data = await getRevenueByDay();
        // Filter và validate dữ liệu trước khi set state
        const validData = data.filter(item => {
          return item && 
                 item.label && 
                 typeof item.label === 'string' && 
                 !isNaN(item.revenue) &&
                 item.revenue >= 0
        })
        setRevenueByDay(validData)
        console.log(validData);
        
      } catch (error) {
        console.error('Error loading revenue by day:', error)
        setRevenueByDay([])
      } finally {
        setChartLoading(false)
      }
    }
      loadRevenueByDay()
    }, [])

    // Tải dữ liệu trạng thái phòng
  useEffect(() => {
    const loadBookingStatusStats = async () => {
      try {
        setBookingStatusLoading(true)
        const data = await getBookingStatusStats()
        setBookingStatusData(data.pieData || [])
        setBookingStatusTotal(data.total || 0)
      } catch (error) {
        console.error('Error loading booking status stats:', error)
        setBookingStatusData([])
        setBookingStatusTotal(0)
      } finally {
        setBookingStatusLoading(false)
      }
    }

    loadBookingStatusStats()
  }, [])

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setScheduleLoading(true)
        const data = await getTodayCheckSchedules()
        setTodayCheckIns(data.checkIns || [])
        setTodayCheckOuts(data.checkOuts || [])
      } catch (error) {
        console.error('Error loading today schedules:', error)
        setTodayCheckIns([])
        setTodayCheckOuts([])
      } finally {
        setScheduleLoading(false)
      }
    }

    loadSchedules()
  }, [])
  // Config cho Biểu đồ Cột (Doanh thu)
  const columnConfig = {
    data: revenueByDay,
    xField: 'label',
    yField: 'revenue',
    height: 300,
    color: '#000',
    columnStyle: {
      radius: [4, 4, 0, 0],
      fill: '#000',
    },
    xAxis: {
      title: { text: 'Ngày', style: { fontSize: 14, fontWeight: 'bold' } },
      label: { autoRotate: false, style: { fontSize: 12 } },
    },
    yAxis: {
      title: { text: 'Doanh thu', style: { fontSize: 14, fontWeight: 'bold' } },
      label: {
        formatter: (value) => {
          const val = Number(value);
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}tr`;
          if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
          return val;
        },
        style: { fontSize: 12 },
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Doanh thu', value: `${Number(datum.revenue).toLocaleString('vi-VN')} đ` };
      },
    },
  };
  return (
    <>
    <div style={{ padding: 24 }}>
      <Title align='center' level={2}>Trang quản trị</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>Đang tải thống kê...</p>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={5}>
              <Card>
                <Statistic
                  bordered={true}
                  title="Tổng đặt phòng"
                  value={stats.totalBookings}
                  // prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#000' }}
                />
              </Card>
            </Col>
             <Col xs={24} sm={12} lg={5}>
              <Card>
                <Statistic
                  title="Công suất phòng"
                  value={
                    stats.totalRooms > 0
                      ? (
                          (bookingStatusData.find(item => item.type === 'Đang ở')?.value || 0) /
                          stats.totalRooms *
                          100
                        ).toFixed(1)
                      : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#c08a19' }}
                />
              </Card>
            </Col>
           <Col xs={24} sm={12} lg={5}>
              <Card>
                <Statistic
                  title="Doanh thu"
                  value={formatPrice(stats.totalRevenue)}
                  // prefix={<DollarOutlined />}
                  valueStyle={{ color: 'green' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                title="Doanh thu theo ngày (7 ngày gần nhất)"
                bordered={false}
                style={{ height: '100%', display: 'flex', flexDirection: 'column'}}
                bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {chartLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px', color: '#666' }}>Đang tải dữ liệu biểu đồ...</p>
                          </div>
                ) : revenueByDay.length > 0 ? (
       
                  <div style={{ width: '100%' }}>
                    <Column {...columnConfig} />
                  </div>
         
                ) : (
                  <Empty description="Chưa có dữ liệu doanh thu" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
               <Card
                 title="Thống kê trạng thái booking"
                 bordered={false}
                 style={{ height: '100%', display: 'flex', flexDirection: 'column' , width : '100%'}}
                 bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               >
                 {bookingStatusLoading ? (
                   <div style={{ textAlign: 'center', padding: '60px 0' }}>
                     <Spin size="large" />
                     <p style={{ marginTop: '16px', color: '#666' }}>Đang tải dữ liệu...</p>
                  </div>
                 ) : bookingStatusData.length > 0 ? (
                   <Pie
                    appendPadding={10}
                    data={bookingStatusData}
                    angleField="value"
                    colorField="type"
                    radius={0.8}
                    innerRadius={0.5}
                    color={({ type }) => {
                      if (type === 'Đang ở') return '#f5222d'
                      if (type === 'Đã xác nhận') return '#1890fa'
                      if (type === 'Chờ xác nhận') return '#faad14'
                      if (type === 'Đã trả phòng') return '#52c41a'
                      return '#8c8c8c'
                     }}
                     label={{
                      text : 'value',
                      style: {
                        fontWeight: 'bold',
                      },
                     }}
                     interactions={[
                       { type: 'element-selected' },
                       { type: 'element-active' }
                     ]}
                     legend={{
                      color: {
                        title: false,
                        position: 'right',
                        rowPadding: 5,
                      },
                    }}
                    statistic={{
                      title: {
                        customHtml: () => (
                          `<div style="font-size:14px;color:#8c8c8c;">Tổng booking</div>`
                        ),
                      },
                      content: {
                        customHtml: () => (
                          `<div style="font-size:18px;font-weight:bold;">${bookingStatusTotal || 0}</div>`
                        ),
                      },
                    }}
                    tooltip={{
                      formatter: (datum) => {
                        const percent = ((datum.value / (bookingStatusTotal || 1)) * 100).toFixed(1)
                        return {
                          name: datum.type,
                          value: `${datum.value} booking (${percent}%)`,
                        }
                      },
                    }}
                    
                   />
                 ) : (
                  <Empty description="Chưa có dữ liệu booking" />
                 )}
               </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Card
                title="Check-in hôm nay"
                bordered={false}
                extra={
                  <Button
                    type="primary"
                    size="small"
                    disabled={selectedCheckInRowKeys.length === 0}
                    loading={quickCheckInLoading}
                    onClick={handleQuickCheckIn}
                  >
                    Check-in nhanh
                  </Button>
                }
              >
                <Table
                  columns={scheduleColumns}
                  dataSource={todayCheckIns.map((item) => ({ ...item, key: item.booking_id }))}
                  pagination={false}
                  size="small"
                  loading={scheduleLoading}
                  scroll={{ x: true }}
                  rowSelection={{
                    selectedRowKeys: selectedCheckInRowKeys,
                    onChange: setSelectedCheckInRowKeys,
                  }}
                  locale={{ emptyText: 'Không có khách check-in hôm nay' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Check-out hôm nay"
                bordered={false}
                extra={
                  <Button
                    type="primary"
                    size="small"
                    disabled={selectedCheckOutRowKeys.length === 0}
                    loading={quickCheckOutLoading}
                    onClick={handleQuickCheckOut}
                  >
                    Check-out nhanh
                  </Button>
                }
              >
                <Table
                  columns={scheduleColumns}
                  dataSource={todayCheckOuts.map((item) => ({ ...item, key: item.booking_id }))}
                  pagination={false}
                  size="small"
                  loading={scheduleLoading}
                  scroll={{ x: true }}
                  rowSelection={{
                    selectedRowKeys: selectedCheckOutRowKeys,
                    onChange: setSelectedCheckOutRowKeys,
                  }}
                  locale={{ emptyText: 'Không có khách check-out hôm nay' }}
                />
              </Card>
            </Col>
          </Row>
          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="5 đặt phòng mới nhất" bordered={false}>
                {recentBookingsData.length > 0 ? (
                  <Table
                    columns={recentBookingColumns}
                    dataSource={recentBookingsData}
                    pagination={false}
                    size="small"
                    scroll={{ x: true }}
                  />
                ) : (
                  <Empty description="Chưa có đặt phòng mới" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>

    <Modal
      open={detailModal.visible}
      onCancel={() => setDetailModal({ visible: false, loading: false, data: null })}
      footer={null}
      width={720}
      title={
        detailModal.data
          ? `Chi tiết booking #${detailModal.data.booking_code || detailModal.data.booking_id}`
          : 'Chi tiết booking'
      }
      destroyOnClose
    >
      {detailModal.loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : detailModal.data ? (
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Mã booking">
            {detailModal.data.booking_code || detailModal.data.booking_id}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getBookingStatusColor(detailModal.data.booking_status)}>
              {getBookingStatusText(detailModal.data.booking_status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {detailModal.data.user?.full_name || detailModal.data.customer_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Loại phòng">
            {detailModal.data.room_type?.room_type_name || detailModal.data.room_type_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Check-in">
            {formatDate(detailModal.data.check_in_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Check-out">
            {formatDate(detailModal.data.check_out_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Thanh toán">
            <Tag color={getPaymentStatusColor(detailModal.data.payment_status)}>
              {getPaymentStatusText(detailModal.data.payment_status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {formatPrice(detailModal.data.final_price || detailModal.data.total_price || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {detailModal.data.note || 'Không có'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Empty description="Không có dữ liệu booking" />
      )}
    </Modal>
    </>
  )
}

export default Dashboard
