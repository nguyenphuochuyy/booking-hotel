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
  PercentageOutlined, DollarOutlined
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
      setPromotions(response.promotions || [])
      setPagination({
        current: page,
        pageSize,
        total: response.total || 0
      })
    } catch (error) {
      console.error('Error fetching promotions:', error)
      message.error('Không thể tải danh sách khuyến mãi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  // Filter promotions based on search
  const filteredPromotions = useMemo(() => {
    if (!searchText) return promotions
    
    const searchLower = searchText.toLowerCase()
    return promotions.filter(promotion => {
      const code = promotion.promotion_code?.toLowerCase() || ''
      const name = promotion.name?.toLowerCase() || ''
      const description = promotion.description?.toLowerCase() || ''
      
      return code.includes(searchLower) ||
             name.includes(searchLower) ||
             description.includes(searchLower)
    })
  }, [promotions, searchText])

  // Handle create/update promotion
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      const promotionData = {
        promotion_code: values.promotion_code,
        name: values.name,
        description: values.description,
        discount_type: values.discount_type,
        amount: values.amount,
        start_date: values.date_range[0].format('YYYY-MM-DD HH:mm:ss'),
        end_date: values.date_range[1].format('YYYY-MM-DD HH:mm:ss'),
        status: values.status,
        max_usage: values.max_usage,
        min_order_amount: values.min_order_amount
      }

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
      const errMsg = error?.message || (editingPromotion ? 'Không thể cập nhật khuyến mãi!' : 'Không thể tạo khuyến mãi!')
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
      promotion_code: record.promotion_code,
      name: record.name,
      description: record.description,
      discount_type: record.discount_type,
      amount: record.amount,
      date_range: [
        dayjs(record.start_date),
        dayjs(record.end_date)
      ],
      status: record.status,
      max_usage: record.max_usage,
      min_order_amount: record.min_order_amount
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
      message.error('Không thể xóa khuyến mãi!')
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchPromotions(paginationInfo.current, paginationInfo.pageSize)
  }

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoạt động' },
      inactive: { color: 'default', icon: <ClockCircleOutlined />, text: 'Tạm dừng' },
      expired: { color: 'error', icon: <CloseCircleOutlined />, text: 'Hết hạn' }
    }
    const config = statusConfig[status] || statusConfig.inactive
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // Get discount type tag
  const getDiscountTypeTag = (type, amount) => {
    const isPercentage = type === 'percentage'
    return (
      <Tag color={isPercentage ? 'blue' : 'green'} icon={isPercentage ? <PercentageOutlined /> : <DollarOutlined />}>
        {isPercentage ? `${amount}%` : `${amount.toLocaleString('vi-VN')} VNĐ`}
      </Tag>
    )
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const now = dayjs()
    const stats = {
      total: promotions.length,
      active: promotions.filter(p => p.status === 'active' && dayjs(p.end_date).isAfter(now)).length,
      inactive: promotions.filter(p => p.status === 'inactive').length,
      expired: promotions.filter(p => dayjs(p.end_date).isBefore(now)).length
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
      title: 'Mã khuyến mãi',
      dataIndex: 'promotion_code',
      key: 'promotion_code',
      width: 150,
      render: (code) => (
        <div className="promotion-code-display">
          <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
            {code}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.promotion_code.localeCompare(b.promotion_code)
    },
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => (
        <Tooltip title={name}>
          <Text strong>{name}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      key: 'discount_type',
      width: 150,
      align: 'center',
      render: (type, record) => getDiscountTypeTag(type, record.amount),
      filters: [
        { text: 'Phần trăm', value: 'percentage' },
        { text: 'Số tiền', value: 'fixed' }
      ],
      onFilter: (value, record) => record.discount_type === value
    },
    {
      title: 'Giá trị',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'center',
      render: (amount, record) => (
        <Text strong style={{ color: '#52c41a' }}>
          {record.discount_type === 'percentage' 
            ? `${amount}%` 
            : `${amount.toLocaleString('vi-VN')} VNĐ`
          }
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Thời gian',
      dataIndex: 'start_date',
      key: 'date_range',
      width: 200,
      render: (_, record) => (
        <div className="date-range-display">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Từ: {dayjs(record.start_date).format('DD/MM/YYYY')}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Đến: {dayjs(record.end_date).format('DD/MM/YYYY')}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status, record) => {
        const now = dayjs()
        const isExpired = dayjs(record.end_date).isBefore(now)
        const actualStatus = isExpired ? 'expired' : status
        return getStatusTag(actualStatus)
      },
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Tạm dừng', value: 'inactive' },
        { text: 'Hết hạn', value: 'expired' }
      ],
      onFilter: (value, record) => {
        const now = dayjs()
        const isExpired = dayjs(record.end_date).isBefore(now)
        if (value === 'expired') return isExpired
        return !isExpired && record.status === value
      }
    },
    {
      title: 'Số lần sử dụng',
      dataIndex: 'usage_count',
      key: 'usage_count',
      width: 120,
      align: 'center',
      render: (count, record) => (
        <div className="usage-display">
          <Badge 
            count={count || 0} 
            style={{ backgroundColor: '#1890ff' }} 
            showZero 
          />
          {record.max_usage && (
            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
              / {record.max_usage}
            </Text>
          )}
        </div>
      )
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
          <TagOutlined /> Quản lý khuyến mãi
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
              prefix={<TagOutlined />}
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
              title="Tạm dừng"
              value={statistics.inactive}
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

      {/* Search */}
      <div className="promotion-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={10}>
            <Input
              placeholder="Tìm kiếm theo mã, tên, mô tả khuyến mãi..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="search-input"
              size="large"
            />
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
        scroll={{ x: 1400 }}
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
                name="promotion_code"
                label="Mã khuyến mãi"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã khuyến mãi!' },
                  { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ chứa chữ hoa, số, gạch ngang và gạch dưới!' }
                ]}
              >
                <Input placeholder="Nhập mã khuyến mãi (ví dụ: SUMMER2024)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên khuyến mãi"
                rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
              >
                <Input placeholder="Nhập tên khuyến mãi" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea 
              placeholder="Nhập mô tả khuyến mãi" 
              rows={3}
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
                    <PercentageOutlined /> Phần trăm (%)
                  </Option>
                  <Option value="fixed">
                    <DollarOutlined /> Số tiền cố định
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="amount"
                label="Giá trị giảm"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị giảm!' },
                  { type: 'number', min: 0, message: 'Giá trị phải lớn hơn 0!' }
                ]}
              >
                <InputNumber
                  placeholder="Nhập giá trị"
                  style={{ width: '100%' }}
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
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Hoạt động
                  </Option>
                  <Option value="inactive">
                    <ClockCircleOutlined style={{ color: '#faad14' }} /> Tạm dừng
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_range"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng!' }]}
          >
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="max_usage"
                label="Số lần sử dụng tối đa"
                rules={[
                  { type: 'number', min: 1, message: 'Số lần sử dụng phải lớn hơn 0!' }
                ]}
              >
                <InputNumber
                  placeholder="Nhập số lần sử dụng tối đa"
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="min_order_amount"
                label="Đơn hàng tối thiểu (VNĐ)"
                rules={[
                  { type: 'number', min: 0, message: 'Số tiền phải lớn hơn hoặc bằng 0!' }
                ]}
              >
                <InputNumber
                  placeholder="Nhập số tiền tối thiểu"
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
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
