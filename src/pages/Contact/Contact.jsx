import React from 'react'
import { Row, Col, Form, Input, Button, Typography, Space, Card, message } from 'antd'
import { 
  HomeOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ClockCircleOutlined,
  SendOutlined 
} from '@ant-design/icons'
import './Contact.css'

const { Title, Paragraph } = Typography
const { TextArea } = Input

function Contact() {
  const [form] = Form.useForm()

  const onFinish = (values) => {
    console.log('Form values:', values)
    message.success('Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.')
    form.resetFields()
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
    message.error('Vui lòng điền đầy đủ thông tin!')
  }

  return (
    <div className="contact-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <Title className="page-title">Liên hệ với chúng tôi</Title>
          <Paragraph className="page-description">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin, chúng tôi sẽ liên hệ lại sớm nhất.
          </Paragraph>
        </div>

        {/* Contact Form & Info Wrapper */}
        <div className="contact-wrapper">
          <Row gutter={0} className="contact-row" style={{ maxWidth: 950, margin: '0 auto' }}>
            {/* Form Column (Left) */}
            <Col xs={24} lg={12} className="form-column">
              <div className="form-container">
                <Title className="form-title">Gửi tin nhắn</Title>
                <Paragraph className="form-description">
                  Điền thông tin của bạn vào form dưới đây và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </Paragraph>
                
                <Form
                  form={form}
                  name="contact"
                  layout="vertical"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  className="contact-form"
                >
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ tên!' },
                      { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                    ]}
                  >
                    <Input placeholder="Nguyễn Văn A" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="example@email.com" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Nội dung"
                    name="message"
                    rules={[
                      { required: true, message: 'Vui lòng nhập nội dung!' },
                      { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự!' }
                    ]}
                  >
                    <TextArea 
                      rows={6} 
                      placeholder="Nhập nội dung bạn muốn gửi..."
                      maxLength={1000}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SendOutlined />}
                      block
                      className="submit-btn"
                    >
                      GỬI LIÊN HỆ
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Col>

            {/* Info Column (Right) */}
            <Col xs={24} lg={12} className="info-column">
              <div className="info-container">
                <div className="gold-accent top"></div>
                <div className="gold-accent bottom"></div>
                
                <div className="info-content-wrapper">
                  <Title className="info-title">Thông tin liên hệ</Title>
                  
                  <Space direction="vertical" size={32}>
                    <div className="info-item">
                      <HomeOutlined className="info-icon" />
                      <Paragraph className="info-text">
                        <strong>Địa chỉ:</strong><br />
                        12 Nguyễn Văn Bảo phường Hạnh Thông,<br />
                        Thành phố Hồ Chí Minh, Việt Nam
                      </Paragraph>
                    </div>

                    <div className="info-item">
                      <PhoneOutlined className="info-icon" />
                      <Paragraph className="info-text">
                        <strong>Số điện thoại:</strong><br />
                        Hotline: (+84) 28 1234 5678<br />
                        Mobile: (+84) 901 234 567
                      </Paragraph>
                    </div>

                    <div className="info-item">
                      <MailOutlined className="info-icon" />
                      <Paragraph className="info-text">
                        <strong>Email:</strong><br />
                        beanhotelvn@gmail.com<br />
                      </Paragraph>
                    </div>

                    <div className="info-item">
                      <ClockCircleOutlined className="info-icon" />
                      <Paragraph className="info-text">
                        <strong>Giờ mở cửa:</strong><br />
                        Thứ 2 - Chủ nhật: 24/7<br />
                        Lễ tân luôn sẵn sàng phục vụ
                      </Paragraph>
                    </div>
                  </Space>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Google Map Section */}
        <div className="map-section">
          <Card 
            title="Vị trí của chúng tôi" 
            className="map-card"
          >
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8582379826526!2d106.6842704748576!3d10.82215888932942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s!4v1759586604110!5m2!1svi!2s"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bean Hotel Location"
              ></iframe>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Contact

