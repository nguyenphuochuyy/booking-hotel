import React, { useState } from 'react'
import { Row, Col, Form, Input, Button, Typography, Space, Card, message } from 'antd'
import { 
  HomeOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ClockCircleOutlined,
  SendOutlined 
} from '@ant-design/icons'
import './Contact.css'
import emailjs from '@emailjs/browser' // Import thư viện gửi mail
const { Title, Paragraph } = Typography
const { TextArea } = Input
function Contact() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const onFinish = (values) => {
    setLoading(true) // Bật loading

    // Cấu hình thông tin gửi đi
    const templateParams = {
      from_name: values.fullName,
      from_email: values.email,
      message: values.message,
      to_email: 'beanhotelvn@gmail.com' // Email nhận (Cấu hình thêm trong EmailJS Dashboard)
    }

    // Gửi email qua EmailJS
    // Thay thế 3 tham số dưới đây bằng thông tin tài khoản EmailJS của bạn
    emailjs.send(
    'service_cilrf0q' ,
     'template_6jl026y' ,
      templateParams,
      'Wnt8fcNNJcgDy13MZ'
    )
    .then((response) => {
      console.log('SUCCESS!', response.status, response.text)
      message.success('Gửi tin nhắn thành công! Chúng tôi sẽ sớm liên hệ lại.')
      form.resetFields() // Xóa trắng form sau khi gửi
    })
    .catch((err) => {
      console.log('FAILED...', err)
      message.error('Gửi tin nhắn thất bại. Vui lòng thử lại sau.')
    })
    .finally(() => {
      setLoading(false) // Tắt loading dù thành công hay thất bại
    })
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
          <Title className="page-title">LIÊN HỆ VỚI CHÚNG TÔI</Title>
          <Paragraph className="page-description">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin, Bean Hotel sẽ liên hệ lại trong thời gian sớm nhất.
          </Paragraph>
        </div>

        {/* Contact Wrapper */}
        <div className="contact-wrapper">
          <Row gutter={0} className="contact-row">
            {/* Form Column (Left) */}
            <Col xs={24} lg={12} className="form-column">
              <div className="form-container">
                <div className="form-header-group">
                  <Title className="form-title">Gửi tin nhắn</Title>
                  <div className="title-underline"></div>
                </div>
                <Paragraph className="form-description">
                  Điền thông tin của bạn vào form dưới đây:
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
                    <Input placeholder="Nhập họ và tên của bạn" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="example@beanhotel.com" size="large" />
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
                      rows={5} 
                      placeholder="Bạn cần chúng tôi hỗ trợ gì?"
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
                {/* Decorative Elements */}
                <div className="gold-accent top"></div>
                <div className="gold-accent bottom"></div>
                
                <div className="info-content-wrapper">
                  <Title className="info-title">Thông tin liên hệ</Title>
                  
                  <div className="info-list">
                    <div className="info-item">
                      <div className="icon-box">
                        <HomeOutlined className="info-icon" />
                      </div>
                      <div className="text-box">
                        <strong>Địa chỉ:</strong>
                        <Paragraph className="info-text">
                          12 Nguyễn Văn Bảo, Phường 4, <br/>Quận Gò Vấp, TP. Hồ Chí Minh
                        </Paragraph>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="icon-box">
                        <PhoneOutlined className="info-icon" />
                      </div>
                      <div className="text-box">
                        <strong>Hotline:</strong>
                        <Paragraph className="info-text">
                          (+84) 28 1234 5678 <br/> (+84) 901 234 567
                        </Paragraph>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="icon-box">
                        <MailOutlined className="info-icon" />
                      </div>
                      <div className="text-box">
                        <strong>Email:</strong>
                        <Paragraph className="info-text">
                          contact@beanhotel.com
                        </Paragraph>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="icon-box">
                        <ClockCircleOutlined className="info-icon" />
                      </div>
                      <div className="text-box">
                        <strong>Giờ mở cửa:</strong>
                        <Paragraph className="info-text">
                          Thứ 2 - Chủ nhật: 24/7<br />
                          Lễ tân luôn sẵn sàng phục vụ
                        </Paragraph>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Google Map Section */}
        <div className="map-section">
          <Card className="map-card" bordered={false}>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8582378452174!2d106.68427047480556!3d10.822158889329432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e549695d13%3A0x333d01f195e3478d!2zMTIgTmd1eOG7hW4gVsSDbiBC4bqjbywgUGjGsOG7nW5nIDQsIEjhuqFuaCBUaMO0bmcsIEfDsiBW4bqlcCwgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="450"
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