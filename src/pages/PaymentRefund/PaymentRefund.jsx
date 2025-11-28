import React from 'react'
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Divider,
  Steps,
  Timeline,
  Alert,
  Button,
  Breadcrumb
} from 'antd'
import {
  HomeOutlined,
  DollarOutlined,
  CreditCardOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
  PhoneFilled
} from '@ant-design/icons'
import './PaymentRefund.css'

const { Title, Paragraph, Text } = Typography

const paymentMethods = [
  {
    icon: <CreditCardOutlined />,
    title: 'Thanh toán PayOS',
    desc: 'Phù hợp cho đặt phòng online. Hệ thống tự động xác nhận sau 3-5 giây và gửi hóa đơn điện tử.',
    badges: ['Bảo mật 3D Secure', 'Tự động đối soát']
  },
  {
    icon: <BankOutlined />,
    title: 'Chuyển khoản VietQR',
    desc: 'Sử dụng mã VietQR cố định của Bean Hotel. Nội dung chuyển khoản cần kèm mã đặt phòng.',
    badges: ['Ghi nhận trong 15 phút', 'Miễn phí nội bộ MB']
  },
  {
    icon: <MobileOutlined />,
    title: 'Ví điện tử & Internet Banking',
    desc: 'Hỗ trợ Momo, ZaloPay, VNPay thông qua cổng PayOS. Các yêu cầu hoàn tiền sẽ trả về đúng nguồn thanh toán.',
    badges: ['Hỗ trợ 24/7', 'Hoàn tiền cùng kênh']
  },
  {
    icon: <DollarOutlined />,
    title: 'Tiền mặt tại quầy (Walk-in)',
    desc: 'Áp dụng cho khách nhận phòng trực tiếp. Nhân viên xuất biên nhận & đồng bộ trạng thái trong hệ thống.',
    badges: ['Kiểm đếm 2 lớp', 'Cam kết minh bạch']
  }
]

const refundPolicies = [
  {
    title: 'Trong 1 giờ sau khi đặt',
    percent: 'Hoàn 85%',
    color: '#52c41a',
    desc: 'Khoảng thời gian cân nhắc. Bạn chỉ mất 15% phí xử lý & khóa phòng.',
    note: 'Áp dụng cho mọi loại đặt phòng.'
  },
  {
    title: 'Trước 48 giờ so với giờ check-in',
    percent: 'Hoàn 70%',
    color: '#faad14',
    desc: 'Khuyến khích thông báo sớm để chúng tôi tối ưu kế hoạch buồng phòng.',
    note: 'Tính theo giờ chuẩn check-in 14:00.'
  },
  {
    title: 'Trong 48 giờ trước check-in',
    percent: 'Không hoàn',
    color: '#ff4d4f',
    desc: 'Bean Hotel đã giữ phòng và từ chối các yêu cầu khác. Quý khách có thể chuyển đổi ngày lưu trú.',
    note: 'Có thể xem xét linh hoạt với lý do bất khả kháng.'
  }
]

const processSteps = [
  {
    title: 'Đặt phòng & thanh toán',
    description: 'PayOS/Chuyển khoản xác nhận tự động. Walk-in nhận biên nhận giấy.',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
  },
  {
    title: 'Đối soát & cập nhật',
    description: 'Hệ thống đồng bộ vào lịch phòng, gửi email xác nhận và lưu mã đơn.',
    icon: <ReloadOutlined style={{ color: '#1890ff' }} />
  },
  {
    title: 'Phát sinh hủy/hoàn',
    description: 'Áp dụng chính sách 1h/48h. Thông báo qua app, email hoặc hotline.',
    icon: <ClockCircleOutlined style={{ color: '#faad14' }} />
  },
  {
    title: 'Hoàn tiền',
    description: 'Chuyển khoản/PayOS trong 3-5 ngày làm việc. Tiền mặt hoàn tại quầy có biên nhận.',
    icon: <DollarOutlined style={{ color: '#c08a19' }} />
  }
]

