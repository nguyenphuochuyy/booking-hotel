import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  message,
  Image,
  Upload,
  Tag,
  InputNumber,
  Select
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons'
import {
  getAllRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType
} from '../../../services/admin.service'
import './roomType.css'
import { useRoomTypes } from '../../../hooks/roomtype'
const { Title } = Typography
const { Search } = Input
const { TextArea } = Input

// Danh sách tiện nghi mẫu
const AMENITIES_OPTIONS = [
  'WiFi miễn phí',
  'Điều hòa',
  'Tivi',
  'Tủ lạnh',
  'Nước nóng',
  'Ban công',
  'Bồn tắm',
  'Máy sấy tóc',
  'Két sắt',
  'Minibar',
  'Bàn làm việc',
  'Sofa',
  'Tầm nhìn biển',
  'Tầm nhìn thành phố',
  'Không hút thuốc'
]

// Danh sách danh mục loại phòng
const CATEGORY_OPTIONS = [
  { label: 'Đơn thường', value: 'don-thuong' },
  { label: 'Đơn VIP', value: 'don-vip' },
  { label: 'Đôi thường', value: 'doi-thuong' },
  { label: 'Đôi VIP', value: 'doi-vip' },
  { label: 'Gia đình', value: 'gia-dinh' },
  { label: 'Suite', value: 'suite' },
  { label: 'Presidential', value: 'presidential' }
]

