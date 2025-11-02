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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [form] = Form.useForm()
  const [previewImages, setPreviewImages] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
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
      
      // Map data để thêm key và chuẩn hóa images
      const roomTypesWithKey = roomTypesData.map(roomType => {
        const id = roomType.room_type_id
        const apiImages = normalizeImages(roomType.images)
        return {
          ...roomType,
          images: apiImages, // Mảng JSON các URL ảnh từ backend
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
          <div 
            style={{ 
              position: 'relative', 
              width: 80, 
              height: 60, 
              cursor: 'pointer',
              borderRadius: 4,
              overflow: 'hidden'
            }}
            onClick={() => handleViewImages(imageArray, record.room_type_name)}
          >
            <Image
              width={80}
              height={60}
              src={imageArray[0]}
              alt="room type"
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
        uid: `-existing-${index}-${Date.now()}`, // Tạo uid duy nhất
        name: `image-${index + 1}.jpg`,
        status: 'done',
        url: url,
        // Không có originFileObj = đây là ảnh từ server
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

  // Helper function: Download ảnh từ URL về File object
  const urlToFile = async (url, filename) => {
    try {
      // Thử fetch với mode 'cors' trước
      let response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      })

      // Nếu lỗi CORS, thử với mode 'no-cors' (nhưng không thể đọc response)
      // Nên bỏ qua và throw error
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      
      // Kiểm tra blob có dữ liệu không
      if (blob.size === 0) {
        throw new Error('Ảnh tải về rỗng')
      }

      // Xác định MIME type từ blob hoặc dựa vào extension
      let mimeType = blob.type || 'image/jpeg'
      if (!mimeType.startsWith('image/')) {
        // Thử đoán từ filename
        const ext = filename.toLowerCase().split('.').pop()
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
        }
        mimeType = mimeTypes[ext] || 'image/jpeg'
      }

      const file = new File([blob], filename, { type: mimeType })
      return file
    } catch (error) {
      console.error(`Error downloading image ${url}:`, error)
      // Throw error với message rõ ràng hơn
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        throw new Error('CORS: Không thể tải ảnh từ domain này')
      }
      throw error
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // Validate ít nhất phải có 1 ảnh (cho trường hợp tạo mới)
      if (!editingRoomType && fileList.length === 0) {
        message.warning('Vui lòng tải lên ít nhất 1 ảnh cho loại phòng!')
        return
      }

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

      setLoading(true)

      // Xử lý ảnh: Gộp ảnh cũ và ảnh mới
      let allFilesToUpload = []

      if (editingRoomType) {
        // Khi edit: Lấy ảnh cũ (có url nhưng không có originFileObj) và ảnh mới
        // Chỉ lấy những ảnh còn lại trong fileList (chưa bị xóa)
        const existingImages = fileList.filter(file => file.url && !file.originFileObj)
        const newFiles = fileList.filter(file => file.originFileObj && file.originFileObj instanceof File)

        // Download ảnh cũ về File objects (chỉ những ảnh còn lại trong fileList)
        if (existingImages.length > 0) {
          message.loading({ 
            content: `Đang tải ${existingImages.length} ảnh cũ...`, 
            key: 'downloadingImages', 
            duration: 0 
          })

          const existingFiles = await Promise.all(
            existingImages.map(async (file, index) => {
              try {
                const fileName = file.name || `existing-image-${index + 1}.jpg`
                return await urlToFile(file.url, fileName)
              } catch (error) {
                console.error(`Error downloading image ${file.url}:`, error)
                // Trả về null nếu không tải được
                return null
              }
            })
          )

          // Lọc bỏ các file null (lỗi khi download)
          const validExistingFileObjects = existingFiles.filter(file => file !== null)
          
          message.destroy('downloadingImages')

          // Gộp ảnh cũ và ảnh mới
          allFilesToUpload = [...validExistingFileObjects, ...newFiles.map(f => f.originFileObj)]
          
          // Chỉ cảnh báo nếu có ảnh cũ bị lỗi và vẫn còn ảnh mới hoặc ảnh cũ khác
          if (validExistingFileObjects.length < existingImages.length && allFilesToUpload.length > 0) {
            const failedCount = existingImages.length - validExistingFileObjects.length
            message.warning({
              content: `${failedCount} ảnh cũ không thể tải (có thể do CORS). ${allFilesToUpload.length} ảnh sẽ được lưu.`,
              duration: 4
            })
          }
        } else {
          // Không có ảnh cũ trong fileList (đã bị xóa hết hoặc không có từ đầu)
          // Chỉ upload ảnh mới
          allFilesToUpload = newFiles.map(f => f.originFileObj)
          
          // Validate: nếu không có ảnh nào (cả cũ và mới) thì báo lỗi
          if (allFilesToUpload.length === 0) {
            message.warning('Vui lòng giữ lại ít nhất 1 ảnh hoặc thêm ảnh mới!')
            setLoading(false)
            return
          }
        }
      } else {
        // Khi tạo mới: Chỉ có ảnh mới
        const newFiles = fileList.filter(file => file.originFileObj && file.originFileObj instanceof File)
        allFilesToUpload = newFiles.map(f => f.originFileObj)
      }

      // Validate cuối cùng: phải có ít nhất 1 ảnh để upload
      if (allFilesToUpload.length === 0) {
        message.warning('Vui lòng tải lên ít nhất 1 ảnh!')
        setLoading(false)
        return
      }

      // Thêm tất cả ảnh vào FormData
      allFilesToUpload.forEach((file) => {
        if (file instanceof File) {
          formData.append('images', file)
        }
      })

      // Log để debug
      console.log('Uploading room type:', {
        totalFiles: allFilesToUpload.length,
        existingImages: editingRoomType ? fileList.filter(f => f.url && !f.originFileObj).length : 0,
        newImages: fileList.filter(f => f.originFileObj).length,
        editing: !!editingRoomType
      })

      if (editingRoomType) {
        await updateRoomType(editingRoomType.room_type_id, formData)
        const newImagesCount = fileList.filter(f => f.originFileObj).length
        const existingImagesCount = fileList.filter(f => f.url && !f.originFileObj).length
        const totalImages = allFilesToUpload.length
        
        let successMsg = `Cập nhật loại phòng thành công! (${totalImages} ảnh`
        if (existingImagesCount > 0 && newImagesCount > 0) {
          successMsg += `: ${existingImagesCount} ảnh cũ, ${newImagesCount} ảnh mới`
        } else if (existingImagesCount > 0) {
          successMsg += `: ${existingImagesCount} ảnh cũ`
        } else if (newImagesCount > 0) {
          successMsg += `: ${newImagesCount} ảnh mới`
        }
        successMsg += ')'
        
        message.success(successMsg)
      } else {
        await createRoomType(formData)
        message.success(`Tạo loại phòng thành công (${allFilesToUpload.length} ảnh)`)
      }

      setIsModalVisible(false)
      setEditingRoomType(null)
      setFileList([])
      form.resetFields()
      fetchRoomTypes() // Reload danh sách
    } catch (error) {
      if (error.errorFields) {
        return
      }
      console.error('Error saving room type:', error)
      message.error(error.message || 'Có lỗi xảy ra khi lưu loại phòng')
      message.destroy('downloadingImages')
    } finally {
      setLoading(false)
      message.destroy('downloadingImages')
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

  // Handle view all images
  const handleViewImages = (images, roomTypeName) => {
    if (!images || images.length === 0) return
    
    setPreviewImages(images)
    setPreviewVisible(true)
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
    
    const imageUrl = file.url || file.preview
    if (imageUrl) {
      window.open(imageUrl, '_blank')
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
      const totalFiles = fileList.length + 1
      
      if (totalFiles > 10) {
        message.warning('Chỉ được upload tối đa 10 ảnh!')
        return Upload.LIST_IGNORE
      }
      
      // Prevent auto upload - chúng ta sẽ upload khi submit form
      return false
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    customRequest: ({ onSuccess }) => {
      // Custom request handler - không upload ngay, chờ submit form
      setTimeout(() => {
        onSuccess('ok')
      }, 0)
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

