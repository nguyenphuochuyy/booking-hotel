import React, { useMemo, useState } from 'react'
import {
  Typography,
  Rate,
  Form,
  Input,
  Button,
  Upload,
  message
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CloseOutlined,
  UploadOutlined
} from '@ant-design/icons'
import './Review.css'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const REASON_OPTIONS = [
  'Phòng sạch sẽ, tiện nghi',
  'Vị trí thuận tiện',
  'Nhân viên thân thiện',
  'Ẩm thực tuyệt vời',
  'Giá trị xứng đáng với chi phí',
  'Khác'
]

const ratingTips = {
  1: 'Rất tệ',
  2: 'Chưa hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Rất hài lòng'
}

function ReviewPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState([])
  const [ratingValue, setRatingValue] = useState(5)

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true)
      // TODO: call actual API with code
      await new Promise((resolve) => setTimeout(resolve, 1200))
      message.success('Cảm ơn bạn đã chia sẻ trải nghiệm tại Bean Hotel!')
      navigate('/')
    } catch (error) {
      message.error('Không thể gửi đánh giá. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadProps = {
    fileList,
    multiple: true,
    listType: 'picture-card',
    beforeUpload: () => false,
    onChange: ({ fileList: newList }) => {
      setFileList(newList.slice(0, 5))
    }
  }

  const ratingText = useMemo(() => ratingTips[Math.round(ratingValue)] || 'Đánh giá của bạn', [ratingValue])

  return (
    <div className="review-page">
      <div className="review-modal">
        <div className="review-modal-header">
          <div>
            <Title level={3}>Viết đánh giá</Title>
            <Paragraph type="secondary">Mã booking: <Text strong>{code || '—'}</Text></Paragraph>
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={() => navigate('/')} />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ rating: 5 }}
        >
          <Form.Item
            name="rating"
            label="Đánh giá của bạn"
            rules={[{ required: true, message: 'Vui lòng đánh giá sao' }]}
          >
            <div className="rating-group">
              <Rate
                allowHalf={false}
                className="review-rate-big"
                onChange={setRatingValue}
                defaultValue={5}
              />
              <Text className="rating-text">{ratingText}</Text>
            </div>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung đánh giá"
            rules={[{ required: true, message: 'Vui lòng chia sẻ cảm nhận' }]}
          >
            <TextArea
              rows={4}
              maxLength={1000}
              showCount
              placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ và phòng ở..."
            />
          </Form.Item>

          <Form.Item label="Hình ảnh đính kèm (tối đa 5 ảnh)">
            <Upload {...uploadProps}>
              {fileList.length >= 5 ? null : (
                <div className="upload-placeholder">
                  <UploadOutlined />
                  <span>Upload</span>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <div className="review-modal-footer">
              <Button onClick={() => navigate('/')}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                Gửi đánh giá
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default ReviewPage