function RoomTypes() {
  const [loading, setLoading] = useState(false)
  const [allRoomTypes, setAllRoomTypes] = useState([])
  const [filteredRoomTypes, setFilteredRoomTypes] = useState([])
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRoomType, setEditingRoomType] = useState(null)
  const [fileList, setFileList] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [form] = Form.useForm()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [previewIndex, setPreviewIndex] = useState(0)

  // Fetch danh sách room types từ API - chỉ gọi 1 lần hoặc khi có CRUD
  const fetchRoomTypes = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 1000,
      }

      const response = await getAllRoomTypes(params)
      const roomTypesData = response?.roomTypes || []

      const roomTypesWithKey = roomTypesData.map(roomType => ({
        ...roomType,
        key: roomType.room_type_id
      }))

      setAllRoomTypes(roomTypesWithKey)
      setFilteredRoomTypes(roomTypesWithKey)
      setPagination(prev => ({
        ...prev,
        total: roomTypesWithKey.length,
      }))
    } catch (error) {
      console.error('Error fetching room types:', error)
      message.error(error.message || 'Không thể tải danh sách loại phòng')
    } finally {
      setLoading(false)
    }
  }

  // Chỉ fetch room types khi component mount
  useEffect(() => {
    fetchRoomTypes()
  }, [])

  // Filter room types khi searchText thay đổi
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredRoomTypes(allRoomTypes)
      setPagination(prev => ({
        ...prev,
        total: allRoomTypes.length,
        current: 1,
      }))
      return
    }

    const searchLower = searchText.toLowerCase()
    const filtered = allRoomTypes.filter(roomType => {
      return (
        roomType.room_type_name?.toLowerCase().includes(searchLower) ||
        roomType.description?.toLowerCase().includes(searchLower)
      )
    })

    setFilteredRoomTypes(filtered)
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      current: 1,
    }))
  }, [searchText, allRoomTypes])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'room_type_id',
      key: 'room_type_id',
      width: 70,
      sorter: (a, b) => a.room_type_id - b.room_type_id
  
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
            <div style={{ width: 80, height: 60, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
              <AppstoreOutlined style={{ fontSize: 24, color: '#999' }} />
            </div>
          )
        }

        return (
          <div className="image-preview-overlay" style={{ position: 'relative', width: 80, height: 60 }}>
            <Image
              width={80}
              height={60}
              src={imageArray[0]}
              alt="room type"
              style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
              onClick={() => handleImagePreview(imageArray, 0)}
              preview={false}
            />
            {imageCount > 1 && (
              <div
                className="image-count-badge"
                onClick={() => handleImagePreview(imageArray, 0)}
              >
                <EyeOutlined style={{ fontSize: 8 }} />
                +{imageCount - 1}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: 'Tên loại phòng',
      dataIndex: 'room_type_name',
      key: 'room_type_name',
      render: (text) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
      sorter: (a, b) => {
        if (!a.room_type_name) return -1;
        if (!b.room_type_name) return 1;
        return a.room_type_name.localeCompare(b.room_type_name, 'vi', { sensitivity: 'base' });
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => {
        const categoryOption = CATEGORY_OPTIONS.find(opt => opt.value === category)
        return categoryOption ? (
          <Tag color="blue">{categoryOption.label}</Tag>
        ) : (
          <Tag color="default">{category || '-'}</Tag>
        )
      },
      sorter: (a, b) => {
        if (!a.category) return -1;
        if (!b.category) return 1;
        return a.category.localeCompare(b.category, 'vi', { sensitivity: 'base' });
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Số khách',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (capacity) => (
        <Tag color="green">{capacity ? `${capacity} người` : '-'}</Tag>
      ),
    },
    {
      title: 'Diện tích',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      render: (area) => area ? `${area} m²` : '-',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => <Tag color="blue">{quantity} phòng</Tag>,
    },
    {
      title: 'Tiện nghi',
      dataIndex: 'amenities',
      key: 'amenities',
      width: 200,
      render: (amenities) => {
        const list = Array.isArray(amenities) ? amenities : []
        return list.length > 0 ? (
          <div>
            {list.slice(0, 3).map((item, index) => (
              <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                {item}
              </Tag>
            ))}
            {list.length > 3 && (
              <Tag color="default">+{list.length - 3} thêm</Tag>
            )}
          </div>
        ) : '-'
      },
    },
    {
      title: 'Số ảnh',
      dataIndex: 'images',
      key: 'image_count',
      width: 90,
      render: (images) => {
        const count = Array.isArray(images) ? images.length : 0
        return <Tag color={count > 0 ? 'blue' : 'default'}>{count} ảnh</Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
      sorter: (a, b) => {
        if (!a.created_at) return -1;
        if (!b.created_at) return 1;
        return new Date(a.created_at) - new Date(b.created_at);
      },
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record) => {
    setEditingRoomType(record)
    form.setFieldsValue({
      room_type_name: record.room_type_name,
      category: record.category,
      capacity: record.capacity,
      description: record.description,
      amenities: Array.isArray(record.amenities) ? record.amenities : [],
      area: record.area,
      quantity: record.quantity,
    })

    // Set existing images to fileList for preview
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

  const handleDelete = (record) => {
    const imageCount = Array.isArray(record.images) ? record.images.length : 0

    Modal.confirm({
      title: 'Xác nhận xóa loại phòng',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Bạn có chắc chắn muốn xóa loại phòng <strong>"{record.room_type_name}"</strong>?
          </p>

          <div style={{
            background: '#fff1f0',
            border: '1px solid #ffccc7',
            borderRadius: 6,
            padding: 12,
            marginBottom: 8
          }}>
            <div style={{ color: '#ff4d4f', fontSize: 13 }}>
              ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#595959' }}>
            <div>• Tất cả phòng thuộc loại này sẽ bị ảnh hưởng</div>
            <div>• {imageCount} ảnh sẽ bị xóa vĩnh viễn khỏi server</div>
          </div>
        </div>
      ),
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      width: 520,
      centered: true,
      autoFocusButton: null,
      onOk: async () => {
        message.loading({ content: 'Đang xóa loại phòng...', key: 'deleteRoomType', duration: 0 })

        try {
          await deleteRoomType(record.room_type_id)

          message.success({
            content: `Đã xóa loại phòng "${record.room_type_name}" thành công!${imageCount > 0 ? ` (${imageCount} ảnh đã được xóa)` : ''}`,
            key: 'deleteRoomType',
            duration: 3
          })

          setTimeout(() => {
            fetchRoomTypes()
          }, 500)

        } catch (error) {
          console.error('Error deleting room type:', error)

          message.error({
            content: `Không thể xóa loại phòng "${record.room_type_name}". ${error.message || 'Vui lòng thử lại.'}`,
            key: 'deleteRoomType',
            duration: 5
          })
        }
      },
    })
  }

  const handleAddNew = () => {
    setEditingRoomType(null)
    form.resetFields()
    setFileList([])
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      // Tạo FormData để upload images
      const formData = new FormData()
      formData.append('room_type_name', values.room_type_name)
      formData.append('category', values.category || '')
      formData.append('capacity', values.capacity || 0)
      formData.append('description', values.description || '')
      formData.append('area', values.area || 0)
      formData.append('quantity', values.quantity || 0)

      // Xử lý amenities
      if (values.amenities && values.amenities.length > 0) {
        formData.append('amenities', JSON.stringify(values.amenities))
      }

      // Thêm các file mới vào FormData
      const newFiles = fileList.filter(file => file.originFileObj)
      newFiles.forEach(file => {
        formData.append('images', file.originFileObj)
      })

      // Nếu đang edit, giữ lại các ảnh cũ
      if (editingRoomType) {
        const existingImages = fileList
          .filter(file => !file.originFileObj && file.url)
          .map(file => file.url)

        if (existingImages.length > 0) {
          formData.append('existingImages', JSON.stringify(existingImages))
        }
      }

      setLoading(true)

      if (editingRoomType) {
        await updateRoomType(editingRoomType.room_type_id, formData)
        message.success('Cập nhật loại phòng thành công')
      } else {
        await createRoomType(formData)
        message.success('Tạo loại phòng thành công')
      }

      setIsModalVisible(false)
      setEditingRoomType(null)
      setFileList([])
      form.resetFields()
      fetchRoomTypes()
    } catch (error) {
      if (error.errorFields) {
        return
      }
      console.error('Error saving room type:', error)
      message.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingRoomType(null)
    setFileList([])
    form.resetFields()
  }

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    })
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleImagePreview = (images, startIndex = 0) => {
    setPreviewImages(images)
    setPreviewIndex(startIndex)
    setPreviewVisible(true)
  }

  const handlePreviewClose = () => {
    setPreviewVisible(false)
    setPreviewImages([])
    setPreviewIndex(0)
  }

  // Upload handlers
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    window.open(file.url || file.preview, '_blank')
  }

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const uploadProps = {
    listType: 'picture-card',
    multiple: true,
    accept: 'image/*',
    fileList: fileList,
    onChange: handleUploadChange,
    onPreview: handlePreview,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Chỉ được upload file ảnh!')
        return Upload.LIST_IGNORE
      }

      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('Kích thước ảnh phải nhỏ hơn 5MB!')
        return Upload.LIST_IGNORE
      }

      if (fileList.length >= 10) {
        message.warning('Chỉ được upload tối đa 10 ảnh!')
        return Upload.LIST_IGNORE
      }

      return false
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  }

  return (
    <div className="room-types-management">
      <div className="room-types-header">
        <Title level={2}>Quản lý loại phòng</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAddNew}
        >
          Thêm loại phòng
        </Button>
      </div>

      <div className="room-types-search">
        <Search
          placeholder="Tìm kiếm theo tên loại phòng hoặc mô tả"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredRoomTypes}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} loại phòng`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1700 }}
      />

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppstoreOutlined />
            <span>{editingRoomType ? 'Cập nhật loại phòng' : 'Thêm loại phòng mới'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={900}
        okText={editingRoomType ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        confirmLoading={loading}
        centered
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          name="roomTypeForm"
        >
          <Form.Item
            name="room_type_name"
            label="Tên loại phòng"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại phòng!' }]}
          >
            <Input placeholder="VD: Phòng Deluxe, Phòng Suite" size="large" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select
                placeholder="Chọn danh mục"
                size="large"
                options={CATEGORY_OPTIONS}
              />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Số lượng khách"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng khách!' },
                { type: 'number', min: 1, max: 20, message: 'Số khách từ 1-20 người!' }
              ]}
            >
              <InputNumber
                placeholder="Số khách"
                size="large"
                min={1}
                max={20}
                style={{ width: '100%' }}
                addonAfter="người"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả về loại phòng"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="area"
              label="Diện tích (m²)"
              rules={[
                { required: true, message: 'Vui lòng nhập diện tích!' }
              ]}
            >
              <InputNumber
                placeholder="Nhập diện tích"
                size="large"
                min={1}
                max={500}
                style={{ width: '100%' }}
                addonAfter="m²"
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng phòng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' }
              ]}
            >
              <InputNumber
                placeholder="Số lượng"
                size="large"
                min={0}
                max={1000}
                style={{ width: '100%' }}
                addonAfter="phòng"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="amenities"
            label="Tiện nghi"
            extra="Chọn các tiện nghi có sẵn trong phòng"
          >
            <Select
              mode="tags"
              size="large"
              placeholder="Chọn hoặc nhập tiện nghi"
              options={AMENITIES_OPTIONS.map(item => ({ label: item, value: item }))}
              maxTagCount="responsive"
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh loại phòng"
            extra="Tải lên tối đa 10 ảnh, mỗi ảnh không quá 5MB"
          >
            <Upload {...uploadProps}>
              {fileList.length >= 10 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title={`Hình ảnh loại phòng (${previewImages.length} ảnh)`}
        open={previewVisible}
        onCancel={handlePreviewClose}
        footer={null}
        width="50%"
        style={{ top: 20 }}
        centered
        destroyOnHidden
      >
        <div style={{ textAlign: 'center' }}>
          <Image.PreviewGroup
            items={previewImages.map((url, index) => ({
              src: url,
              alt: `Ảnh ${index + 1}`
            }))}
            current={previewIndex}
          >
            <div className="preview-grid">
              {previewImages.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Ảnh ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </Modal>
    </div>
  )
}

export default RoomTypes

