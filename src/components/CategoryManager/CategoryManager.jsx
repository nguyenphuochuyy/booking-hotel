import React, { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Table,
  Space,
  Popconfirm,
  Typography,
  Card,
  Row,
  Col,
  Empty,
  Spin
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { categoryService } from '../../services'

const { Title, Text } = Typography

function CategoryManager({ visible, onClose, categories, onRefresh }) {
  const [form] = Form.useForm()
  const [editingCategory, setEditingCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  // Handle create category
  const handleCreate = () => {
    setEditingCategory(null)
    form.resetFields()
  }

  // Handle edit category
  const handleEdit = (record) => {
    setEditingCategory(record)
    form.setFieldsValue({
      name: record.name,
      slug: record.slug
    })
  }

  // Handle delete category
  const handleDelete = async (id) => {
    try {
      setTableLoading(true)
      await categoryService.deleteCategory(id)
      message.success('Xóa danh mục thành công')
      onRefresh()
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa danh mục')
      console.error('Error deleting category:', error)
    } finally {
      setTableLoading(false)
    }
  }

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.category_id, values)
        message.success('Cập nhật danh mục thành công')
      } else {
        await categoryService.createCategory(values)
        message.success('Tạo danh mục thành công')
      }

      form.resetFields()
      setEditingCategory(null)
      onRefresh()
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu danh mục')
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  // Table columns
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.category_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Modal
      title="Quản lý danh mục"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        {/* Form Section */}
        <Col span={12}>
          <Card title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên danh mục' },
                  { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' }
                ]}
              >
                <Input 
                  placeholder="Nhập tên danh mục"
                  onChange={(e) => {
                    // Auto-generate slug from name when creating new category
                    if (!editingCategory) {
                      const name = e.target.value
                      if (name) {
                        const slug = name
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                          .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                          .replace(/\s+/g, '-') // Replace spaces with hyphens
                          .replace(/-+/g, '-') // Replace multiple hyphens with single
                          .trim()
                        form.setFieldsValue({ slug })
                      }
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Slug"
                rules={[
                  { required: true, message: 'Vui lòng nhập slug' },
                  { 
                    pattern: /^[a-z0-9-]+$/,
                    message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'
                  },
                  { min: 2, message: 'Slug phải có ít nhất 2 ký tự' }
                ]}
              >
                <Input placeholder="slug-danh-muc" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<PlusOutlined />}
                  >
                    {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                  </Button>
                  {editingCategory && (
                    <Button onClick={handleCreate}>
                      Hủy chỉnh sửa
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* List Section */}
        <Col span={12}>
          <Card title="Danh sách danh mục">
            {categories.length === 0 ? (
              <Empty 
                description="Chưa có danh mục nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={categories}
                rowKey="category_id"
                pagination={false}
                size="small"
                loading={tableLoading}
                scroll={{ y: 300 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Modal>
  )
}

export default CategoryManager
