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
  Tag
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  HomeOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { 
  getAllHotels, 
  createHotel, 
  updateHotel, 
  deleteHotel 
} from '../../../services/admin.service'
import './hotel.css'

const { Title } = Typography
const { Search } = Input
const { TextArea } = Input

function Hotels() {
  const [loading, setLoading] = useState(false)
  const [allHotels, setAllHotels] = useState([]) // Cache toàn bộ hotels
  const [filteredHotels, setFilteredHotels] = useState([]) // Hotels sau khi filter
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)
  const [fileList, setFileList] = useState([])
  const [previewImages, setPreviewImages] = useState([]) // Danh sách ảnh để preview
  const [previewVisible, setPreviewVisible] = useState(false) // Modal preview ảnh
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [form] = Form.useForm()
  // Fetch danh sách hotels từ API - chỉ gọi 1 lần hoặc khi có CRUD
  const fetchHotels = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 1000,
      }

      const response = await getAllHotels(params)
      const hotelsData = response?.hotels || []

      // Map data để thêm key cho Table
      const hotelsWithKey = hotelsData.map(hotel => ({
        ...hotel,
        key: hotel.hotel_id
      }))

      setAllHotels(hotelsWithKey)
      setFilteredHotels(hotelsWithKey)
      setPagination(prev => ({
        ...prev,
        total: hotelsWithKey.length,
      }))
    } catch (error) {
      console.error('Error fetching hotels:', error)
      message.error(error.message || 'Không thể tải danh sách khách sạn')
    } finally {
      setLoading(false)
    }
  }

  // Chỉ fetch hotels khi component mount
  useEffect(() => {
    fetchHotels()
  }, [])

  // Filter hotels khi searchText thay đổi
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredHotels(allHotels)
      setPagination(prev => ({
        ...prev,
        total: allHotels.length,
        current: 1,
      }))
      return
    }

    const searchLower = searchText.toLowerCase()
    const filtered = allHotels.filter(hotel => {
      return (
        hotel.name?.toLowerCase().includes(searchLower) ||
        hotel.address?.toLowerCase().includes(searchLower) ||
        hotel.email?.toLowerCase().includes(searchLower) ||
        hotel.phone?.includes(searchText)
      )
    })

    setFilteredHotels(filtered)
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      current: 1,
    }))
  }, [searchText, allHotels])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'hotel_id',
      key: 'hotel_id',
      width: 70,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 120,
      render: (images, record) => {
        const imageArray = Array.isArray(images) ? images : []
        const imageCount = imageArray.length
        
        if (imageArray.length > 0) {
          return (
            <div 
              style={{ 
                position: 'relative', 
                width: 80, 
                height: 60, 
                cursor: 'pointer',
                borderRadius: 4,
                overflow: 'hidden'
              }}
              onClick={() => handleViewImages(imageArray, record.name)}
            >
              <Image
                width={80}
                height={60}
                src={imageArray[0]}
                alt="hotel"
                style={{ objectFit: 'cover', borderRadius: 4 }}
                preview={false}
              />
              {imageCount > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#fff',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    borderTopLeftRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <EyeOutlined style={{ fontSize: 10 }} />
                  <span>+{imageCount - 1}</span>
                </div>
              )}
            </div>
          )
        } else {
          return (
            <div style={{ width: 80, height: 60, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
              <HomeOutlined style={{ fontSize: 24, color: '#999' }} />
            </div>
          )
        }
      },
    },
    {
      title: 'Tên khách sạn',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số lượng ảnh',
      dataIndex: 'images',
      key: 'image_count',
      width: 120,
      render: (images) => {
        const count = Array.isArray(images) ? images.length : 0
        return <Tag color="blue">{count} ảnh</Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
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
    setEditingHotel(record)
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      description: record.description,
      phone: record.phone,
      email: record.email,
    })
    
    // Set existing images to fileList for preview
    if (record.images && Array.isArray(record.images) && record.images.length > 0) {
      const existingFiles = record.images.map((url, index) => ({
        uid: `-existing-${index}-${Date.now()}`, // Tạo uid duy nhất
        name: `image-${index + 1}.jpg`,
        status: 'done',
        url: url,
        // Không có originFileObj = đây là ảnh từ server
      }))
      setFileList(existingFiles)
    } else {
      // Nếu không có ảnh, reset về rỗng
      setFileList([])
    }
    
    setIsModalVisible(true)
  }

  const handleDelete = (record) => {
    const imageCount = Array.isArray(record.images) ? record.images.length : 0
    
    Modal.confirm({
      title: 'Xác nhận xóa khách sạn',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Bạn có chắc chắn muốn xóa khách sạn <strong>"{record.name}"</strong>?
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
            <div>• Tất cả phòng và dịch vụ liên quan sẽ bị xóa</div>
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
        message.loading({ content: 'Đang xóa khách sạn...', key: 'deleteHotel', duration: 0 })

        try {
          await deleteHotel(record.hotel_id)
          message.success({
            content: `Đã xóa khách sạn "${record.name}" thành công!${imageCount > 0 ? ` (${imageCount} ảnh đã được xóa)` : ''}`,
            key: 'deleteHotel',
            duration: 3
          })
          
          setTimeout(() => {
            fetchHotels()
          }, 500)
          
        } catch (error) {
          console.error('Error deleting hotel:', error)
          
          message.error({
            content: `Không thể xóa khách sạn "${record.name}". ${error.message || 'Vui lòng thử lại.'}`,
            key: 'deleteHotel',
            duration: 5
          })
        }
      },
    })
  }

  const handleAddNew = () => {
    setEditingHotel(null)
    form.resetFields()
    setFileList([])
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // Validate ít nhất phải có 1 ảnh (cho trường hợp tạo mới)
      if (!editingHotel && fileList.length === 0) {
        message.warning('Vui lòng tải lên ít nhất 1 ảnh cho khách sạn!')
        return
      }
      
      // Tạo FormData để upload images
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('address', values.address)
      formData.append('description', values.description || '')
      formData.append('phone', values.phone || '')
      formData.append('email', values.email || '')
      
      // Lấy các file mới (có originFileObj)
      const newFiles = fileList.filter(file => {
        return file.originFileObj && file.originFileObj instanceof File
      })
      
      // Thêm các file mới vào FormData - backend sẽ nhận nhiều file với key 'images'
      newFiles.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj)
        }
      })
      
      // Nếu đang edit, gửi danh sách ảnh cũ cần giữ lại
      if (editingHotel) {
        const existingImages = fileList
          .filter(file => {
            // Ảnh cũ là ảnh có url từ server và KHÔNG có originFileObj (chưa được thay thế)
            return file.url && !file.originFileObj
          })
          .map(file => file.url)
        
        // Nếu có ảnh cũ, gửi lên backend để giữ lại
        if (existingImages.length > 0) {
          // Backend có thể nhận dưới dạng JSON string hoặc array
          formData.append('existingImages', JSON.stringify(existingImages))
        }
      }
      
      // Log để debug (có thể xóa trong production)
      console.log('Uploading files:', {
        newFiles: newFiles.length,
        existingImages: editingHotel ? fileList.filter(f => f.url && !f.originFileObj).length : 0,
        totalInList: fileList.length
      })
      
      setLoading(true)
      
      if (editingHotel) {
        await updateHotel(editingHotel.hotel_id, formData)
        message.success(`Cập nhật khách sạn thành công${newFiles.length > 0 ? ` (${newFiles.length} ảnh mới)` : ''}`)
      } else {
        await createHotel(formData)
        message.success(`Tạo khách sạn thành công (${newFiles.length} ảnh)`)
      }
      
      setIsModalVisible(false)
      setEditingHotel(null)
      setFileList([])
      form.resetFields()
      fetchHotels() // Reload danh sách
    } catch (error) {
      if (error.errorFields) {
        return
      }
      console.error('Error saving hotel:', error)
      message.error(error.message || 'Có lỗi xảy ra khi lưu khách sạn')
    } finally {
      setLoading(false)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingHotel(null)
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

  // Handle view all images
  const handleViewImages = (images, hotelName) => {
    if (!images || images.length === 0) return
    
    setPreviewImages(images)
    setPreviewVisible(true)
  }

  // Upload handlers
  const handleUploadChange = ({ fileList: newFileList }) => {
    // Cập nhật fileList trực tiếp từ Ant Design
    // Tạo preview cho các file mới chưa có preview
    const filesToUpdate = newFileList.filter(file => 
      file.originFileObj && !file.preview && !file.url
    )
    
    // Tạo preview cho các file mới
    filesToUpdate.forEach(file => {
      getBase64(file.originFileObj).then(preview => {
        setFileList(prev => 
          prev.map(f => f.uid === file.uid ? { ...f, preview } : f)
        )
      })
    })
    
    // Cập nhật fileList ngay lập tức
    setFileList(newFileList)
  }

  const handleRemove = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid)
    setFileList(newFileList)
    return true // Return true để xác nhận xóa
  }

  const handlePreview = async (file) => {
    // Nếu file chưa có preview, tạo preview
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj)
    }
    
    // Sử dụng Image preview của Ant Design thay vì mở tab mới
    const imageUrl = file.url || file.preview
    if (imageUrl) {
      // Tạo temporary image element để preview
      const img = document.createElement('img')
      img.src = imageUrl
      img.style.display = 'none'
      document.body.appendChild(img)
      
      // Mở trong tab mới hoặc preview modal
      window.open(imageUrl, '_blank')
      document.body.removeChild(img)
    }
  }

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Validate file trước khi thêm vào list
  const validateFile = (file) => {
    // Check file type
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error(`${file.name} không phải là file ảnh!`)
      return false
    }
    
    // Check file size (< 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error(`${file.name} có kích thước lớn hơn 5MB!`)
      return false
    }
    
    return true
  }

  const uploadProps = {
    listType: 'picture-card',
    multiple: true,
    accept: 'image/*',
    fileList: fileList,
    onChange: handleUploadChange,
    onPreview: handlePreview,
    onRemove: handleRemove,
    beforeUpload: (file, fileList) => {
      // Validate file
      if (!validateFile(file)) {
        return Upload.LIST_IGNORE
      }
      
      // Check max files - đếm cả file đang upload
      // Ant Design sẽ thêm file này vào list nếu return false
      const totalFiles = fileList.length + 1 // +1 cho file đang upload
      
      if (totalFiles > 10) {
        message.warning('Chỉ được upload tối đa 10 ảnh!')
        return Upload.LIST_IGNORE
      }
      
      // Prevent auto upload - chúng ta sẽ upload khi submit form
      // Ant Design sẽ tự động thêm file vào fileList thông qua onChange
      return false
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    customRequest: ({ onSuccess }) => {
      // Custom request handler - không upload ngay, chờ submit form
      // Ant Design sẽ gọi onSuccess ngay để file hiển thị trong list
      setTimeout(() => {
        onSuccess('ok')
      }, 0)
    },
  }

  return (
    <div className="hotels-management">
      <div className="hotels-header">
        <Title level={2}>Quản lý khách sạn</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAddNew}
        >
          Thêm khách sạn
        </Button>
      </div>

      <div className="hotels-search">
        <Search
          placeholder="Tìm kiếm theo tên, địa chỉ, email hoặc số điện thoại"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredHotels}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} khách sạn`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HomeOutlined />
            <span>{editingHotel ? 'Cập nhật khách sạn' : 'Thêm khách sạn mới'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={editingHotel ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        confirmLoading={loading}
        centered
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          name="hotelForm"
        >
          <Form.Item
            name="name"
            label="Tên khách sạn"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách sạn!' }]}
          >
            <Input placeholder="Nhập tên khách sạn" size="large" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Nhập địa chỉ đầy đủ" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả về khách sạn"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" size="large" />
          </Form.Item>

          <Form.Item
            label="Hình ảnh khách sạn"
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

      {/* Modal preview tất cả ảnh */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EyeOutlined />
            <span>Xem tất cả hình ảnh</span>
          </div>
        }
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false)
          setPreviewImages([])
        }}
        footer={null}
        width={900}
        centered
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Image.PreviewGroup>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
              padding: '16px 0'
            }}>
              {previewImages.map((imageUrl, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <Image
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                    preview={{
                      mask: (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: 8,
                          color: '#fff'
                        }}>
                          <EyeOutlined />
                          <span>Xem</span>
                        </div>
                      )
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {index + 1}/{previewImages.length}
                  </div>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </Modal>
    </div>
  )
}

export default Hotels

