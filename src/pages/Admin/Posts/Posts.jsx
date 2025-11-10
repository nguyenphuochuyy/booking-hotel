import React, { useState, useEffect, useMemo } from 'react'
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, 
  Popconfirm, Tag, Card, Row, Col, Statistic, Tooltip, 
  Typography, Badge, Divider, Empty, Spin, Upload, Image
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  FileTextOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  EyeOutlined, UploadOutlined, TagOutlined
} from '@ant-design/icons'
import { 
  getAllPosts, createPost, updatePost, deletePost,
  getAllCategories, createCategory, updateCategory, deleteCategory
} from '../../../services/admin.service'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './posts.css'
import dayjs from 'dayjs'
import TextArea from 'antd/es/input/TextArea'

const { Title, Text } = Typography
const { Option } = Select

const PostManagement = () => {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [form] = Form.useForm()
  const [content, setContent] = useState('') // State để lưu content từ ReactQuill

  // Category management states
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false)
  const [isCategoryListModalVisible, setIsCategoryListModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm] = Form.useForm()

  // Helper function to create FormData safely
  const createFormData = (values) => {
    const formData = new FormData()
    
    // Append basic fields with null checks
    const fields = ['title', 'slug', 'content', 'category_id', 'status']
    fields.forEach(field => {
      if (values[field] !== undefined && values[field] !== null) {
        formData.append(field, String(values[field]))
      }
    })
    
    // Handle tags
    if (values.tags && values.tags.trim()) {
      const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      if (tagsArray.length > 0) {
        formData.append('tags', JSON.stringify(tagsArray))
      }
    }

    // Handle cover image
    if (values.cover_image && Array.isArray(values.cover_image) && values.cover_image.length > 0) {
      const file = values.cover_image[0]
      if (file && file.originFileObj instanceof File) {
        formData.append('cover_image', file.originFileObj)
      }
    }
    
    // Handle additional images
    if (values.images && Array.isArray(values.images) && values.images.length > 0) {
      values.images.forEach((file) => {
        if (file && file.originFileObj instanceof File) {
          formData.append('images', file.originFileObj)
        }
      })
    }
    
    return formData
  }

  // Fetch posts data
  const fetchPosts = async (page = 1, pageSize = 10, categoryId = null) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pageSize
      }
      if (categoryId) {
        params.category_id = categoryId
      }
      const response = await getAllPosts(params)
      setPosts(response.posts || [])
      setPagination({
        current: page,
        pageSize,
        total: response.total || 0
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
      message.error('Không thể tải danh sách bài viết')
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories({ limit: 100 })
      setCategories(response.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      message.error('Không thể tải danh sách danh mục')
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

  // lọc bài viết theo từ khóa 
  const filteredPosts = useMemo(() => {
    if (!searchText) return posts
    
    const searchLower = searchText.toLowerCase()
    return posts.filter(post => {
      const title = post.title?.toLowerCase() || ''
      const content = post.content?.toLowerCase() || ''
      const slug = post.slug?.toLowerCase() || ''
      const categoryName = categories.find(c => c.category_id === post.category_id)?.name?.toLowerCase() || ''
      
      return title.includes(searchLower) ||
             content.includes(searchLower) ||
             slug.includes(searchLower) ||
             categoryName.includes(searchLower)
    })
  }, [posts, searchText, categories])

  // Handle create/update post
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // Đảm bảo content từ ReactQuill được thêm vào values
      values.content = content || values.content || ''
      
      // Use helper function to create FormData
      const formData = createFormData(values)

      // Debug FormData
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name}, Size: ${value.size}, Type: ${value.type}`)
        } else {
          console.log(key, value)
        }
      }

      if (editingPost) {
        await updatePost(editingPost.post_id, formData)
        message.success('Cập nhật bài viết thành công!')
      } else {
        await createPost(formData)
        message.success('Tạo bài viết mới thành công!')
      }

      setIsModalVisible(false)
      setEditingPost(null)
      setContent('') // Reset content
      form.resetFields()
      fetchPosts(pagination.current, pagination.pageSize, selectedCategory)
    } catch (error) {
      console.error('Error saving post:', error)
      console.error('Error details:', error.response?.data)
      const errMsg = error?.response?.data?.message || error?.message || (editingPost ? 'Không thể cập nhật bài viết!' : 'Không thể tạo bài viết!')
      message.error(errMsg)
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingPost(null)
    setContent('') // Reset content
    form.resetFields()
  }

  // Handle edit post
  const handleEdit = (record) => {
    setEditingPost(record)
    const recordContent = record.content || ''
    setContent(recordContent) // Set content vào state cho ReactQuill
    form.setFieldsValue({
      title: record.title,
      slug: record.slug,
      content: recordContent,
      category_id: record.category_id,
      status: record.status,
      tags: record.tags ? (Array.isArray(record.tags) ? record.tags.join(', ') : record.tags) : ''
    })
    setIsModalVisible(true)
  }

  // Handle delete post
  const handleDelete = async (postId) => {
    try {
      await deletePost(postId)
      message.success('Xóa bài viết thành công!')
      fetchPosts(pagination.current, pagination.pageSize, selectedCategory)
    } catch (error) {
      console.error('Error deleting post:', error)
      message.error('Không thể xóa bài viết!')
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    fetchPosts(paginationInfo.current, paginationInfo.pageSize, selectedCategory)
  }

  // Handle category filter change
  const handleCategoryFilterChange = (categoryId) => {
    setSelectedCategory(categoryId)
    fetchPosts(1, pagination.pageSize, categoryId)
  }

  // Category management functions
  const handleCategoryModalOk = async () => {
    try {
      const values = await categoryForm.validateFields()
      
      if (editingCategory) {
        await updateCategory(editingCategory.category_id, values)
        message.success('Cập nhật danh mục thành công!')
      } else {
        await createCategory(values)
        message.success('Tạo danh mục mới thành công!')
      }

      setIsCategoryModalVisible(false)
      setEditingCategory(null)
      categoryForm.resetFields()
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      const errMsg = error?.message || (editingCategory ? 'Không thể cập nhật danh mục!' : 'Không thể tạo danh mục!')
      message.error(errMsg)
    }
  }

  const handleCategoryModalCancel = () => {
    setIsCategoryModalVisible(false)
    setEditingCategory(null)
    categoryForm.resetFields()
  }

  const handleEditCategory = (record) => {
    setEditingCategory(record)
    categoryForm.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description
    })
    setIsCategoryModalVisible(true)
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId)
      message.success('Xóa danh mục thành công!')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      message.error('Không thể xóa danh mục!')
    }
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    categoryForm.resetFields()
    setIsCategoryModalVisible(true)
  }

  const handleCategoryManagement = () => {
    setIsCategoryListModalVisible(true)
  }

  const handleCategoryListModalCancel = () => {
    setIsCategoryListModalVisible(false)
  }

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      published: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã xuất bản' },
      draft: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Bản nháp' },
      archived: { color: 'default', icon: <CloseCircleOutlined />, text: 'Lưu trữ' }
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      draft: posts.filter(p => p.status === 'draft').length,
      archived: posts.filter(p => p.status === 'archived').length
    }
    return stats
  }, [posts])

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'post_id',
      key: 'post_id',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.post_id - b.post_id
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'cover_image_url',
      key: 'cover_image_url',
      width: 80,
      render: (imageUrl) => (
        imageUrl ? (
          <Image
            width={60}
            height={40}
            src={imageUrl}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
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
      )
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title) => (
        <Tooltip title={title}>
          <Text strong style={{ fontSize: '14px' }}>
            {title}
          </Text>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 100,
      align: 'center',
      render: (slug) => (
        <div className="slug-display">
          <Text code style={{ fontSize: '12px', color: '#1890ff' }}>
            {slug}
          </Text>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 150,
      align: 'center',
      render: (categoryId) => {
        const category = categories.find(c => c.category_id === categoryId)
        return category ? (
          <Tag color="blue" icon={<TagOutlined />}>
            {category.name}
          </Tag>
        ) : (
          <Text type="secondary">N/A</Text>
        )
      },
      filters: categories.map(c => ({ text: c.name, value: c.category_id })),
      onFilter: (value, record) => record.category_id === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đã xuất bản', value: 'published' },
        { text: 'Bản nháp', value: 'draft' },
        { text: 'Lưu trữ', value: 'archived' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      width: 120,
      align: 'center',
      render: (author) => author?.full_name || 'N/A'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      align: 'center',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem bài viết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/news/${record.slug}`, '_blank')}
              className="action-button view-button"
            />
          </Tooltip>
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
              description="Bạn có chắc chắn muốn xóa bài viết này?"
              onConfirm={() => handleDelete(record.post_id)}
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
    <div className="post-management">
      {/* Header */}
      <div className="post-header">
        <h2 className="page-title">
          <FileTextOutlined /> Quản lý bài viết
        </h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchPosts(pagination.current, pagination.pageSize, selectedCategory)}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            icon={<TagOutlined />}
            onClick={handleCategoryManagement}
            className="category-button"
          >
            Quản lý danh mục
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setContent('') // Reset content khi tạo mới
              setIsModalVisible(true)
            }}
            className="create-button"
          >
            Thêm bài viết mới
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng bài viết"
              value={statistics.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã xuất bản"
              value={statistics.published}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Bản nháp"
              value={statistics.draft}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Lưu trữ"
              value={statistics.archived}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="post-search">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12} lg={10}>
            <Input
              placeholder="Tìm kiếm theo tiêu đề, nội dung, slug..."
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
              placeholder="Lọc theo danh mục"
              style={{ width: '100%' }}
              onChange={handleCategoryFilterChange}
              allowClear
              value={selectedCategory}
              size="large"
            >
              {categories.map(category => (
                <Option key={category.category_id} value={category.category_id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredPosts}
        rowKey="post_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bài viết`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 1400 }}
        locale={{
          emptyText: (
            <Empty
              description="Không có dữ liệu bài viết"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingPost ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={900}
        okText={editingPost ? 'Cập nhật' : 'Tạo mới'}
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
                name="title"
                label="Tiêu đề bài viết"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input placeholder="Nhập tiêu đề bài viết" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="slug"
                label="Slug"
                rules={[
                  { required: true, message: 'Vui lòng nhập slug!' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang!' }
                ]}
              >
                <Input placeholder="slug-bai-viet" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="category_id"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {categories.map(category => (
                    <Option key={category.category_id} value={category.category_id}>
                      {category.name}
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
                initialValue="draft"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="draft">
                    <ClockCircleOutlined style={{ color: '#faad14' }} /> Bản nháp
                  </Option>
                  <Option value="published">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Đã xuất bản
                  </Option>
                  <Option value="archived">
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Lưu trữ
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label="Nội dung bài viết"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung!' },
              {
                validator: (_, value) => {
                  // Validate content từ ReactQuill (có thể là HTML rỗng)
                  const textContent = content?.replace(/<[^>]*>/g, '').trim()
                  if (!textContent || textContent.length === 0) {
                    return Promise.reject(new Error('Vui lòng nhập nội dung!'))
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={(value) => {
                setContent(value)
                form.setFieldsValue({ content: value })
              }}
              placeholder="Nhập nội dung bài viết..."
              style={{ 
                height: '300px',
                marginBottom: '42px'
              }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  [{ 'font': [] }],
                  [{ 'size': [] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                  [{ 'script': 'sub'}, { 'script': 'super' }],
                  [{ 'direction': 'rtl' }],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'align': [] }],
                  ['link', 'image', 'video'],
                  ['clean']
                ]
              }}
            />
          </Form.Item>

    

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="cover_image"
                  label="Ảnh đại diện"
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
                    maxCount={1}
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
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="images"
                  label="Ảnh bổ sung"
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
              </Col>
            </Row>

          <Divider />

          <div className="form-note">
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              Lưu ý: Slug phải là duy nhất và không được trùng lặp
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        title={
          <Space>
            <TagOutlined />
            <span>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</span>
          </Space>
        }
        open={isCategoryModalVisible}
        onOk={handleCategoryModalOk}
        onCancel={handleCategoryModalCancel}
        width={600}
        okText={editingCategory ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
        centered
      >
        <Form
          form={categoryForm}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: 'Vui lòng nhập slug!' },
              { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang!' }
            ]}
          >
            <Input placeholder="slug-danh-muc" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả danh mục..."
            />
          </Form.Item>

          <Divider />

          <div className="form-note">
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary">
              Lưu ý: Slug phải là duy nhất và không được trùng lặp
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Category List Modal */}
      <Modal
        title={
          <Space>
            <TagOutlined />
            <span>Danh sách danh mục</span>
          </Space>
        }
        open={isCategoryListModalVisible}
        onCancel={handleCategoryListModalCancel}
        width={800}
        footer={[
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleCreateCategory}>
            Thêm danh mục mới
          </Button>,
          <Button key="close" onClick={handleCategoryListModalCancel}>
            Đóng
          </Button>
        ]}
        destroyOnClose
        centered
      >
        <Table
          columns={[
            {
              title: 'ID',
              dataIndex: 'category_id',
              key: 'category_id',
              width: 60,
              align: 'center'
            },
            {
              title: 'Tên danh mục',
              dataIndex: 'name',
              key: 'name',
              render: (name) => (
                <Text strong style={{ fontSize: '14px' }}>
                  {name}
                </Text>
              )
            },
            {
              title: 'Slug',
              dataIndex: 'slug',
              key: 'slug',
              render: (slug) => (
                <Text code style={{ fontSize: '12px', color: '#1890ff' }}>
                  {slug}
                </Text>
              )
            },
            {
              title: 'Mô tả',
              dataIndex: 'description',
              key: 'description',
              ellipsis: true,
              render: (description) => description || <Text type="secondary">Không có mô tả</Text>
            },
            {
              title: 'Hành động',
              key: 'actions',
              width: 120,
              align: 'center',
              render: (_, record) => (
                <Space>
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditCategory(record)}
                      className="action-button edit-button"
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Popconfirm
                      title="Xác nhận xóa"
                      description="Bạn có chắc chắn muốn xóa danh mục này?"
                      onConfirm={() => handleDeleteCategory(record.category_id)}
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
          ]}
          dataSource={categories}
          rowKey="category_id"
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <Empty
                description="Không có danh mục nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Modal>
    </div>
  )
}

export default PostManagement