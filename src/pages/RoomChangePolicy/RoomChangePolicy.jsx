import React from 'react'
import {
  Breadcrumb,
  Typography,
  Row,
  Col,
  Card,
  Steps,
  Tag,
  Collapse,
  Alert,
  Statistic,
  Space,
  Button
} from 'antd'
import {
  HomeOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  SmileOutlined
} from '@ant-design/icons'
import './RoomChangePolicy.css'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps

const changeReasons = [
  {
    title: 'Nhu cầu nâng hạng',
    details: 'Khách mong muốn trải nghiệm hạng phòng cao hơn (Suite, Sky Villa, v.v.).',
    tag: 'Ưu tiên'
  },
  {
    title: 'Thay đổi số người',
    details: 'Phù hợp với các đoàn gia đình cần thêm giường, khách thêm/bớt thành viên.',
    tag: 'Chuẩn bị'
  },
  {
    title: 'Yêu cầu đặc biệt',
    details: 'Gần cửa sổ, tầng cao, view hồ bơi, chống dị ứng, giường đơn/đôi.',
    tag: 'Theo tình trạng phòng'
  }
]

const policies = [
  {
    label: 'Trong vòng 24h trước check-in',
    rule: 'Miễn phí đổi nếu cùng hạng giá hoặc chênh lệch nhỏ hơn 300.000đ.',
    highlight: 'Miễn phí'
  },
  {
    label: 'Sau khi nhận phòng',
    rule: 'Phụ thu tương ứng số đêm còn lại và chênh lệch hạng phòng.',
    highlight: '+ chênh lệch'
  },
  {
    label: 'Đổi phòng theo yêu cầu vệ sinh/kỹ thuật',
    rule: 'Bean Hotel hỗ trợ đổi ngay miễn phí và tặng kèm quà xin lỗi.',
    highlight: 'Cam kết'
  }
]

const accordionItems = [
  {
    key: '1',
    label: 'Tôi cần đổi phòng gấp trong đêm, khách sạn xử lý thế nào?',
    children: (
      <Paragraph>
        Lễ tân trực 24/7 sẽ kiểm tra tình trạng phòng ngay lập tức. Nếu còn phòng tương đương hoặc cao hơn,
        chúng tôi hỗ trợ đổi và chỉ thu chênh lệch (nếu có). Trường hợp khách sạn kín phòng, Bean Hotel sẽ
        hỗ trợ dọn lại phòng hiện tại hoặc tạm bố trí phòng khác đến khi việc đổi hoàn tất.
      </Paragraph>
    )
  },
  {
    key: '2',
    label: 'Tôi đã trả phòng nhưng muốn đổi sang ngày khác?',
    children: (
      <Paragraph>
        Chính sách đổi phòng áp dụng trong cùng kỳ lưu trú. Nếu bạn muốn dời lịch, vui lòng tham khảo
        trang Chính sách hủy/đổi ngày hoặc liên hệ hotline 0366 228 041 để được hỗ trợ tốt nhất.
      </Paragraph>
    )
  },
  {
    key: '3',
    label: 'Tôi có phải nộp thêm đặt cọc khi đổi sang hạng cao hơn không?',
    children: (
      <Paragraph>
        Trong hầu hết trường hợp, chỉ cần thanh toán phần chênh lệch giá phòng. Nếu bạn sử dụng phương thức
        thanh toán tại quầy, lễ tân sẽ cập nhật lại phiếu cọc tương ứng số tiền mới.
      </Paragraph>
    )
  }
]

function RoomChangePolicy() {
  return (
    <div className="room-change-page">
      <div className="container">
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Chính sách đổi phòng</Breadcrumb.Item>
        </Breadcrumb>

        <section className="room-change-hero">
          <div className="hero-text">
            <Tag color="gold" className="hero-tag">Bean Hotel Care</Tag>
            <Title level={1}>Chính sách đổi phòng</Title>
            <Paragraph>
              Linh hoạt – minh bạch – ưu tiên trải nghiệm của bạn. Bean Hotel luôn cố gắng đáp ứng mọi
              nhu cầu điều chỉnh hạng phòng, thời gian hoặc số lượng khách với quy trình rõ ràng.
            </Paragraph>
            <Space size={[16, 16]} wrap>
              <Button type="primary" size="large" href="tel:0366228041">
                <PhoneOutlined /> Hotline 0366 228 041
              </Button>
              <Button size="large" href="https://zalo.me/0366228041" target="_blank" rel="noreferrer">
                Chat ngay
              </Button>
            </Space>
          </div>
          <div className="hero-highlight">
            <Card bordered={false} className="highlight-card">
              <Statistic title="Tỷ lệ xử lý thành công" value="98%" prefix={<SmileOutlined />} />
              <Text>Thời gian phản hồi trung bình: 7 phút</Text>
            </Card>
            <Card bordered={false} className="highlight-card">
              <Statistic title="Đổi phòng miễn phí" value="24h" prefix={<ClockCircleOutlined />} />
              <Text>Áp dụng khi thông báo sớm trước giờ check-in</Text>
            </Card>
          </div>
        </section>

        <section className="room-change-steps">
          <Title level={2}>Quy trình đổi phòng 3 bước</Title>
          <Steps direction="vertical" current={2} className="steps-custom">
            <Step
              title="Bước 1: Gửi yêu cầu"
              description="Chat với chatbot, Zalo hoặc gọi hotline để thông báo mã đặt phòng & nhu cầu cụ thể."
              icon={<SwapOutlined />}
            />
            <Step
              title="Bước 2: Kiểm tra tình trạng"
              description="Đội ngũ xác nhận tình trạng phòng và báo mức phí chênh lệch (nếu có). Thời gian xử lý 5-10 phút."
              icon={<ClockCircleOutlined />}
            />
            <Step
              title="Bước 3: Xác nhận"
              description="Bạn nhận thông báo đổi phòng qua SMS/email. Lễ tân chuẩn bị phòng mới và hỗ trợ vận chuyển hành lý."
              icon={<CheckCircleOutlined />}
            />
          </Steps>
        </section>

        <section className="room-change-reasons">
          <Row gutter={[24, 24]}>
            {changeReasons.map(item => (
              <Col xs={24} md={8} key={item.title}>
                <Card className="reason-card">
                  <Tag color="gold">{item.tag}</Tag>
                  <Title level={4}>{item.title}</Title>
                  <Paragraph>{item.details}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="room-change-policies">
          <Row gutter={[24, 24]}>
            {policies.map(policy => (
              <Col xs={24} md={8} key={policy.label}>
                <Card className="policy-card">
                  <Title level={4}>{policy.label}</Title>
                  <Paragraph>{policy.rule}</Paragraph>
                  <Tag color="gold">{policy.highlight}</Tag>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="room-change-extra">
          <Title level={2}>Câu hỏi thường gặp</Title>
          <Collapse items={accordionItems} bordered={false} className="faq-collapse" />
          <Alert
            type="info"
            showIcon
            className="info-note"
            message="Mẹo nhanh"
            description="Nếu bạn muốn chắc chắn có phòng ưng ý, hãy gửi yêu cầu đổi ngay sau khi hoàn tất đặt phòng hoặc ít nhất 24h trước khi đến."
          />
        </section>
      </div>
    </div>
  )
}

export default RoomChangePolicy

