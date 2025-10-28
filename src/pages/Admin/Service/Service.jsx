import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Badge, Divider, Empty, Spin, Upload, Image, InputNumber
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ToolOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  EyeOutlined, UploadOutlined, DollarOutlined, StarOutlined
} from '@ant-design/icons'
import { 
  getAllServices, createService, updateService, deleteService
} from '../../../services/admin.service'
import formatPrice from '../../../utils/formatPrice'
import './service.css'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const ServiceManagement = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()

  // Fetch services data
  const fetchServices = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize
      }
      const response = await getAllServices(params)
      console.log('Services API response:', response)
      
      // Handle different response structures
      let services = []
      let total = 0
      
      if (response) {
        if (Array.isArray(response)) {
          // If response is directly an array
          services = response
          total = response.length
        } else if (response.services) {
          // If response has services property
          services = response.services
          total = response.total || response.services.length
        } else if (response.data) {
          // If response has data property
          services = response.data.services || response.data
          total = response.data.total || response.data.length
        }
      }
      setServices(services)
      setPagination({
        current: page,
        pageSize,
        total: total
      })
    } catch (error) {
      console.error('Error fetching services:', error)
      console.error('Error status:', error.status)
      console.error('Error data:', error.data)
      message.error(`Không thể tải danh sách dịch vụ: ${error.message || 'Lỗi không xác định'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Filter services based on search
  const filteredServices = useMemo(() => {
    let filtered = services

    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(service => {
        const name = service.name?.toLowerCase() || ''
        const description = service.description?.toLowerCase() || ''
        const serviceType = service.service_type?.toLowerCase() || ''
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               serviceType.includes(searchLower)
      })
    }

    if (serviceTypeFilter) {
      filtered = filtered.filter(service => service.service_type === serviceTypeFilter)
    }

    return filtered
  }, [services, searchText, serviceTypeFilter])

  // Handle create/update service
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('description', values.description)
      formData.append('service_type', values.service_type || 'prepaid')
      formData.append('price', values.price)
      formData.append('is_available', values.is_available ? 'true' : 'false')
      // Add hotel_id (required by API)
      formData.append('hotel_id', '1') // Default hotel_id, should be dynamic
      
      // Nếu có ảnh thì thêm vào FormData
      if(values.images && values.images.length > 0) {
        values.images.forEach((image) => {
          formData.append('images', image.originFileObj)
        })
      }

      console.log('Sending service data:', Object.fromEntries(formData.entries()))

      if (editingService) {
        await updateService(editingService.service_id, formData)
        message.success('Cập nhật dịch vụ thành công!')
      } else {
        await createService(formData)
        message.success('Tạo dịch vụ mới thành công!')
      }

      setIsModalVisible(false)
      setEditingService(null)
      form.resetFields()
      fetchServices(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Error saving service:', error)
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
        errMsg = 'Tên dịch vụ đã tồn tại!'
      }
      
      message.error(errMsg)
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingService(null)
    form.resetFields()
  }

  // Handle edit service
  const handleEdit = (record) => {
    setEditingService(record)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      service_type: record.service_type,
      price: record.price,
      is_available: record.is_available
    })
    setIsModalVisible(true)
  }

  // Handle delete service
  const handleDelete = async (serviceId) => {
    try {
      await deleteService(serviceId)
      message.success('Xóa dịch vụ thành công!')
      fetchServices(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Error deleting service:', error)
      console.error('Error details:', error.response?.data)
      
      let errMsg = 'Không thể xóa dịch vụ!'
      
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
        errMsg = 'Bạn không có quyền xóa dịch vụ này!'
      } else if (errMsg.includes('Token')) {
        errMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'
      } else if (errMsg.includes('constraint') || errMsg.includes('foreign key')) {
        errMsg = 'Không thể xóa dịch vụ đang được sử dụng!'
      }
      
      message.error(errMsg)
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchServices(paginationInfo.current, paginationInfo.pageSize)
  }

  // Handle service type filter change
  const handleServiceTypeFilterChange = (serviceType) => {
    setServiceTypeFilter(serviceType)
  }

  // Get availability tag
  const getAvailabilityTag = (isAvailable) => {
    return isAvailable ? (
      <Tag color="success" icon={<CheckCircleOutlined />}>
        Có sẵn
      </Tag>
    ) : (
      <Tag color="default" icon={<CloseCircleOutlined />}>
        Không có sẵn
      </Tag>
    )
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: services.length,
      available: services.filter(s => s.is_available).length,
      unavailable: services.filter(s => !s.is_available).length,
      prepaid: services.filter(s => s.service_type === 'prepaid').length,
      postpaid: services.filter(s => s.service_type === 'postpaid').length
    }
    return stats
  }, [services])

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'service_id',
      key: 'service_id',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.service_id - b.service_id
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => {
        if (images && images.length > 0) {
          return (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {images.slice(0, 2).map((image, index) => (
                <Image
                  key={index}
                  width={40}
                  height={30}
                  src={image.url || image}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              ))}
              {images.length > 2 && (
                <div style={{
                  width: 40,
                  height: 30,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontSize: 10,
                  color: '#999'
                }}>
                  +{images.length - 2}
                </div>
              )}
            </div>
          )
        }
        return (
          <div style={{ 
            width: 60, 
            height: 40, 
            background: '#f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 4,
            fontSize: 12,
            color: '#999'
          }}>
            No Image
          </div>
        )
      }
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 100,
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
      title: 'Loại dịch vụ',
      dataIndex: 'service_type',
      key: 'service_type',
      width: 90,
      render: (serviceType) => (
        <Tag color={serviceType === 'prepaid' ? 'green' : 'orange' }>
          {serviceType === 'prepaid' ? 'Trả trước' : 'Trả sau'}
        </Tag>
      ),
      filters: [
        { text: 'Trả trước', value: 'prepaid' },
        { text: 'Trả sau', value: 'postpaid' }
      ],
      onFilter: (value, record) => record.service_type === value
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'center',
      render: (price) => (
        <div className="price-display">
          <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
            {formatPrice(price)}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_available',
      key: 'is_available',
      width: 100,
      align: 'center',
      render: (isAvailable) => getAvailabilityTag(isAvailable),
      filters: [
        { text: 'Có sẵn', value: true },
        { text: 'Không có sẵn', value: false }
      ],
      onFilter: (value, record) => record.is_available === value
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (description) => (
        <Tooltip title={description}>
          <Text>{description}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
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
              description="Bạn có chắc chắn muốn xóa dịch vụ này?"
              onConfirm={() => handleDelete(record.service_id)}
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
    <div className="service-management">
      {/* Header */}
      <div className="service-header">
        <h2 className="page-title">
          <ToolOutlined /> Quản lý dịch vụ
        </h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchServices(pagination.current, pagination.pageSize)}
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
            Thêm dịch vụ mới
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng dịch vụ"
              value={statistics.total}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Có sẵn"
              value={statistics.available}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Không có sẵn"
              value={statistics.unavailable}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Trả trước"
              value={statistics.prepaid}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Trả sau"
              value={statistics.postpaid}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="service-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={10}>
            <Input
              placeholder="Tìm kiếm theo tên, mô tả, loại dịch vụ..."
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
              placeholder="Lọc theo loại dịch vụ"
              style={{ width: '100%' }}
              onChange={handleServiceTypeFilterChange}
              allowClear
              value={serviceTypeFilter}
              size="large"
            >
              <Option value="prepaid">
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> Trả trước
              </Option>
              <Option value="postpaid">
                <ClockCircleOutlined style={{ color: '#faad14' }} /> Trả sau
              </Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredServices}
        rowKey="service_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} dịch vụ`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: (
            <Empty
              description="Không có dữ liệu dịch vụ"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingService ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText={editingService ? 'Cập nhật' : 'Tạo mới'}
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
                label="Tên dịch vụ"
                rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
              >
                <Input placeholder="Nhập tên dịch vụ" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="service_type"
                label="Loại dịch vụ"
                rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ!' }]}
                initialValue="prepaid"
              >
                <Select placeholder="Chọn loại dịch vụ">
                  <Option value="prepaid">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Trả trước
                  </Option>
                  <Option value="postpaid">
                    <ClockCircleOutlined style={{ color: '#faad14' }} /> Trả sau
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả dịch vụ..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="price"
                label="Giá (đ)"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá!' },
                  { type: 'number', min: 0, message: 'Giá phải lớn hơn 0!' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập giá"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="is_available"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                initialValue={true}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value={true}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Có sẵn
                  </Option>
                  <Option value={false}>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Không có sẵn
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="images"
            label="Hình ảnh"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
              accept="image/*"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>

          <Divider />

          <div className="form-note">
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              Lưu ý: Tên dịch vụ phải là duy nhất và không được trùng lặp
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default ServiceManagement
