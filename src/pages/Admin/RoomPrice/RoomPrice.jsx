import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Badge, Divider, Empty, DatePicker, InputNumber
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  DollarOutlined, ReloadOutlined, CalendarOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons'
import { 
  getAllRoomPrices, createRoomPrice, updateRoomPrice, deleteRoomPrice,
  getAllRoomTypes
} from '../../../services/admin.service'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import './roomPrice.css'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const RoomPriceManagement = () => {
  const [roomPrices, setRoomPrices] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPrice, setEditingPrice] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState(null)
  const [form] = Form.useForm()
  const [dateRangeFilter, setDateRangeFilter] = useState(null)

  // fetch giá phòng từ API
  const fetchRoomPrices = async (roomTypeId = null) => {
    setLoading(true)
    try {
      const params = {}
      if (roomTypeId) {
        params.room_type_id = roomTypeId
      }
      const response = await getAllRoomPrices(params)
      setRoomPrices(response.prices || [])
    } catch (error) {
      message.error('Không thể tải danh sách giá phòng')
    } finally {
      setLoading(false)
    }
  }

  // Fetch loại phòng cho dropdown
  const fetchRoomTypes = async () => {
    try {
      const response = await getAllRoomTypes({ limit: 100 })
      setRoomTypes(response.roomTypes || [])
    } catch (error) {
      console.error('Error fetching room types:', error)
      message.error('Không thể tải danh sách loại phòng')
    }
  }

  useEffect(() => {
    fetchRoomPrices()
    fetchRoomTypes()
  }, [])

  // Set form values khi edit và modal đã mở
  useEffect(() => {
    if (isModalVisible && editingPrice) {
      form.setFieldsValue({
        room_type_id: editingPrice.room_type_id,
        date_range: [
          dayjs(editingPrice.start_date),
          dayjs(editingPrice.end_date)
        ],
        price_per_night: parseFloat(editingPrice.price_per_night) || editingPrice.price_per_night
      })
    }
  }, [isModalVisible, editingPrice, form]) 

  //  Lọc giá phòng theo tên loại phòng và giá
  const filteredRoomPrices = useMemo(() => {
    let filtered = roomPrices
    
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(price => {
        const roomTypeName = roomTypes.find(rt => rt.room_type_id === price.room_type_id)?.room_type_name || ''
        const priceValue = price.price_per_night?.toString() || ''
        
        return roomTypeName.toLowerCase().includes(searchLower) ||
               priceValue.includes(searchLower)
      })
    }

    if (dateRangeFilter && dateRangeFilter.length === 2) {
      const [start, end] = dateRangeFilter
      filtered = filtered.filter(price => {
        const priceStart = dayjs(price.start_date)
        const priceEnd = dayjs(price.end_date)
        return (
          (priceStart.isSameOrAfter(start, 'day') && priceStart.isSameOrBefore(end, 'day')) ||
          (priceEnd.isSameOrAfter(start, 'day') && priceEnd.isSameOrBefore(end, 'day')) ||
          (priceStart.isBefore(start, 'day') && priceEnd.isAfter(end, 'day'))
        )
      })
    }

    return filtered
  }, [roomPrices, searchText, roomTypes, dateRangeFilter])

  const handleDateRangeFilterChange = (dates) => {
    setDateRangeFilter(dates)
  }

  // Kiểm tra trùng lặp thời gian áp dụng
  const checkDateOverlap = (roomTypeId, startDate, endDate, excludePriceId = null) => {
    const newStart = dayjs(startDate)
    const newEnd = dayjs(endDate)
    
    // Lọc các giá phòng cùng loại phòng (trừ giá đang chỉnh sửa nếu có)
    const sameRoomTypePrices = roomPrices.filter(price => {
      if (price.room_type_id !== roomTypeId) return false
      if (excludePriceId && price.price_id === excludePriceId) return false
      return true
    })
    
    // Kiểm tra trùng lặp với từng giá phòng
    for (const price of sameRoomTypePrices) {
      const existingStart = dayjs(price.start_date)
      const existingEnd = dayjs(price.end_date)
      
      // Kiểm tra trùng lặp: khoảng thời gian mới có giao với khoảng thời gian hiện có
      const hasOverlap = (
        (newStart.isSameOrAfter(existingStart) && newStart.isSameOrBefore(existingEnd)) ||
        (newEnd.isSameOrAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) ||
        (newStart.isBefore(existingStart) && newEnd.isAfter(existingEnd))
      )
      
      if (hasOverlap) {
        return true
      }
    }
    
    return false
  }

  // Handle create/update room price
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // Kiểm tra giá > 0
      const priceValue = typeof values.price_per_night === 'string' 
        ? parseFloat(values.price_per_night.replace(/,/g, '')) 
        : parseFloat(values.price_per_night)
      
      if (isNaN(priceValue) || priceValue <= 0) {
        message.error('Giá phải lớn hơn 0')
        return
      }
      
      const startDate = values.date_range[0].format('YYYY-MM-DD')
      const endDate = values.date_range[1].format('YYYY-MM-DD')
      
      // Kiểm tra trùng lặp thời gian áp dụng
      const excludePriceId = editingPrice ? editingPrice.price_id : null
      if (checkDateOverlap(values.room_type_id, startDate, endDate, excludePriceId)) {
        message.error('Đã có 1 giá đang được áp dụng trong khoảng thời gian này, vui lòng không thêm giá')
        return
      }
      
      const priceData = {
        room_type_id: values.room_type_id,
        start_date: startDate,
        end_date: endDate,
        price_per_night: priceValue
      }

      if (editingPrice) {
        await updateRoomPrice(editingPrice.price_id, priceData)
        message.success('Cập nhật giá phòng thành công!')
      } else {
        await createRoomPrice(priceData)
        message.success('Tạo giá phòng mới thành công!')
      }

      setIsModalVisible(false)
      setEditingPrice(null)
      form.resetFields()
      fetchRoomPrices(selectedRoomType)
    } catch (error) {
      // Nếu lỗi từ form validation, không hiển thị message error ở đây
      if (error.errorFields) {
        return
      }
      const errMsg = error?.message || (editingPrice ? 'Không thể cập nhật giá phòng!' : 'Không thể tạo giá phòng!')
      message.error(errMsg)
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingPrice(null)
    form.resetFields()
  }

  // Handle edit room price
  const handleEdit = (record) => {
    setEditingPrice(record)
    setIsModalVisible(true)
  }

  // Handle delete room price
  const handleDelete = async (priceId) => {
    try {
      await deleteRoomPrice(priceId)
      message.success('Xóa giá phòng thành công!')
      fetchRoomPrices(selectedRoomType)
    } catch (error) {
      console.error('Error deleting room price:', error)
      message.error('Không thể xóa giá phòng!')
    }
  }

  // Handle room type filter change
  const handleRoomTypeFilterChange = (roomTypeId) => {
    setSelectedRoomType(roomTypeId)
    fetchRoomPrices(roomTypeId)
  }

  // Get status based on dates
  const getPriceStatus = (startDate, endDate) => {
    const now = dayjs()
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    
    if (now.isBefore(start)) {
      return { color: 'blue', text: 'Sắp áp dụng', icon: <ClockCircleOutlined /> }
    } else if (now.isAfter(end)) {
      return { color: 'default', text: 'Hết hạn', icon: <CloseCircleOutlined /> }
    } else {
      return { color: 'success', text: 'Đang áp dụng', icon: <CheckCircleOutlined /> }
    }
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: roomPrices.length,
      active: roomPrices.filter(p => {
        const now = dayjs()
        const start = dayjs(p.start_date)
        const end = dayjs(p.end_date)
        return now.isAfter(start) && now.isBefore(end)
      }).length,
      upcoming: roomPrices.filter(p => {
        const now = dayjs()
        const start = dayjs(p.start_date)
        return now.isBefore(start)
      }).length,
      expired: roomPrices.filter(p => {
        const now = dayjs()
        const end = dayjs(p.end_date)
        return now.isAfter(end)
      }).length
    }
    return stats
  }, [roomPrices])

  // Table columns
  const columns = [
    {
      title: 'Loại phòng',
      dataIndex: 'room_type_id',
      key: 'room_type_id',
      render: (roomTypeId) => {
        const roomType = roomTypes.find(rt => rt.room_type_id === roomTypeId)
        return roomType ? (
          <div className="room-type-name">
            <Text strong>{roomType.room_type_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Diện tích: {roomType.area}m²
            </Text>
          </div>
        ) : (
          <Text type="secondary">N/A</Text>
        )
      },
      filters: roomTypes.map(rt => ({ text: rt.room_type_name, value: rt.room_type_id })),
      onFilter: (value, record) => record.room_type_id === value
    },
    {
      title: 'Thời gian áp dụng',
      key: 'date_range',

      render: (_, record) => (
        <div>
          <div style={{ fontSize: 13 }}>
            <Text strong>{dayjs(record.start_date).format('DD/MM/YYYY')} - {dayjs(record.end_date).format('DD/MM/YYYY')}</Text> 
          </div>
    
        </div>
      ),
      sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix()
    },
    {
      title: 'Giá/đêm',
      dataIndex: 'price_per_night',
      key: 'price_per_night',
      render: (price) => (
        <div>
          <Badge 
            count={`${parseFloat(price).toLocaleString('vi-VN')}đ`} 
            style={{ backgroundColor: '#52c41a', fontSize: 14, fontWeight: 600 }} 
            showZero 
          />
        </div>
      ),
      sorter: (a, b) => parseFloat(a.price_per_night) - parseFloat(b.price_per_night)
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="action-button edit-button"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa giá phòng này?"
              onConfirm={() => handleDelete(record.price_id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="action-button delete-button"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div className="room-price-management">
      {/* Header */}
      <div className="room-types-header">
        <h2 className="page-title">
          <DollarOutlined /> Quản lý giá phòng
        </h2>
        <Space>
        
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="create-button"
          >
            Thêm giá phòng mới
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng số giá"
              value={statistics.total}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang áp dụng"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Sắp áp dụng"
              value={statistics.upcoming}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Hết hạn"
              value={statistics.expired}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="room-types-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={10} lg={8}>
            <Input
              placeholder="Tìm kiếm theo loại phòng, giá..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="search-input"
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={7} lg={6}>
            <Select
              placeholder="Lọc theo loại phòng"
              style={{ width: '100%' }}
              onChange={handleRoomTypeFilterChange}
              allowClear
              value={selectedRoomType}
              size="large"
            >
              {roomTypes.map(roomType => (
                <Option key={roomType.room_type_id} value={roomType.room_type_id}>
                  {roomType.room_type_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={7} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              size="large"
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              value={dateRangeFilter}
              onChange={handleDateRangeFilterChange}
            />
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredRoomPrices}
        rowKey="price_id"
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              description="Không có dữ liệu giá phòng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
        style={{ width: '100%' }}
        bordered
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingPrice ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingPrice ? 'Chỉnh sửa giá phòng' : 'Thêm giá phòng mới'}</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText={editingPrice ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
        centered
        bodyStyle={{ overflowX: 'hidden' }}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="room_type_id"
                label="Loại phòng"
                rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
              >
                <Select
                  placeholder="Chọn loại phòng"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {roomTypes.map(roomType => (
                    <Option key={roomType.room_type_id} value={roomType.room_type_id}>
                      {roomType.room_type_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="price_per_night"
                label="Giá mỗi đêm (VNĐ)"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá!' },
                  {
                    validator: (_, value) => {
                      if (value === null || value === undefined || value === '') {
                        return Promise.reject(new Error('Vui lòng nhập giá!'))
                      }
                      const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : parseFloat(value)
                      if (isNaN(numValue) || numValue <= 0) {
                        return Promise.reject(new Error('Giá phải lớn hơn 0'))
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <InputNumber
                  placeholder="Nhập giá"
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0.01}
                  step={100000}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_range"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng!' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Divider />

          <div className="form-note">
            <CalendarOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              Lưu ý: Thời gian áp dụng không được trùng lặp với giá phòng khác của cùng loại phòng
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default RoomPriceManagement
