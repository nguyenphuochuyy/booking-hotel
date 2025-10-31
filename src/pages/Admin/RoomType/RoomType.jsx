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
  Select,
  Empty
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
import { getAmenitiesFromLocal, addAmenity, removeAmenity } from '../../../constants/amenities'

const { Title, Text } = Typography
const { Search } = Input
const { TextArea } = Input

// Lấy danh sách tiện nghi
let AMENITIES_OPTIONS = getAmenitiesFromLocal()

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
  const [knownImagesById, setKnownImagesById] = useState({}) // cache ảnh theo room_type_id ở FE
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [form] = Form.useForm()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [isAmenityModalVisible, setIsAmenityModalVisible] = useState(false)
  const [isManageAmenitiesModalVisible, setIsManageAmenitiesModalVisible] = useState(false)
  const [newAmenity, setNewAmenity] = useState('')
  const [amenitiesList, setAmenitiesList] = useState(() => getAmenitiesFromLocal())

  // Chuẩn hóa danh sách ảnh từ API về dạng mảng URL
  const normalizeImages = (images) => {
    if (Array.isArray(images)) return images.filter(Boolean)
    if (!images) return []
    // Nếu là JSON string của array
    if (typeof images === 'string') {
      const trimmed = images.trim()
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch (_) {
        // Không phải JSON, thử split theo dấu phẩy/chấm phẩy/xuống dòng
        const parts = trimmed
          .split(/[;,\n]/)
          .map(s => s.trim())
          .filter(Boolean)
        if (parts.length) return parts
      }
    }
    // Nếu là object kiểu map {0: url, 1: url}
    if (typeof images === 'object') {
      try {
        return Object.values(images).map(String).filter(Boolean)
      } catch (_) { return [] }
    }
    return []
  }

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
      console.log(roomTypesData);
      
      const roomTypesWithKey = roomTypesData.map(roomType => {
        const id = roomType.room_type_id
        const apiImages = normalizeImages(roomType.images)
        const cachedImages = Array.isArray(knownImagesById[id]) ? knownImagesById[id] : []
        // Hợp nhất ảnh từ API và cache FE, loại trùng lặp
        const merged = Array.from(new Set([...(apiImages || []), ...(cachedImages || [])])).filter(Boolean)
        return {
          ...roomType,
          images: merged,
          key: id,
        }
      })
     
      setAllRoomTypes(roomTypesWithKey)
      setFilteredRoomTypes(roomTypesWithKey)
      setPagination(prev => ({
        ...prev,
        total: roomTypesWithKey.length,
      }))

      // Extract amenities từ database và merge với localStorage
      const allAmenitiesFromDB = new Set()
      roomTypesData.forEach(roomType => {
        if (roomType.amenities && Array.isArray(roomType.amenities)) {
          roomType.amenities.forEach(amenity => {
            if (amenity) allAmenitiesFromDB.add(amenity)
          })
        }
      })

      // Merge với amenities từ localStorage
      const localAmenities = getAmenitiesFromLocal()
      const combinedAmenities = Array.from(new Set([...localAmenities, ...allAmenitiesFromDB]))
      
      // Update amenities list
      setAmenitiesList(combinedAmenities)

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
        const imageArray = normalizeImages(images)
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
      width: 200,
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
    const recordImages = normalizeImages(record.images)
    if (recordImages.length > 0) {
      const existingFiles = recordImages.map((url, index) => ({
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
    const imageCount = normalizeImages(record.images).length

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
        const updatingId = editingRoomType.room_type_id
        await updateRoomType(updatingId, formData)
        message.success('Cập nhật loại phòng thành công')

        // Cập nhật ngay danh sách ảnh hiển thị ở FE: giữ ảnh cũ + thêm ảnh mới (object URLs)
        const existingImages = fileList
          .filter(file => !file.originFileObj && file.url)
          .map(file => file.url)
        const newFiles = fileList.filter(file => file.originFileObj)
        const newPreviewUrls = newFiles.map(f => URL.createObjectURL(f.originFileObj))
        const mergedImages = Array.from(new Set([...(existingImages || []), ...newPreviewUrls])).filter(Boolean)

        // Lưu cache cho id hiện tại
        setKnownImagesById(prev => ({ ...prev, [updatingId]: mergedImages }))

        // Cập nhật ngay vào bảng để thấy đủ ảnh
        setAllRoomTypes(prev => prev.map(rt => rt.room_type_id === updatingId ? { ...rt, images: mergedImages } : rt))
        setFilteredRoomTypes(prev => prev.map(rt => rt.room_type_id === updatingId ? { ...rt, images: mergedImages } : rt))
      } else {
        await createRoomType(formData)
        message.success('Tạo loại phòng thành công')
      }

      setIsModalVisible(false)
      setEditingRoomType(null)
      setFileList([])
      form.resetFields()
      // Refetch để đồng bộ với ảnh từ server; FE vẫn giữ cache để không mất các ảnh vừa thêm
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

  const handleAddAmenity = () => {
    setIsAmenityModalVisible(true)
  }

  const handleAmenityModalOk = () => {
    if (!newAmenity.trim()) {
      message.warning('Vui lòng nhập tên tiện nghi!')
      return
    }

    const amenityName = newAmenity.trim()
    
    // Kiểm tra trùng lặp
    if (amenitiesList.includes(amenityName)) {
      message.warning('Tiện nghi này đã tồn tại!')
      return
    }

    const updated = addAmenity(amenityName)
    setAmenitiesList(updated)
    setIsAmenityModalVisible(false)
    setNewAmenity('')
    message.success(`Đã thêm tiện nghi "${amenityName}"`)
  }

  const handleAmenityModalCancel = () => {
    setIsAmenityModalVisible(false)
    setNewAmenity('')
  }

  const handleDeleteAmenity = (amenity) => {
    Modal.confirm({
      title: 'Xác nhận xóa tiện nghi',
      content: `Bạn có chắc chắn muốn xóa tiện nghi "${amenity}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        const updated = removeAmenity(amenity)
        setAmenitiesList(updated)
        message.success(`Đã xóa tiện nghi "${amenity}"`)
      }
    })
  }

  const handleManageAmenities = () => {
    setIsManageAmenitiesModalVisible(true)
  }

  const handleSaveAmenitiesToDB = async () => {
    try {
      // Reload data để lấy amenities mới nhất từ database
      await fetchRoomTypes()
      message.success('Đã cập nhật danh sách tiện nghi!')
      setIsManageAmenitiesModalVisible(false)
    } catch (error) {
      console.error('Error saving amenities:', error)
      message.error('Không thể lưu tiện nghi!')
    }
  }

  const handleDeleteAmenityFromManage = (amenity) => {
    Modal.confirm({
      title: 'Xác nhận xóa tiện nghi',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa tiện nghi "<strong>{amenity}</strong>"?</p>
          <div style={{ 
            marginTop: 12, 
            padding: 12, 
            background: '#fff1f0',
            borderRadius: 4,
            border: '1px solid #ffccc7'
          }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Lưu ý: Tiện nghi này sẽ bị xóa khỏi localStorage. 
              Các phòng đã tạo sử dụng tiện nghi này sẽ không bị ảnh hưởng.
            </Text>
          </div>
        </div>
      ),
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        const updated = removeAmenity(amenity)
        setAmenitiesList(updated)
        message.success(`Đã xóa tiện nghi "${amenity}"`)
      }
    })
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
        <Space>
          <Button
            type="default"
            icon={<AppstoreOutlined />}
            size="large"
            onClick={handleManageAmenities}
          >
            Quản lý tiện nghi
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAddNew}
          >
            Thêm loại phòng
          </Button>
        </Space>
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
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tiện nghi</span>
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />} 
                  size="small"
                  onClick={handleAddAmenity}
                >
                  Thêm tiện nghi
                </Button>
              </div>
            }
            extra="Chọn các tiện nghi có sẵn trong phòng"
          >
            <Select
              mode="tags"
              size="large"
              placeholder="Chọn hoặc nhập tiện nghi"
              options={amenitiesList.map(item => ({ label: item, value: item }))}
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

      {/* Add Amenity Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusOutlined />
            <span>Thêm tiện nghi mới</span>
          </div>
        }
        open={isAmenityModalVisible}
        onOk={handleAmenityModalOk}
        onCancel={handleAmenityModalCancel}
        okText="Thêm"
        cancelText="Hủy"
        centered
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item
            label="Tên tiện nghi"
            rules={[{ required: true, message: 'Vui lòng nhập tên tiện nghi!' }]}
          >
            <Input
              placeholder="VD: Máy giặt, Điện thoại bàn, Két sắt điện tử..."
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onPressEnter={handleAmenityModalOk}
              size="large"
            />
          </Form.Item>
        </Form>
        
        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Danh sách tiện nghi hiện có:</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {amenitiesList.map((amenity, index) => (
              <Tag 
                key={index} 
                color="blue" 
                closable 
                onClose={() => handleDeleteAmenity(amenity)}
                style={{ marginBottom: 4 }}
              >
                {amenity}
              </Tag>
            ))}
          </div>
        </div>
      </Modal>

      {/* Manage Amenities Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppstoreOutlined />
            <span>Quản lý tiện nghi</span>
          </div>
        }
        open={isManageAmenitiesModalVisible}
        onOk={handleSaveAmenitiesToDB}
        onCancel={() => setIsManageAmenitiesModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={700}
        centered
        destroyOnClose
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong style={{ fontSize: 16 }}>Danh sách tiện nghi ({amenitiesList.length})</Text>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddAmenity}
              size="small"
            >
              Thêm mới
            </Button>
          </div>
          
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            padding: 16
          }}>
            {amenitiesList.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {amenitiesList.map((amenity, index) => (
                  <Tag 
                    key={index} 
                    color="blue" 
                    closable 
                    onClose={() => handleDeleteAmenityFromManage(amenity)}
                    style={{ marginBottom: 4, fontSize: 14, padding: '4px 12px' }}
                  >
                    {amenity}
                  </Tag>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có tiện nghi nào" />
            )}
          </div>
        </div>

        <div style={{ 
          padding: 16, 
          background: '#e6f7ff', 
          borderRadius: 6,
          border: '1px solid #91d5ff'
        }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            <ExclamationCircleOutlined style={{ color: '#1890ff', marginRight: 4 }} />
            Lưu ý:
          </Text>
          <div style={{ fontSize: 14, color: '#595959' }}>
            <div>• Danh sách tiện nghi được lấy từ tất cả loại phòng trong database</div>
            <div>• Thêm mới sẽ lưu vào localStorage để sử dụng cho các phòng mới</div>
            <div>• Xóa tiện nghi sẽ xóa khỏi localStorage, không ảnh hưởng đến phòng đã tạo</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RoomTypes

