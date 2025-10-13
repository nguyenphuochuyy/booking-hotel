import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Badge, Divider, Empty, Upload, Image
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  SettingOutlined, ReloadOutlined, HomeOutlined,
  EyeOutlined, UploadOutlined, ExclamationCircleOutlined
} from '@ant-design/icons'
import { 
  getAllServices, createService, updateService, deleteService,
  getAllHotels
} from '../../../services/admin.service'
import './service.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const ServiceManagement = () => {
  const [services, setServices] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()

  // Fetch services data
  const fetchServices = async (page = 1, pageSize = 10, hotelId = null) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize
      }
      if (hotelId) {
        params.hotel_id = hotelId
      }
      const response = await getAllServices(params)
      setServices(response.services || [])
      setPagination({
        current: page,
        pageSize,
        total: response.pagination?.totalItems || 0
      })
    } catch (error) {
      console.error('Error fetching services:', error)
      message.error('Không thể tải danh sách dịch vụ')
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

  useEffect(() => {
    fetchServices()
    fetchHotels()
  }, [])

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!searchText) return services
    
    const searchLower = searchText.toLowerCase()
    return services.filter(service => {
      const serviceName = service.name?.toLowerCase() || ''
      const serviceDesc = service.description?.toLowerCase() || ''
      const hotelName = hotels.find(h => h.hotel_id === service.hotel_id)?.name?.toLowerCase() || ''
      
      return serviceName.includes(searchLower) ||
             serviceDesc.includes(searchLower) ||
             hotelName.includes(searchLower)
    })
  }, [services, searchText, hotels])

  // Handle upload change
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  // Handle preview
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImages([file.url || file.preview])
    setPreviewIndex(0)
    setPreviewVisible(true)
  }

  // Handle image preview from table
  const handleImagePreview = (images, index) => {
    setPreviewImages(images)
    setPreviewIndex(index)
    setPreviewVisible(true)
  }

  // Get base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Handle create/update service
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      const formData = new FormData()
      formData.append('hotel_id', values.hotel_id)
      formData.append('name', values.name)
      formData.append('description', values.description || '')

      // Add existing images if editing
      if (editingService && editingService.images && Array.isArray(editingService.images)) {
        formData.append('existingImages', JSON.stringify(editingService.images))
      }

      // Add new files
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj)
        }
      })

      if (editingService) {
        await updateService(editingService.service_id, formData)
        message.success('Cập nhật dịch vụ thành công!')
      } else {
        await createService(formData)
        message.success('Tạo dịch vụ mới thành công!')
      }

      setIsModalVisible(false)
      setEditingService(null)
      setFileList([])
      form.resetFields()
      fetchServices(pagination.current, pagination.pageSize, selectedHotel)
    } catch (error) {
      console.error('Error saving service:', error)
      const errMsg = error?.message || (editingService ? 'Không thể cập nhật dịch vụ!' : 'Không thể tạo dịch vụ!')
      message.error(errMsg)
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingService(null)
    setFileList([])
    form.resetFields()
  }

  // Handle edit service
  const handleEdit = (record) => {
    setEditingService(record)
    form.setFieldsValue({
      hotel_id: record.hotel_id,
      name: record.name,
      description: record.description
    })

    // Set existing images
    if (record.images && Array.isArray(record.images) && record.images.length > 0) {
      const existingFiles = record.images.map((url, index) => ({
        uid: `-existing-${index}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url: url,
      }))
      setFileList(existingFiles)
    } else {
      setFileList([])
    }
    setIsModalVisible(true)
  }

  // Handle delete service
  const handleDelete = async (serviceId) => {
    try {
      await deleteService(serviceId)
      message.success('Xóa dịch vụ thành công!')
      fetchServices(pagination.current, pagination.pageSize, selectedHotel)
    } catch (error) {
      console.error('Error deleting service:', error)
      message.error('Không thể xóa dịch vụ!')
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchServices(paginationInfo.current, paginationInfo.pageSize, selectedHotel)
  }

  // Handle hotel filter change
  const handleHotelFilterChange = (hotelId) => {
    setSelectedHotel(hotelId)
    fetchServices(1, pagination.pageSize, hotelId)
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: services.length,
      withImages: services.filter(s => s.images && Array.isArray(s.images) && s.images.length > 0).length,
      withoutImages: services.filter(s => !s.images || !Array.isArray(s.images) || s.images.length === 0).length,
      totalImages: services.reduce((sum, s) => sum + (s.images?.length || 0), 0)
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
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => (
        <Text strong style={{ fontSize: 14 }}>
          {name}
        </Text>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (description) => (
        <Text 
          type="secondary" 
          style={{ 
            fontSize: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {description || 'Không có mô tả'}
        </Text>
      )
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 120,
      render: (images, record) => {
        const imageArray = Array.isArray(images) ? images : []
        const imageCount = imageArray.length
        if (imageCount === 0) {
          return (
            <div style={{ 
              width: 80, 
              height: 60, 
              background: '#f5f5f5', 
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c8c8c',
              fontSize: 12
            }}>
              Không có ảnh
            </div>
          )
        }
        return (
          <div className="image-preview-overlay" style={{ position: 'relative', width: 80, height: 60 }}>
            <Image
              width={80}
              height={60}
              src={imageArray[0]}
              alt="service"
              style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
              onClick={() => handleImagePreview(imageArray, 0)}
              preview={false}
            />
            {imageCount > 1 && (
              <div className="image-count-badge" onClick={() => handleImagePreview(imageArray, 0)}>
                <EyeOutlined style={{ fontSize: 8 }} /> +{imageCount - 1}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: 'Số ảnh',
      dataIndex: 'images',
      key: 'image_count',
      width: 80,
      align: 'center',
      render: (images) => {
        const count = Array.isArray(images) ? images.length : 0
        return (
          <Badge count={count} style={{ backgroundColor: '#1890ff' }} showZero />
        )
      },
      sorter: (a, b) => (a.images?.length || 0) - (b.images?.length || 0)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
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
      <div className="room-types-header">
        <h2 className="page-title">
          <SettingOutlined /> Quản lý dịch vụ
        </h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchServices(pagination.current, pagination.pageSize, selectedHotel)}
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
              title="Tổng số dịch vụ"
              value={statistics.total}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Có hình ảnh"
              value={statistics.withImages}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Không có hình ảnh"
              value={statistics.withoutImages}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng số ảnh"
              value={statistics.totalImages}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="room-types-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={10}>
            <Input
              placeholder="Tìm kiếm theo tên dịch vụ, mô tả, khách sạn..."
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
        scroll={{ x: 1400 }}
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
                name="name"
                label="Tên dịch vụ"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên dịch vụ!' },
                  { min: 2, message: 'Tên dịch vụ phải có ít nhất 2 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên dịch vụ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              placeholder="Nhập mô tả dịch vụ..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            extra="Tối đa 10 ảnh, mỗi ảnh không quá 5MB"
          >
            <Upload
              listType="picture-card"
              multiple
              accept="image/*"
              fileList={fileList}
              onChange={handleUploadChange}
              onPreview={handlePreview}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/')
                if (!isImage) {
                  message.error('Chỉ được upload file ảnh!')
                  return false
                }
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isLt5M) {
                  message.error('Kích thước ảnh phải nhỏ hơn 5MB!')
                  return false
                }
                if (fileList.length >= 10) {
                  message.error('Tối đa 10 ảnh!')
                  return false
                }
                return false // Prevent auto upload
              }}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            >
              {fileList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Divider />

          <div className="form-note">
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              Lưu ý: Hình ảnh sẽ được lưu trữ trên cloud storage và có thể mất vài giây để upload
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title={`Hình ảnh dịch vụ (${previewImages.length} ảnh)`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="50%"
        style={{ top: 20 }}
        centered
        destroyOnClose
      >
        <div style={{ textAlign: 'center' }}>
          <Image.PreviewGroup items={previewImages.map((url, index) => ({ src: url, alt: `Ảnh ${index + 1}` }))} current={previewIndex}>
            <div className="preview-grid">
              {previewImages.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Ảnh ${index + 1}`}
                  style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </Modal>
    </div>
  )
}

export default ServiceManagement

