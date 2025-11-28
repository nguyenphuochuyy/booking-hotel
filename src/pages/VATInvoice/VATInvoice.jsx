import React from 'react'
import {
  Typography,
  Row,
  Col,
  Card,
  Steps,
  Timeline,
  Tag,
  Alert,
  Button,
  Divider,
  Breadcrumb
} from 'antd'
import {
  HomeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  MailOutlined,
  PhoneFilled,
  SafetyCertificateOutlined
} from '@ant-design/icons'
import './VATInvoice.css'

const { Title, Paragraph, Text } = Typography

const stepsData = [
  {
    title: 'Gửi yêu cầu',
    description: 'Điền form hoặc liên hệ hotline trong vòng 48 giờ sau thanh toán.',
    icon: <FileTextOutlined />
  },
  {
    title: 'Đối soát & xác minh',
    description: 'Kiểm tra giao dịch, thông tin thuế và chứng từ pháp lý.',
    icon: <CheckCircleOutlined />
  },
  {
    title: 'Xuất hóa đơn',
    description: 'Gửi bản điện tử qua email và bản giấy (nếu cần) trong 1-3 ngày làm việc.',
    icon: <DollarOutlined />
  }
]

const timelineItems = [
  {
    color: '#c08a19',
    children: (
      <div>
        <Text strong>Ngày 0 - Tiếp nhận yêu cầu</Text>
        <Paragraph type="secondary">Khách hàng gửi thông tin VAT sau khi thanh toán thành công.</Paragraph>
      </div>
    )
  },
  {
    color: '#1890ff',
    children: (
      <div>
        <Text strong>Ngày 1 - Đối soát giao dịch</Text>
        <Paragraph type="secondary">Kiểm tra thanh toán, hạng phòng và số tiền chịu thuế.</Paragraph>
      </div>
    )
  },
  {
    color: '#52c41a',
    children: (
      <div>
        <Text strong>Ngày 2 - Phát hành hóa đơn</Text>
        <Paragraph type="secondary">Xuất hóa đơn điện tử, ký số và gửi email xác nhận.</Paragraph>
      </div>
    )
  },
  {
    color: '#8c8c8c',
    children: (
      <div>
        <Text strong>Sau 3 ngày - Bản giấy (nếu yêu cầu)</Text>
        <Paragraph type="secondary">Chuyển phát nhanh bản cứng tới địa chỉ doanh nghiệp.</Paragraph>
      </div>
    )
  }
]

const requiredDocs = [
  'Thông tin pháp lý doanh nghiệp: Tên, địa chỉ, MST, email nhận hóa đơn.',
  'Mã đặt phòng hoặc số hợp đồng dịch vụ đã thanh toán tại Bean Hotel.',
  'Giá trị cần xuất hóa đơn (đã bao gồm/không bao gồm dịch vụ bổ sung).',
  'Ủy quyền của doanh nghiệp (nếu người yêu cầu không phải đại diện pháp luật).'
]

function VATInvoice() {
  return (
    <div className="vat-invoice-page">
      <div className="container">
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item>Xuất hóa đơn VAT</Breadcrumb.Item>
        </Breadcrumb>

        {/* Hero */}
        <div className="vat-hero">
          <div>
            <Title level={1} className="hero-title">XUẤT HÓA ĐƠN VAT</Title>
            <Paragraph className="hero-desc">
              Minh bạch - đúng hạn - đúng chuẩn pháp lý. Bean Hotel hỗ trợ xuất hóa đơn VAT cho mọi giao dịch,
              phù hợp với chính sách tài chính của doanh nghiệp bạn.
            </Paragraph>
            <div className="hero-tags">
              <Tag color="gold">Thanh toán PayOS / Chuyển khoản</Tag>
              <Tag color="blue">Hóa đơn điện tử</Tag>
              <Tag color="green">Ký số hợp lệ</Tag>
            </div>
          </div>
          <Card className="hero-card" bordered={false}>
            <Title level={3}>Thời gian xử lý trung bình</Title>
            <Title level={1} className="hero-highlight">1 - 3 ngày</Title>
            <Paragraph>Áp dụng từ lúc nhận đủ thông tin hợp lệ.</Paragraph>
          </Card>
        </div>

        {/* Highlights */}
        <Row gutter={[24, 24]} className="vat-highlight-row">
          <Col xs={24} md={8}>
            <Card bordered={false} className="highlight-card">
              <FileTextOutlined className="highlight-icon" />
              <Title level={4}>Quy trình rõ ràng</Title>
              <Paragraph type="secondary">
                Tự động đối soát giao dịch, xác minh thông tin và phát hành hóa đơn điện tử ký số.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} className="highlight-card">
              <SafetyCertificateOutlined className="highlight-icon" />
              <Title level={4}>Tuân thủ pháp lý</Title>
              <Paragraph type="secondary">
                Hóa đơn phát hành theo chuẩn Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} className="highlight-card">
              <MailOutlined className="highlight-icon" />
              <Title level={4}>Hỗ trợ đa kênh</Title>
              <Paragraph type="secondary">
                Email, hotline và live-chat sẵn sàng giải đáp tình trạng xử lý hóa đơn VAT.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Steps */}
        <section className="vat-section">
          <Title level={2} className="section-title">Quy trình yêu cầu hóa đơn</Title>
          <Steps
            className="vat-steps"
            responsive
            items={stepsData.map(step => ({
              title: step.title,
              description: step.description,
              icon: step.icon
            }))}
          />
        </section>

        {/* Timeline & Documents */}
        <section className="vat-section">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <Card className="timeline-card" bordered={false}>
                <Title level={3}>Timeline xử lý</Title>
                <Timeline items={timelineItems} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="docs-card" bordered={false}>
                <Title level={3}>Thông tin cần cung cấp</Title>
                <ul>
                  {requiredDocs.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
                <Alert
                  type="info"
                  showIcon
                  message="Ghi chú"
                  description="Bean Hotel cần nhận yêu cầu xuất hóa đơn trong vòng 07 ngày kể từ ngày checkout nhằm đảm bảo dữ liệu được lưu giữ đầy đủ."
                />
              </Card>
            </Col>
          </Row>
        </section>

        {/* Bottom CTA */}
        <section className="vat-section">
          <Divider />
          <div className="cta-panel">
            <div>
              <Title level={3}>Cần hỗ trợ thêm?</Title>
              <Paragraph>
                Đội ngũ kế toán của Bean Hotel trực từ 8:00 - 22:00 hằng ngày để hỗ trợ hóa đơn, chứng từ và đối soát công nợ.
              </Paragraph>
            </div>
            <div className="cta-actions">
              <Button icon={<PhoneFilled />} href="tel:0858369609">Gọi hotline</Button>
              <Button icon={<MailOutlined />} href="mailto:beanhotelvn@gmail.com">Email kế toán</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default VATInvoice

