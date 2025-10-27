import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Badge, Divider, Empty, Spin
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  HomeOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons'
import { 
  getAllRooms, createRoom, updateRoom, deleteRoom,
  getAllHotels, getAllRoomTypes
} from '../../../services/admin.service'
import './room.css'

const { Title, Text } = Typography
const { Option } = Select

const RoomManagement = () => {
  const [rooms, setRooms] = useState([])
  const [hotels, setHotels] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()

  // Fetch rooms data
  const fetchRooms = async (page = 1, pageSize = 10, hotelId = null) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize
      }
      if (hotelId) {
        params.hotel_id = hotelId
      }
      const response = await getAllRooms(params)
      setRooms(response.rooms || [])
      setPagination({
        current: page,
        pageSize,
        total: response.total || 0
      })
    } catch (error) {
      console.error('Error fetching rooms:', error)
      message.error('Không thể tải danh sách phòng')
    } finally {
      setLoading(false)
    }
  }

  // Fetch hotels for dropdown
  const fetchHotels = async () => {
    try {
      const response = await getAllHotels({ limit: 100 })
      setHotels(response.hotels || [])
    } catch (error) {
      console.error('Error fetching hotels:', error)
      message.error('Không thể tải danh sách khách sạn')
    }
  }

  // Fetch room types for dropdown
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
    fetchRooms()
    fetchHotels()
    fetchRoomTypes()
  }, [])

  // Filter rooms based on search
  const filteredRooms = useMemo(() => {
    if (!searchText) return rooms
    
    const searchLower = searchText.toLowerCase()
    return rooms.filter(room => {
      const roomNum = room.room_num?.toString() || ''
      const hotelName = hotels.find(h => h.hotel_id === room.hotel_id)?.name || ''
      const roomTypeName = roomTypes.find(rt => rt.room_type_id === room.room_type_id)?.room_type_name || ''
      
      return roomNum.includes(searchLower) ||
             hotelName.toLowerCase().includes(searchLower) ||
             roomTypeName.toLowerCase().includes(searchLower)
    })
  }, [rooms, searchText, hotels, roomTypes])

  // Handle create/update room
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      const roomData = {
        hotel_id: values.hotel_id,
        room_num: parseInt(values.room_num),
        status: values.status,
        room_type_id: values.room_type_id
      }
      if (editingRoom) {
        await updateRoom(editingRoom.room_id, roomData)
        message.success('Cập nhật phòng thành công !')
      } else {
        await createRoom(roomData)
        message.success('Tạo phòng mới thành công !')
      }

      setIsModalVisible(false)
      setEditingRoom(null)
      form.resetFields()
      fetchRooms(pagination.current, pagination.pageSize, selectedHotel)
    } catch (error) {
      const errMsg = error?.message || (editingRoom ? 'Không thể cập nhật phòng!' : 'Không thể tạo phòng!')
      message.error(errMsg)
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingRoom(null)
    form.resetFields()
  }

  // Handle edit room
  const handleEdit = (record) => {
    setEditingRoom(record)
    form.setFieldsValue({
      hotel_id: record.hotel_id,
      room_num: record.room_num,
      status: record.status,
      room_type_id: record.room_type_id
    })
    setIsModalVisible(true)
  }

  // Handle delete room
  const handleDelete = async (roomId) => {
    try {
      await deleteRoom(roomId)
      message.success('Xóa phòng thành công!')
      fetchRooms(pagination.current, pagination.pageSize, selectedHotel)
    } catch (error) {
      console.error('Error deleting room:', error)
      message.error('Không thể xóa phòng!')
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchRooms(paginationInfo.current, paginationInfo.pageSize, selectedHotel)
  }

  // Handle hotel filter change
  const handleHotelFilterChange = (hotelId) => {
    setSelectedHotel(hotelId)
    fetchRooms(1, pagination.pageSize, hotelId)
  }

  // Get status tag
  const getStatusTag = (status) => { 
    // lấy status từ database và hiển thị tương ứng với status từ danh sách các phòng
    const statusConfig = {

      available: { color: 'success', icon: <CheckCircleOutlined />, text: 'Có sẵn' },
      booked: { color: 'error', icon: <CloseCircleOutlined />, text: 'Đã đặt' },
      cleaning: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Đang dọn' },
      in_use: { color: '#27669e', icon: <CheckCircleOutlined />, text: 'Đang sử dụng' },
      checked_out: { color: '#ccc', icon: <CloseCircleOutlined />, text: 'Đã trả phòng' },
    }
    const config = statusConfig[status] || statusConfig.available
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: rooms.length,
      available: rooms.filter(r => r.status === 'available').length,
      booked: rooms.filter(r => r.status === 'booked').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length
    }
    return stats
  }, [rooms])

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'room_id',
      key: 'room_id',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.room_id - b.room_id
    },
    {
      title: 'Khách sạn',
      dataIndex: 'hotel_id',
      key: 'hotel_id',
      width: 200,
      render: (hotelId) => {
        const hotel = hotels.find(h => h.hotel_id === hotelId)
        return hotel ? (
        <div className="hotel-name">
          <HomeOutlined style={{ color: '#1890ff' }} />
          <Text strong>{hotel.name}</Text>
        </div>
        ) : (
          <Text type="secondary">N/A</Text>
        )
      },
      filters: hotels.map(h => ({ text: h.name, value: h.hotel_id })),
      onFilter: (value, record) => record.hotel_id === value
    },
    {
      title: 'Số phòng',
      dataIndex: 'room_num',
      key: 'room_num',
      width: 120,
      align: 'center',
      render: (num) => (
        <div className="room-number-display">
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            {num}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.room_num - b.room_num
    },
    {
      title: 'Loại phòng',
      dataIndex: 'room_type_id',
      key: 'room_type_id',
      width: 180,
      render: (roomTypeId) => {
        const roomType = roomTypes.find(rt => rt.room_type_id === roomTypeId)
        return roomType ? (
          <Tooltip title={`Diện tích: ${roomType.area}m² - Số lượng: ${roomType.quantity}`}>
            <Text>{roomType.room_type_name}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">N/A</Text>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Có sẵn', value: 'available' },
        { text: 'Đã đặt', value: 'booked' },
        { text: 'Đang dọn', value: 'cleaning' },
        { text: 'Đang sử dụng', value: 'in_use' },
        { text: 'Đã trả phòng', value: 'checked_out' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right',
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
              description="Bạn có chắc chắn muốn xóa phòng này?"
              onConfirm={() => handleDelete(record.room_id)}
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
    <div className="room-management">
      {/* Header */}
      <div className="room-types-header">
        <h2 className="page-title">
          <HomeOutlined /> Quản lý phòng
        </h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchRooms(pagination.current, pagination.pageSize, selectedHotel)}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="create-button"
          >
            Thêm phòng mới
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng số phòng"
              value={statistics.total}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Phòng có sẵn"
              value={statistics.available}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Phòng đã đặt"
              value={statistics.booked}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang dọn dẹp"
              value={statistics.cleaning}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="room-types-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={10}>
            <Input
              placeholder="Tìm kiếm theo số phòng, khách sạn, loại phòng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="search-input"
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={8}>
            <Select
              placeholder="Lọc theo khách sạn"
              style={{ width: '100%' }}
              onChange={handleHotelFilterChange}
              allowClear
              value={selectedHotel}
              size="large"
            >
              {hotels.map(hotel => (
                <Option key={hotel.hotel_id} value={hotel.hotel_id}>
                  {hotel.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredRooms}
        rowKey="room_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} phòng`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: (
            <Empty
              description="Không có dữ liệu phòng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingRoom ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText={editingRoom ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
        centered
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="hotel_id"
                label="Khách sạn"
                rules={[{ required: true, message: 'Vui lòng chọn khách sạn!' }]}
              >
                <Select
                  placeholder="Chọn khách sạn"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {hotels.map(hotel => (
                    <Option key={hotel.hotel_id} value={hotel.hotel_id}>
                      {hotel.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="room_num"
                label="Số phòng"
                rules={[
                  { required: true, message: 'Vui lòng nhập số phòng!' },
                  { pattern: /^\d+$/, message: 'Số phòng phải là số nguyên!' }
                ]}
              >
                <Input placeholder="Nhập số phòng (ví dụ: 101, 202...)" />
              </Form.Item>
            </Col>
          </Row>

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
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                initialValue="available"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="available">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Có sẵn
                  </Option>
                  <Option value="booked">
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Đã đặt
                  </Option>
                    <Option value="cleaning">
                      <ClockCircleOutlined style={{ color: '#faad14' }} /> Đang dọn
                    </Option>
                  <Option value="in_use">
                    <CheckCircleOutlined style={{ color: '#27669e' }} /> Đang sử dụng
                  </Option>
                  <Option value="checked_out">
                    <CloseCircleOutlined style={{ color: '#ccc' }} /> Đã trả phòng
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="form-note">
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              Lưu ý: Số phòng phải là duy nhất trong mỗi khách sạn
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default RoomManagement
