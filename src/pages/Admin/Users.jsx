import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Tag,
  Modal,
  Form,
  Select,
  message
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons'
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../../services/admin.service'

const { Title } = Typography
const { Search } = Input

// Format date to dd/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Format date string để binding vào input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return undefined
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString().slice(0, 10)
}

function Users() {
  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState([]) // Lưu toàn bộ users từ API
  const [filteredUsers, setFilteredUsers] = useState([]) // Users sau khi filter
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [form] = Form.useForm()

  // Fetch danh sách users từ API - chỉ gọi 1 lần hoặc khi có CRUD
  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Lấy tất cả users (có thể set limit lớn hoặc không limit)
      const params = {
        page: 1,
        limit: 1000, // Lấy nhiều records cùng lúc
      }

      const response = await getAllUsers(params)
      const usersData = response?.users || []
      // Map data để thêm key cho Table
      const usersWithKey = usersData.map(user => ({
        ...user,
        key: user.user_id
      }))

      setAllUsers(usersWithKey)
      setFilteredUsers(usersWithKey) // Ban đầu hiển thị tất cả
      setPagination(prev => ({
        ...prev,
        total: usersWithKey.length,
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      message.error(error.message || 'Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  // Chỉ fetch users khi component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users khi searchText thay đổi
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredUsers(allUsers)
      setPagination(prev => ({
        ...prev,
        total: allUsers.length,
        current: 1,
      }))
      return
    }

    const searchLower = searchText.toLowerCase()
    const filtered = allUsers.filter(user => {
      return (
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchText)
      )
    })

    setFilteredUsers(filtered)
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      current: 1, // Reset về trang 1 khi search
    }))
  }, [searchText, allUsers])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 70,
      sorter: (a, b) => a.user_id - b.user_id,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text) => (
          <span>{text}</span>
      ),
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => (
        <span>
          {text? text : 'chưa cập nhật'}
          </span>
      ),
    },
    {
      title: 'CCCD/CMND',
      dataIndex: 'cccd',
      key: 'cccd',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (verified) => (
        <Tag color={verified ? 'green' : 'orange'}>
          {verified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record)}
          >
        
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue({
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
      date_of_birth: record.date_of_birth,
      role: record.role,
      is_verified: record.is_verified,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa người dùng "${record.full_name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      style:{
        padding: 24,
      },
      onOk: async () => {
        try {
          await deleteUser(record.user_id)
          message.success('Xóa người dùng thành công')
          fetchUsers() // Reload danh sách
        } catch (error) {
          console.error('Error deleting user:', error)
          message.error(error.message || 'Không thể xóa người dùng')
        }
      },
    })
  }

  const handleAddNew = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      if (editingUser) {
        // Cập nhật user
        await updateUser(editingUser.user_id, values)
        message.success('Cập nhật thông tin người dùng thành công')
      } else {
        // Tạo user mới
        const response = await createUser(values)    
        message.success('Tạo người dùng thành công')
      } 
      setIsModalVisible(false)
      fetchUsers() // Reload danh sách
    } catch (error) {
      if (error.errorFields) {
        return
      }
      console.error('Error saving user:', error)
      message.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingUser(null)
  }

  const handleTableChange = (newPagination) => {
    // Chỉ cập nhật pagination state, không gọi API
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    })
  }

  const handleSearch = (value) => {
    setSearchText(value)
    // Không cần reset pagination ở đây vì đã xử lý trong useEffect
  }

  return (
    <div
     style={{ padding: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <Title level={2} style={{ margin: 0 }}>Quản lý người dùng</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddNew}
        >
          Thêm người dùng
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên hoặc email"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredUsers}
        // loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} người dùng`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        bordered
      />

      <Modal
        title={editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText={editingUser ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        confirmLoading={loading}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
        >
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" disabled={editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="date_of_birth"
            label="Ngày sinh"
          >
            <Input type="date" placeholder="Chọn ngày sinh" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Select.Option value="customer">Khách hàng</Select.Option>
              <Select.Option value="admin">Quản trị viên</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_verified"
            label="Trạng thái xác thực"
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={true}>Đã xác thực</Select.Option>
              <Select.Option value={false}>Chưa xác thực</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Users

