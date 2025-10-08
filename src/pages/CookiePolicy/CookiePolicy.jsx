import React from 'react'
import { Typography, Row, Col, Divider, Card, Space, Grid, Breadcrumb } from 'antd'
import { 
  InfoCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  HistoryOutlined,
  PhoneOutlined,
  LockOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './CookiePolicy.css'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

const CookiePolicy = () => {
  const screens = useBreakpoint()
  const navigate = useNavigate()

  const sections = [
    {
      icon: <InfoCircleOutlined />,
      title: '1. Cookie là gì?'.trim(),
      content: (
        <>
          <Paragraph>
            Cookie là các tệp tin nhỏ được lưu trữ trên thiết bị của Quý khách khi truy cập website của chúng tôi. Cookie giúp nhận diện người dùng khi quay lại website và thu thập thông tin về cách thức Quý khách sử dụng dịch vụ của chúng tôi.
          </Paragraph>
        </>
      )
    },
    {
      icon: <SettingOutlined />,
      title: '2. Mục đích sử dụng Cookie',
      content: (
        <>
          <Paragraph>
            Chúng tôi sử dụng cookie cho các mục đích sau:
          </Paragraph>
          <ul className="cookie-list">
            <li><Text strong>Cải thiện trải nghiệm người dùng:</Text> Ghi nhớ lựa chọn của người dùng (ngôn ngữ, khu vực) để không cần nhập lại khi quay lại.</li>
            <li><Text strong>Phân tích và tối ưu hóa website:</Text> Thu thập thông tin về cách người dùng sử dụng website nhằm cải thiện giao diện và tính năng.</li>
            <li><Text strong>Quảng cáo và tiếp thị:</Text> Hiển thị quảng cáo phù hợp với sở thích và đo lường hiệu quả chiến dịch.</li>
            <li><Text strong>Xác thực người dùng:</Text> Duy trì trạng thái đăng nhập và đảm bảo chức năng bảo mật hoạt động đúng.</li>
          </ul>
        </>
      )
    },
    {
      icon: <LockOutlined />,
      title: '3. Các loại Cookie chúng tôi sử dụng',
      content: (
        <>
          <ul className="cookie-list">
            <li><Text strong>Cookie bắt buộc (Essential Cookies):</Text> Cần thiết để cung cấp các dịch vụ cơ bản như đăng nhập, thực hiện giao dịch.</li>
            <li><Text strong>Cookie phân tích (Analytics Cookies):</Text> Giúp thu thập thông tin tương tác, các trang truy cập và thời gian ở lại.</li>
            <li><Text strong>Cookie chức năng (Functional Cookies):</Text> Ghi nhớ lựa chọn như ngôn ngữ và cài đặt cá nhân hóa.</li>
            <li><Text strong>Cookie quảng cáo (Advertising Cookies):</Text> Cung cấp quảng cáo phù hợp sở thích và đo lường hiệu quả.</li>
          </ul>
        </>
      )
    },
    {
      icon: <ToolOutlined />,
      title: '4. Quản lý Cookie',
      content: (
        <>
          <Paragraph>
            Quý khách có thể quản lý hoặc vô hiệu hóa cookie qua cài đặt trình duyệt. Việc vô hiệu hóa cookie có thể ảnh hưởng đến một số tính năng và giảm trải nghiệm người dùng.
          </Paragraph>
          <ul className="cookie-list">
            <li><Text strong>Cài đặt trình duyệt:</Text> Hầu hết trình duyệt cho phép kiểm soát cookie trong phần cài đặt. Nếu vô hiệu hóa tất cả cookie, một số chức năng có thể không hoạt động đúng.</li>
            <li><Text strong>Cookie của bên thứ ba:</Text> Chúng tôi có thể dùng dịch vụ bên thứ ba (ví dụ: Google Analytics). Quý khách có thể điều chỉnh qua công cụ do bên thứ ba cung cấp.</li>
          </ul>
        </>
      )
    },
    {
      icon: <CheckCircleOutlined />,
      title: '5. Đồng ý với việc sử dụng Cookie',
      content: (
        <>
          <Paragraph>
            Khi Quý khách tiếp tục sử dụng website của chúng tôi, Quý khách đồng ý với việc sử dụng cookie như mô tả trong chính sách này. Nếu không đồng ý, Quý khách có thể điều chỉnh cài đặt cookie trên trình duyệt của mình.
          </Paragraph>
        </>
      )
    },
    {
      icon: <HistoryOutlined />,
      title: '6. Cập nhật Chính sách Cookie',
      content: (
        <>
          <Paragraph>
            Chúng tôi có quyền thay đổi hoặc cập nhật Chính sách Cookie bất kỳ lúc nào. Mọi thay đổi có hiệu lực ngay khi đăng tải trên website. Vui lòng thường xuyên kiểm tra trang này để cập nhật.
          </Paragraph>
        </>
      )
    },
    {
      icon: <PhoneOutlined />,
      title: '7. Liên hệ',
      content: (
        <>
          <Paragraph>
            Nếu Quý khách có câu hỏi về việc sử dụng cookie hoặc Chính sách Cookie, vui lòng liên hệ:
          </Paragraph>
          <Card className="cookie-contact-card" bordered={false}>
            <Space direction="vertical" size={8}>
              <Text strong style={{ fontSize: screens.xs ? 15 : 16, color: '#c08a19' }}>Bean Hotel</Text>
              <Text><Text strong>Địa chỉ:</Text> [Địa chỉ trụ sở]</Text>
              <Text><Text strong>Email:</Text> [Địa chỉ email hỗ trợ]</Text>
              <Text><Text strong>Website:</Text> <Text code>www.beanhotel.com</Text></Text>
            </Space>
          </Card>
        </>
      )
    }
  ]

  return (
    <div className="cookie-container">
      <div className="cookie-header">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Space direction="vertical" size={screens.xs ? 12 : 16} style={{ width: '100%' }}>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <a onClick={() => navigate('/')}>Trang chủ</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Chính sách Cookie</Breadcrumb.Item>
              </Breadcrumb>
              <Title 
                level={screens.xs ? 3 : 1}
                className="cookie-main-title"
                style={{ marginBottom: 0 }}
              >
                CHÍNH SÁCH COOKIE
              </Title>
              <Text type="secondary" style={{ fontSize: screens.xs ? 13 : 14 }}>
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </Text>
              <Paragraph 
                className="cookie-intro"
                style={{ 
                  fontSize: screens.xs ? 14 : 15,
                  textAlign: 'justify',
                  marginTop: screens.xs ? 8 : 12
                }}
              >
                Chúng tôi, <Text strong>Bean Hotel</Text>, sử dụng cookie và các công nghệ theo dõi để nâng cao trải nghiệm và cải thiện dịch vụ. Chính sách này mô tả cách chúng tôi sử dụng cookie, mục đích và cách Quý khách có thể quản lý cookie trên website của chúng tôi.
              </Paragraph>
            </Space>
          </Col>
        </Row>
      </div>

      <div className="cookie-content">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Card className="cookie-main-card" bordered={false}>
              <Space direction="vertical" size={screens.xs ? 24 : 32} style={{ width: '100%' }}>
                {sections.map((section, index) => (
                  <div key={index} className="cookie-section">
                    <Title 
                      level={screens.xs ? 5 : 4}
                      className="section-title"
                      style={{ marginBottom: screens.xs ? 12 : 16 }}
                    >
                      <Space size={screens.xs ? 8 : 12}>
                        <span className="section-icon">{section.icon}</span>
                        <span>{section.title}</span>
                      </Space>
                    </Title>
                    <div className="section-content">
                      {section.content}
                    </div>
                    {index < sections.length - 1 && (
                      <Divider style={{ margin: screens.xs ? '20px 0 0 0' : '28px 0 0 0' }} />
                    )}
                  </div>
                ))}
              </Space>

              <Divider style={{ margin: screens.xs ? '32px 0 24px 0' : '48px 0 32px 0' }} />

              <Paragraph style={{ textAlign: 'center', marginBottom: 0, fontSize: screens.xs ? 13 : 14 }}>
                <Text type="secondary">
                  Cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của <Text strong style={{ color: '#c08a19' }}>Bean Hotel</Text>
                </Text>
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CookiePolicy