const PaymentRefund = () => {
  return (
    <div className="payment-refund-page">
      <div className="container">
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item>Thanh toán & Hoàn tiền</Breadcrumb.Item>
        </Breadcrumb>

        <div className="payment-hero">
          <div className="hero-content">
            <Title level={1} className="page-title">THANH TOÁN & HOÀN TIỀN</Title>
            <Paragraph className="page-description">
              Minh bạch - tức thời - đồng bộ hệ thống. Chính sách này được xây dựng dựa trên
              điều khoản thanh toán, hủy phòng và hoàn tiền chính thức của Bean Hotel.
            </Paragraph>
            <Space size="middle" wrap>
              <Button type="primary" size="large" href="/booking-confirmation">
                Tiếp tục thanh toán
              </Button>
              <Button size="large" href="/cancellation-policy">
                Xem chính sách hủy phòng
              </Button>
            </Space>
          </div>
          <div className="hero-stats">
            <Card bordered={false}>
              <Title level={2}>3 - 5 ngày</Title>
              <Text>Thời gian hoàn tiền trung bình</Text>
            </Card>
            <Card bordered={false}>
              <Title level={2}>24/7</Title>
              <Text>Giám sát giao dịch PayOS</Text>
            </Card>
            <Card bordered={false}>
              <Title level={2}>100%</Title>
              <Text>Đặt phòng được ghi nhận tự động</Text>
            </Card>
          </div>
        </div>

        <section className="payment-section">
          <Title level={2} className="section-title">Phương thức thanh toán</Title>
          <Paragraph className="section-desc">
            Hệ thống sử dụng đồng thời PayOS, VietQR và Walk-in cash để phù hợp với từng hành trình đặt phòng.
            Mọi giao dịch đều được mã hóa và lưu vết.
          </Paragraph>
          <Row gutter={[24, 24]}>
            {paymentMethods.map((method) => (
              <Col xs={24} md={12} key={method.title}>
                <Card className="method-card" bordered={false}>
                  <div className="method-icon">{method.icon}</div>
                  <Title level={4}>{method.title}</Title>
                  <Paragraph type="secondary">{method.desc}</Paragraph>
                  <Space wrap>
                    {method.badges.map((badge) => (
                      <Tag key={badge} color="gold">{badge}</Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="workflow-section">
          <Title level={2} className="section-title">Quy trình thanh toán & hoàn tiền</Title>
          <Steps
            className="payment-steps"
            responsive
            items={processSteps.map((step) => ({
              title: step.title,
              description: step.description,
              icon: step.icon
            }))}
          />
          <Alert
            className="policy-alert"
            message="Hệ thống tự động áp dụng chính sách hoàn tiền từ tài liệu 'Chính sách hủy & đổi ngày' và điều khoản thanh toán."
            type="info"
            showIcon
          />
        </section>

        <section className="refund-section">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={10}>
              <div className="refund-card">
                <Title level={3}>Mốc hoàn tiền chuẩn</Title>
                <Paragraph>
                  Áp dụng cho đặt phòng trực tiếp tại Bean Hotel. Thời gian được tính theo giờ chuẩn check-in 14:00.
                </Paragraph>
                {refundPolicies.map((policy) => (
                  <Card key={policy.title} className="refund-policy-card" bordered={false}>
                    <div className="refund-header">
                      <Tag color={policy.color}>{policy.percent}</Tag>
                      <Text strong>{policy.title}</Text>
                    </div>
                    <Paragraph>{policy.desc}</Paragraph>
                    <Text type="secondary">{policy.note}</Text>
                  </Card>
                ))}
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <Card className="timeline-card" bordered={false}>
                <Title level={4}>Dòng thời gian xử lý hoàn tiền</Title>
                <Timeline
                  items={[
                    {
                      color: '#52c41a',
                      children: (
                        <div>
                          <Text strong>Tiếp nhận yêu cầu</Text>
                          <Paragraph type="secondary">Gửi qua app, email hoặc hotline trước mốc 48h.</Paragraph>
                        </div>
                      )
                    },
                    {
                      color: '#1890ff',
                      children: (
                        <div>
                          <Text strong>Xác minh giao dịch</Text>
                          <Paragraph type="secondary">Đối soát mã đặt phòng, phương thức thanh toán và số tiền đủ điều kiện.</Paragraph>
                        </div>
                      )
                    },
                    {
                      color: '#faad14',
                      children: (
                        <div>
                          <Text strong>Phê duyệt & lên lịch hoàn</Text>
                          <Paragraph type="secondary">Chuyển khoản PayOS/Banking trong 3-5 ngày làm việc.</Paragraph>
                        </div>
                      )
                    },
                    {
                      color: '#c08a19',
                      children: (
                        <div>
                          <Text strong>Thông báo kết quả</Text>
                          <Paragraph type="secondary">Email & SMS xác nhận, cập nhật trong lịch sử đặt phòng.</Paragraph>
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </section>

        <Divider />

        <section className="guarantee-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card className="guarantee-card" bordered={false}>
                <Space align="start">
                  <SafetyCertificateOutlined className="guarantee-icon" />
                  <div>
                    <Title level={4}>Cam kết giữ phòng & bảo vệ giao dịch</Title>
                    <Paragraph type="secondary">
                      Mọi giao dịch đều tuân thủ Điều khoản thanh toán Bean Hotel. Khi phát sinh hủy,
                      chúng tôi ưu tiên hoàn về đúng nguồn thanh toán ban đầu để đảm bảo truy vết.
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="guarantee-card" bordered={false}>
                <Space align="start">
                  <FileProtectOutlined className="guarantee-icon" />
                  <div>
                    <Title level={4}>Chứng từ & hóa đơn</Title>
                    <Paragraph type="secondary">
                      Hóa đơn VAT, biên nhận hoàn tiền hoặc xác nhận hủy sẽ được xuất trong vòng 24 giờ
                      kể từ khi giao dịch được cập nhật trạng thái hoàn tất.
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="support-section">
          <Card className="support-card" bordered={false}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={12}>
                <div>
                  <Title level={3}>Cần hỗ trợ thêm?</Title>
                  <Paragraph>
                    Đội ngũ Bean Hotel trực 7:00 - 22:00 hằng ngày để giải đáp các câu hỏi về thanh toán & hoàn tiền.
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Space size="large" wrap>
                  <Button type="primary" icon={<PhoneFilled />} size="large" href="tel:0858369609">
                    Gọi Hotline
                  </Button>
                  <Button size="large" href="https://zalo.me/0366228041">
                    Chat Zalo
                  </Button>
                  <Button size="large" href="mailto:beanhotelvn@gmail.com">
                    Email hỗ trợ
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default PaymentRefund

