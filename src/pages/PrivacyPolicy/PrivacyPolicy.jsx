import React from 'react'
import { Typography, Row, Col, Divider, Card, Space, Grid } from 'antd'
import { 
  SafetyOutlined, 
  InfoCircleOutlined, 
  EyeOutlined, 
  LockOutlined,
  ShareAltOutlined,
  UserOutlined,
  SettingOutlined,
  LinkOutlined,
  EditOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import './PrivacyPolicy.css'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

const PrivacyPolicy = () => {
  const screens = useBreakpoint()

  const sections = [
    {
      icon: <InfoCircleOutlined />,
      title: '1. Thông tin chúng tôi thu thập',
      content: (
        <>
          <Paragraph>
            Chúng tôi có thể thu thập và lưu trữ các thông tin sau từ Quý khách:
          </Paragraph>
          
          <Title level={5} className="subsection-title">Thông tin cá nhân:</Title>
          <ul className="privacy-list">
            <li>Họ tên, địa chỉ email, số điện thoại, địa chỉ nhận phòng, các thông tin thanh toán (ví dụ: số thẻ tín dụng/ghi nợ).</li>
            <li>Thông tin tài khoản người dùng: tên đăng nhập, mật khẩu.</li>
          </ul>

          <Title level={5} className="subsection-title">Thông tin đặt phòng:</Title>
          <ul className="privacy-list">
            <li>Chi tiết về các đặt phòng khách sạn, thời gian lưu trú, yêu cầu đặc biệt (nếu có).</li>
          </ul>

          <Title level={5} className="subsection-title">Thông tin giao dịch:</Title>
          <ul className="privacy-list">
            <li>Lịch sử giao dịch, thông tin thanh toán, phương thức thanh toán.</li>
          </ul>

          <Title level={5} className="subsection-title">Thông tin thiết bị và kết nối:</Title>
          <ul className="privacy-list">
            <li>Địa chỉ IP, loại thiết bị, hệ điều hành, trình duyệt web và thông tin liên quan đến kết nối mạng khi người dùng truy cập dịch vụ của chúng tôi.</li>
          </ul>
        </>
      )
    },
    {
      icon: <EyeOutlined />,
      title: '2. Mục đích thu thập thông tin',
      content: (
        <>
          <Paragraph>
            Chúng tôi thu thập thông tin cá nhân của Quý khách với các mục đích sau:
          </Paragraph>
          <ul className="privacy-list">
            <li>Cung cấp dịch vụ đặt phòng và xác nhận giao dịch.</li>
            <li>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng.</li>
            <li>Hỗ trợ khách hàng và giải đáp thắc mắc qua các kênh chăm sóc khách hàng.</li>
            <li>Gửi thông tin khuyến mại, ưu đãi đặc biệt hoặc thông báo về các chương trình mới của <Text strong>Bean Hotel</Text> (nếu Quý khách đồng ý nhận thông tin).</li>
            <li>Thực hiện các nghĩa vụ pháp lý hoặc yêu cầu từ cơ quan nhà nước có thẩm quyền.</li>
          </ul>
        </>
      )
    },
    {
      icon: <LockOutlined />,
      title: '3. Cách thức bảo vệ thông tin',
      content: (
        <>
          <Paragraph>
            Chúng tôi cam kết bảo vệ thông tin cá nhân của Quý khách bằng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp, bao gồm:
          </Paragraph>
          <ul className="privacy-list">
            <li>Sử dụng mã hóa SSL (Secure Sockets Layer) để bảo vệ thông tin cá nhân khi truyền tải qua mạng.</li>
            <li>Quản lý quyền truy cập và kiểm soát chặt chẽ các hệ thống lưu trữ dữ liệu.</li>
            <li>Giới hạn quyền truy cập vào thông tin cá nhân của Quý khách chỉ cho những nhân viên và đối tác cần thiết để thực hiện công việc của họ.</li>
          </ul>
        </>
      )
    },
    {
      icon: <ShareAltOutlined />,
      title: '4. Chia sẻ thông tin',
      content: (
        <>
          <Paragraph>
            <Text strong>Bean Hotel</Text> cam kết không bán, cho thuê hoặc chia sẻ thông tin cá nhân của Quý khách với bất kỳ bên thứ ba nào, ngoại trừ trong các trường hợp sau:
          </Paragraph>
          <ul className="privacy-list">
            <li><Text strong>Với các đối tác dịch vụ:</Text> Chúng tôi có thể chia sẻ thông tin với các đối tác cung cấp dịch vụ (ví dụ: các khách sạn, nhà cung cấp thanh toán) để thực hiện việc đặt phòng và các giao dịch liên quan.</li>
            <li><Text strong>Khi yêu cầu của pháp luật:</Text> Nếu có yêu cầu từ cơ quan nhà nước có thẩm quyền hoặc trong trường hợp chúng tôi cần bảo vệ quyền lợi hợp pháp của mình, chúng tôi có thể tiết lộ thông tin cá nhân của Quý khách.</li>
            <li><Text strong>Với sự đồng ý của Quý khách:</Text> Chúng tôi có thể chia sẻ thông tin của Quý khách nếu có sự đồng ý rõ ràng từ Quý khách.</li>
          </ul>
        </>
      )
    },
    {
      icon: <UserOutlined />,
      title: '5. Quyền của người dùng',
      content: (
        <>
          <Paragraph>
            Quý khách có quyền:
          </Paragraph>
          <ul className="privacy-list">
            <li><Text strong>Truy cập và cập nhật thông tin cá nhân:</Text> Quý khách có quyền yêu cầu xem và cập nhật thông tin cá nhân mà chúng tôi đã thu thập.</li>
            <li><Text strong>Yêu cầu xóa thông tin:</Text> Quý khách có quyền yêu cầu xóa thông tin cá nhân nếu không còn cần thiết cho các mục đích đã thu thập.</li>
            <li><Text strong>Rút lại sự đồng ý:</Text> Quý khách có quyền rút lại sự đồng ý nhận các thông tin khuyến mại, ưu đãi hoặc thông báo từ chúng tôi bất kỳ lúc nào.</li>
            <li><Text strong>Chống lại việc xử lý dữ liệu:</Text> Nếu Quý khách không muốn chúng tôi sử dụng thông tin của mình cho các mục đích tiếp thị, Quý khách có quyền yêu cầu ngừng xử lý dữ liệu cá nhân.</li>
          </ul>
          <Paragraph>
            Quý khách có thể thực hiện các quyền này bằng cách liên hệ với chúng tôi qua các kênh liên lạc dưới đây.
          </Paragraph>
        </>
      )
    },
    {
      icon: <SettingOutlined />,
      title: '6. Cookie và công nghệ theo dõi',
      content: (
        <>
          <Paragraph>
            <Text strong>Bean Hotel</Text> sử dụng các <Text strong>cookie</Text> và công nghệ theo dõi để thu thập thông tin về hoạt động của người dùng trên website và cải thiện trải nghiệm của họ. Cookie là các tệp tin nhỏ được lưu trữ trên thiết bị của người dùng.
          </Paragraph>
          <Paragraph>
            Quý khách có thể tắt tính năng cookie trong trình duyệt của mình, tuy nhiên, điều này có thể ảnh hưởng đến một số chức năng của website.
          </Paragraph>
        </>
      )
    },
    {
      icon: <LinkOutlined />,
      title: '7. Liên kết đến các website khác',
      content: (
        <>
          <Paragraph>
            Website của chúng tôi có thể chứa các liên kết đến các trang web của bên thứ ba. Chúng tôi không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc hoạt động của các trang web này. Quý khách nên kiểm tra chính sách bảo mật của từng website mà Quý khách truy cập.
          </Paragraph>
        </>
      )
    },
    {
      icon: <EditOutlined />,
      title: '8. Thay đổi Chính sách bảo mật',
      content: (
        <>
          <Paragraph>
            <Text strong>Bean Hotel</Text> có thể thay đổi hoặc cập nhật Chính sách bảo mật này vào bất kỳ thời điểm nào. Các thay đổi sẽ được đăng tải công khai trên website và có hiệu lực ngay khi công bố. Quý khách nên thường xuyên kiểm tra trang này để cập nhật thông tin mới nhất.
          </Paragraph>
        </>
      )
    },
    {
      icon: <PhoneOutlined />,
      title: '9. Liên hệ',
      content: (
        <>
          <Paragraph>
            Nếu Quý khách có bất kỳ câu hỏi nào về Chính sách bảo mật này hoặc cách thức chúng tôi thu thập và xử lý thông tin của Quý khách, vui lòng liên hệ với chúng tôi qua các phương thức sau:
          </Paragraph>
          <Card className="contact-card" bordered={false}>
            <Space direction="vertical" size={8}>
              <Text strong style={{ fontSize: screens.xs ? 15 : 16, color: '#c08a19' }}>Bean Hotel</Text>
              <Text><Text strong>Địa chỉ:</Text> [Địa chỉ trụ sở]</Text>
              <Text><Text strong>Hotline:</Text> [Số điện thoại]</Text>
              <Text><Text strong>Email:</Text> [Địa chỉ email hỗ trợ]</Text>
              <Text><Text strong>Website:</Text> <Text code>www.beanhotel.com</Text></Text>
            </Space>
          </Card>
        </>
      )
    }
  ]

  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Space direction="vertical" size={screens.xs ? 12 : 16} style={{ width: '100%', textAlign: 'center' }}>
              <Title 
                level={screens.xs ? 3 : 1} 
                className="privacy-main-title"
                style={{ marginBottom: 0 }}
              >
                CHÍNH SÁCH BẢO MẬT
              </Title>
              <Text type="secondary" style={{ fontSize: screens.xs ? 13 : 14 }}>
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </Text>
              <Paragraph 
                className="privacy-intro"
                style={{ 
                  fontSize: screens.xs ? 14 : 15,
                  textAlign: 'justify',
                  marginTop: screens.xs ? 8 : 12
                }}
              >
                Chúng tôi, <Text strong>Bean Hotel</Text> (sau đây gọi là "Chúng tôi", "Tôi", "Bean Hotel"), 
                cam kết bảo vệ quyền riêng tư và bảo mật thông tin cá nhân của Quý khách hàng. 
                Chính sách bảo mật này mô tả cách thức thu thập, sử dụng và bảo vệ thông tin cá nhân của Quý khách khi sử dụng dịch vụ của chúng tôi.
              </Paragraph>
              <Paragraph 
                style={{ 
                  fontSize: screens.xs ? 13 : 14,
                  textAlign: 'justify',
                  marginTop: screens.xs ? 8 : 12
                }}
              >
                Bằng cách truy cập và sử dụng website <Text code>www.beanhotel.com</Text> và các dịch vụ của chúng tôi, 
                Quý khách đồng ý với Chính sách bảo mật này. Nếu Quý khách không đồng ý, vui lòng ngừng sử dụng dịch vụ.
              </Paragraph>
            </Space>
          </Col>
        </Row>
      </div>

      <div className="privacy-content">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Card className="privacy-main-card" bordered={false}>
              <Space direction="vertical" size={screens.xs ? 24 : 32} style={{ width: '100%' }}>
                {sections.map((section, index) => (
                  <div key={index} className="privacy-section">
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

export default PrivacyPolicy
