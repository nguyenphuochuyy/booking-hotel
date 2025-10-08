import React from 'react'
import { Typography, Row, Col, Divider, Card, Space, Grid } from 'antd'
import { 
  SafetyCertificateOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  CreditCardOutlined,
  ShoppingOutlined,
  WarningOutlined,
  CopyrightOutlined,
  LockOutlined,
  EditOutlined,
  GlobalOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import './TermsOfService.css'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

const TermsOfService = () => {
  const screens = useBreakpoint()

  const sections = [
    {
      icon: <FileTextOutlined />,
      title: '1. Giới thiệu chung',
      content: (
        <>
          <Paragraph>
            <Text strong>Bean Hotel</Text> ("Chúng tôi") là nền tảng trực tuyến cho phép người dùng 
            ("Khách hàng") tìm kiếm, so sánh và đặt phòng khách sạn hoặc các cơ sở lưu trú khác 
            ("Đối tác cung cấp dịch vụ").
          </Paragraph>
          <Paragraph>
            Các dịch vụ được cung cấp thông qua website <Text code>www.beanhotel.com</Text> và/hoặc 
            ứng dụng di động của chúng tôi.
          </Paragraph>
        </>
      )
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: '2. Phạm vi áp dụng',
      content: (
        <>
          <Paragraph>
            Các Điều khoản này điều chỉnh việc truy cập và sử dụng dịch vụ của Quý khách đối với:
          </Paragraph>
          <ul className="terms-list">
            <li>Website và ứng dụng di động của <Text strong>Bean Hotel</Text></li>
            <li>Các dịch vụ hỗ trợ khách hàng, thông tin, công cụ và nội dung được cung cấp thông qua nền tảng.</li>
          </ul>
        </>
      )
    },
    {
      icon: <UserOutlined />,
      title: '3. Tài khoản người dùng',
      content: (
        <>
          <ul className="terms-list">
            <li>Người dùng cần đăng ký tài khoản để sử dụng đầy đủ các tính năng như đặt phòng, quản lý đơn hàng, nhận ưu đãi, v.v.</li>
            <li>Quý khách phải cung cấp thông tin chính xác, đầy đủ và cập nhật.</li>
            <li>Quý khách chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động xảy ra trong tài khoản của mình.</li>
            <li>Chúng tôi có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện hành vi vi phạm pháp luật, gian lận hoặc xâm phạm quyền lợi của bên thứ ba.</li>
          </ul>
        </>
      )
    },
    {
      icon: <CreditCardOutlined />,
      title: '4. Quy trình đặt phòng và thanh toán',
      content: (
        <>
          <ul className="terms-list">
            <li>Khi Quý khách thực hiện đặt phòng, hệ thống sẽ hiển thị thông tin chi tiết về giá, loại phòng, chính sách hủy, và các điều kiện liên quan.</li>
            <li>Việc xác nhận đặt phòng được xem là hoàn tất khi Quý khách nhận được <Text strong>email hoặc thông báo xác nhận</Text> từ hệ thống.</li>
            <li>Các phương thức thanh toán có thể bao gồm: thẻ tín dụng/ghi nợ, chuyển khoản, ví điện tử, hoặc thanh toán tại khách sạn (tùy theo chính sách từng đối tác).</li>
            <li>Mọi khoản phí, thuế, và phụ thu (nếu có) sẽ được thông báo rõ trước khi hoàn tất giao dịch.</li>
          </ul>
        </>
      )
    },
    {
      icon: <ShoppingOutlined />,
      title: '5. Chính sách hủy đặt phòng và hoàn tiền',
      content: (
        <>
          <ul className="terms-list">
            <li>Chính sách hủy hoặc thay đổi đặt phòng tùy thuộc vào từng khách sạn hoặc gói ưu đãi cụ thể.</li>
            <li>Quý khách nên kiểm tra kỹ thông tin trước khi xác nhận đặt phòng.</li>
            <li>Trong trường hợp hủy hoặc thay đổi, các khoản phí (nếu có) sẽ được thông báo rõ ràng trong quy trình xử lý.</li>
          </ul>
        </>
      )
    },
    {
      icon: <UserOutlined />,
      title: '6. Quyền và nghĩa vụ của người dùng',
      content: (
        <>
          <Paragraph>
            <Text strong className="section-subtitle">Người dùng cam kết không:</Text>
          </Paragraph>
          <ul className="terms-list">
            <li>Sử dụng website cho mục đích trái pháp luật, gian lận hoặc gây hại cho người khác.</li>
            <li>Gửi, đăng tải, phát tán nội dung chứa mã độc, thư rác, hoặc thông tin sai lệch.</li>
            <li>Xâm nhập, can thiệp hoặc làm gián đoạn hệ thống của website.</li>
          </ul>
          <Paragraph>
            <Text strong className="section-subtitle">Người dùng có quyền:</Text>
          </Paragraph>
          <ul className="terms-list">
            <li>Truy cập và sử dụng dịch vụ theo đúng mục đích được cung cấp.</li>
            <li>Yêu cầu hỗ trợ, giải đáp hoặc khiếu nại qua kênh chăm sóc khách hàng của chúng tôi.</li>
          </ul>
        </>
      )
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: '7. Quyền và nghĩa vụ của Bean Hotel',
      content: (
        <>
          <ul className="terms-list">
            <li>Cung cấp thông tin, công cụ và dịch vụ đặt phòng một cách chính xác, ổn định và bảo mật.</li>
            <li>Hỗ trợ người dùng trong các vấn đề phát sinh liên quan đến đặt phòng và thanh toán.</li>
            <li>Có quyền tạm ngừng, chỉnh sửa hoặc chấm dứt dịch vụ để bảo trì, nâng cấp hoặc theo yêu cầu pháp luật.</li>
          </ul>
        </>
      )
    },
    {
      icon: <WarningOutlined />,
      title: '8. Trách nhiệm giới hạn',
      content: (
        <>
          <ul className="terms-list">
            <li><Text strong>Bean Hotel</Text> chỉ đóng vai trò là <Text strong>bên trung gian</Text> kết nối người dùng và đối tác cung cấp dịch vụ.</li>
            <li>Chúng tôi không chịu trách nhiệm về chất lượng dịch vụ lưu trú, cơ sở vật chất hoặc hành vi của đối tác, trừ khi có lỗi trực tiếp từ hệ thống của chúng tôi.</li>
            <li>Trong mọi trường hợp, trách nhiệm tối đa của chúng tôi không vượt quá tổng số tiền mà Quý khách đã thanh toán cho giao dịch liên quan.</li>
          </ul>
        </>
      )
    },
    {
      icon: <CopyrightOutlined />,
      title: '9. Quyền sở hữu trí tuệ',
      content: (
        <>
          <ul className="terms-list">
            <li>Toàn bộ nội dung, thiết kế, hình ảnh, logo, mã nguồn, cơ sở dữ liệu trên website thuộc quyền sở hữu của <Text strong>Bean Hotel</Text> và được bảo hộ theo quy định pháp luật.</li>
            <li>Nghiêm cấm sao chép, sửa đổi, phát hành hoặc khai thác vì mục đích thương mại nếu không có sự đồng ý bằng văn bản của chúng tôi.</li>
          </ul>
        </>
      )
    },
    {
      icon: <LockOutlined />,
      title: '10. Bảo mật thông tin',
      content: (
        <>
          <ul className="terms-list">
            <li>Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng theo <Text strong>Chính sách bảo mật</Text> được công bố riêng trên website.</li>
            <li>Người dùng có trách nhiệm bảo mật thông tin tài khoản, không chia sẻ cho bên thứ ba.</li>
          </ul>
        </>
      )
    },
    {
      icon: <EditOutlined />,
      title: '11. Sửa đổi điều khoản',
      content: (
        <>
          <ul className="terms-list">
            <li><Text strong>Bean Hotel</Text> có quyền cập nhật hoặc thay đổi nội dung các Điều khoản này bất kỳ lúc nào.</li>
            <li>Phiên bản cập nhật sẽ được đăng tải công khai trên website và có hiệu lực ngay khi công bố.</li>
          </ul>
        </>
      )
    },
    {
      icon: <GlobalOutlined />,
      title: '12. Luật áp dụng và giải quyết tranh chấp',
      content: (
        <>
          <ul className="terms-list">
            <li>Các Điều khoản này được điều chỉnh bởi <Text strong>pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam</Text>.</li>
            <li>Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng. Trường hợp không đạt được thỏa thuận, tranh chấp sẽ được đưa ra <Text strong>Tòa án có thẩm quyền</Text> để giải quyết.</li>
          </ul>
        </>
      )
    },
    {
      icon: <PhoneOutlined />,
      title: '13. Thông tin liên hệ',
      content: (
        <>
          <Paragraph>
            Nếu Quý khách có bất kỳ câu hỏi, khiếu nại hoặc đề nghị, vui lòng liên hệ:
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
    <div className="terms-container">
      <div className="terms-header">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Space direction="vertical" size={screens.xs ? 12 : 16} style={{ width: '100%', textAlign: 'center' }}>
              <Title 
                level={screens.xs ? 3 : 1} 
                className="terms-main-title"
                style={{ marginBottom: 0 }}
              >
                ĐIỀU KHOẢN SỬ DỤNG
              </Title>
              <Text type="secondary" style={{ fontSize: screens.xs ? 13 : 14 }}>
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </Text>
              <Paragraph 
                className="terms-intro"
                style={{ 
                  fontSize: screens.xs ? 14 : 15,
                  textAlign: 'justify',
                  marginTop: screens.xs ? 8 : 12
                }}
              >
                Chào mừng Quý khách đến với <Text strong>Bean Hotel</Text> – hệ thống quản lý và đặt phòng khách sạn trực tuyến.
                Vui lòng đọc kỹ các Điều khoản sử dụng ("Điều khoản") dưới đây trước khi truy cập hoặc sử dụng dịch vụ của chúng tôi.
                Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ phần nào của website, Quý khách được xem là đã đọc, 
                hiểu và đồng ý tuân thủ các Điều khoản này.
              </Paragraph>
            </Space>
          </Col>
        </Row>
      </div>

      <div className="terms-content">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Card className="terms-main-card" bordered={false}>
              <Space direction="vertical" size={screens.xs ? 24 : 32} style={{ width: '100%' }}>
                {sections.map((section, index) => (
                  <div key={index} className="terms-section">
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

export default TermsOfService

