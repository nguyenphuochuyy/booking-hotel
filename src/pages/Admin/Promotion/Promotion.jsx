import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Badge, Divider, Empty, Spin, DatePicker, InputNumber
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  TagOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  PercentageOutlined, DollarOutlined, GiftOutlined
} from '@ant-design/icons'
import { 
  getAllPromotions, createPromotion, updatePromotion, deletePromotion
} from '../../../services/admin.service'
import './promotion.css'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()

  // Fetch promotions data
  const fetchPromotions = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize
      }
      const response = await getAllPromotions(params)
      // Handle different response structures
      let promotions = []
      let total = 0
      if (response) {
        if (Array.isArray(response)) {
          // If response is directly an array
          promotions = response
          total = response.length
        } else if (response.promotions) {
          // If response has promotions property
          promotions = response.promotions
          total = response.total || response.promotions.length
        } else if (response.data) {
          // If response has data property
          promotions = response.data.promotions || response.data
          total = response.data.total || response.data.length
        }
      }
      
      
      setPromotions(promotions)
      setPagination({
        current: page,
        pageSize,
        total: total
      })
    } catch (error) {
      console.error('Error fetching promotions:', error)
      console.error('Error status:', error.status)
      console.error('Error data:', error.data)
      message.error(`Không thể tải danh sách khuyến mãi: ${error.message || 'Lỗi không xác định'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  // Filter promotions based on search
  const filteredPromotions = useMemo(() => {
    let filtered = promotions

    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(promotion => {
        const name = promotion.name?.toLowerCase() || ''
        const description = promotion.description?.toLowerCase() || ''
        const promotion_code = promotion.promotion_code?.toLowerCase() || ''
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               promotion_code.includes(searchLower)
      })
    }

    if (statusFilter) {
      filtered = filtered.filter(promotion => promotion.status === statusFilter)
    }

    return filtered
  }, [promotions, searchText, statusFilter])

  // Handle create/update promotion
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // Map frontend field names to backend field names
      const promotionData = {
        name: values.name,
        description: values.description,
        promotion_code: values.code, // Backend expects 'promotion_code', not 'code'
        discount_type: values.discount_type,
        amount: values.discount_value, // Backend expects 'amount', not 'discount_value'
        start_date: values.date_range[0].format('YYYY-MM-DD'),
        end_date: values.date_range[1].format('YYYY-MM-DD'),
        quantity: values.usage_limit || 0, // Backend expects 'quantity', not 'usage_limit'
        status: values.status
      }
      
      // Remove fields that backend doesn't support
      // min_order_amount and max_discount_amount are not in backend model

      console.log('Sending promotion data:', promotionData)

      if (editingPromotion) {
        await updatePromotion(editingPromotion.promotion_id, promotionData)
        message.success('Cập nhật khuyến mãi thành công!')
      } else {
        await createPromotion(promotionData)
        message.success('Tạo khuyến mãi mới thành công!')
      }

      setIsModalVisible(false)
      setEditingPromotion(null)
      form.resetFields()
      fetchPromotions(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Error saving promotion:', error)
      console.error('Error details:', error.response?.data)
      console.error('Error status:', error.status)
      
      let errMsg = 'Có lỗi xảy ra!'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          errMsg = errorData.message
        } else if (errorData.error) {
          errMsg = errorData.error
        }
      } else if (error?.message) {
        errMsg = error.message
      }
      
      // Specific error handling
      if (errMsg.includes('Unauthorized')) {
        errMsg = 'Bạn không có quyền thực hiện thao tác này!'
      } else if (errMsg.includes('Token')) {
        errMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'
      } else if (errMsg.includes('duplicate') || errMsg.includes('unique')) {
        errMsg = 'Mã khuyến mãi đã tồn tại!'
      }
      
      message.error(errMsg)
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingPromotion(null)
    form.resetFields()
  }

  // Handle edit promotion
  const handleEdit = (record) => {
    setEditingPromotion(record)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      code: record.promotion_code, // Map backend field to frontend field
      discount_type: record.discount_type,
      discount_value: record.amount, // Map backend field to frontend field
      min_order_amount: record.min_order_amount || null,
      max_discount_amount: record.max_discount_amount || null,
      usage_limit: record.quantity, // Map backend field to frontend field
      date_range: [
        dayjs(record.start_date),
        dayjs(record.end_date)
      ],
      status: record.status
    })
    setIsModalVisible(true)
  }

  // Handle delete promotion
  const handleDelete = async (promotionId) => {
    try {
      await deletePromotion(promotionId)
      message.success('Xóa khuyến mãi thành công!')
      fetchPromotions(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Error deleting promotion:', error)
      console.error('Error details:', error.response?.data)
      
      let errMsg = 'Không thể xóa khuyến mãi!'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          errMsg = errorData.message
        } else if (errorData.error) {
          errMsg = errorData.error
        }
      }
      
      // Specific error handling
      if (errMsg.includes('Unauthorized')) {
        errMsg = 'Bạn không có quyền xóa khuyến mãi này!'
      } else if (errMsg.includes('Token')) {
        errMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'
      } else if (errMsg.includes('constraint') || errMsg.includes('foreign key')) {
        errMsg = 'Không thể xóa khuyến mãi đang được sử dụng!'
      }
      
      message.error(errMsg)
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchPromotions(paginationInfo.current, paginationInfo.pageSize)
  }

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
  }

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đang hoạt động' },
      inactive: { color: 'default', icon: <CloseCircleOutlined />, text: 'Không hoạt động' },
      expired: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Hết hạn' }
    }
    const config = statusConfig[status] || statusConfig.inactive
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: promotions.length,
      active: promotions.filter(p => p.status === 'active').length,
      inactive: promotions.filter(p => p.status === 'inactive').length,
      expired: promotions.filter(p => p.status === 'expired').length
    }
    return stats
  }, [promotions])

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'promotion_id',
      key: 'promotion_id',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.promotion_id - b.promotion_id
    },
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => (
        <Tooltip title={name}>
          <Text strong style={{ fontSize: '14px' }}>
            {name}
          </Text>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: 'Mã khuyến mãi',
      dataIndex: 'promotion_code',
      key: 'code',
      width: 120,
      render: (code) => (
        <div className="promotion-code-display">
          <Text code style={{ fontSize: '12px', color: '#1890ff' }}>
            {code}
          </Text>
        </div>
      )
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      key: 'discount_type',
      width: 120,
      align: 'center',
      render: (type) => (
        <Tag color={type === 'percentage' ? 'blue' : 'green'} icon={type === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />}>
          {type === 'percentage' ? 'Phần trăm' : 'Số tiền'}
        </Tag>
      )
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'amount',
      key: 'discount_value',
      width: 120,
      align: 'center',
      render: (value, record) => (
        <Text strong style={{ color: '#52c41a' }}>
          {record.discount_type === 'percentage' ? `${value}%` : `${value.toLocaleString()}đ`}
        </Text>
      )
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'min_order_amount',
      key: 'min_order_amount',
      width: 120,
      align: 'center',
      render: (amount) => (
        <Text>{amount ? `${amount.toLocaleString()}đ` : 'Không giới hạn'}</Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
        { text: 'Hết hạn', value: 'expired' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date)
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date)
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
              description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
              onConfirm={() => handleDelete(record.promotion_id)}
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
    <div className="promotion-management">
      {/* Header */}
      <div className="promotion-header">
        <h2 className="page-title">
          <GiftOutlined /> Quản lý khuyến mãi
        </h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchPromotions(pagination.current, pagination.pageSize)}
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
            Thêm khuyến mãi mới
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng khuyến mãi"
              value={statistics.total}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Không hoạt động"
              value={statistics.inactive}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Hết hạn"
              value={statistics.expired}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="promotion-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={10}>
            <Input
              placeholder="Tìm kiếm theo tên, mô tả, mã khuyến mãi..."
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
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              onChange={handleStatusFilterChange}
              allowClear
              value={statusFilter}
              size="large"
            >
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
              <Option value="expired">Hết hạn</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredPromotions}
        rowKey="promotion_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} khuyến mãi`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: (
            <Empty
              description="Không có dữ liệu khuyến mãi"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingPromotion ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={editingPromotion ? 'Cập nhật' : 'Tạo mới'}
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
                name="name"
                label="Tên khuyến mãi"
                rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
              >
                <Input placeholder="Nhập tên khuyến mãi" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="Mã khuyến mãi"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã khuyến mãi!' },
                  { pattern: /^[A-Z0-9]+$/, message: 'Mã khuyến mãi chỉ chứa chữ hoa và số!' },
                  { min: 3, message: 'Mã khuyến mãi phải có ít nhất 3 ký tự!' },
                  { max: 20, message: 'Mã khuyến mãi không được quá 20 ký tự!' }
                ]}
              >
                <Input placeholder="PROMO2024" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả khuyến mãi..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="discount_type"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
                initialValue="percentage"
              >
                <Select placeholder="Chọn loại giảm giá">
                  <Option value="percentage">
                    <PercentageOutlined /> Phần trăm
                  </Option>
                  <Option value="fixed">
                    <DollarOutlined /> Số tiền cố định
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="discount_value"
                label="Giá trị giảm"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị giảm!' },
                  { type: 'number', min: 0, message: 'Giá trị giảm phải lớn hơn 0!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const discountType = getFieldValue('discount_type')
                      if (discountType === 'percentage' && (value < 0 || value > 100)) {
                        return Promise.reject(new Error('Phần trăm giảm giá phải từ 0-100%'))
                      }
                      if (discountType === 'fixed' && value <= 0) {
                        return Promise.reject(new Error('Số tiền giảm phải lớn hơn 0'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
                dependencies={['discount_type']}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập giá trị giảm"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                initialValue="active"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Đang hoạt động
                  </Option>
                  <Option value="inactive">
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Không hoạt động
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="min_order_amount"
                label="Đơn hàng tối thiểu (đ)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền tối thiểu"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="max_discount_amount"
                label="Giảm tối đa (đ)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền giảm tối đa"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="usage_limit"
                label="Giới hạn sử dụng"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số lần sử dụng tối đa"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="date_range"
                label="Thời gian áp dụng"
                rules={[
                  { required: true, message: 'Vui lòng chọn thời gian áp dụng!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value && value.length === 2) {
                        const [startDate, endDate] = value
                        if (endDate.isBefore(startDate)) {
                          return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'))
                        }
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="form-note">
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              Lưu ý: Mã khuyến mãi phải là duy nhất và không được trùng lặp
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default PromotionManagement