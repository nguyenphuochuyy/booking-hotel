import React, { useMemo } from 'react'
import {
  Breadcrumb,
  Typography,
  Collapse,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Statistic,
  Space
} from 'antd'
import {
  HomeOutlined,
  QuestionCircleOutlined,
  PhoneOutlined,
  MessageOutlined,
  SmileOutlined
} from '@ant-design/icons'
import './FAQ.css'

const { Title, Paragraph, Text } = Typography

function FAQ() {
  const faqGroups = useMemo(() => ([
    {
      key: 'booking',
      title: 'Đặt phòng & thanh toán',
      description: 'Thông tin về quy trình đặt phòng, chính sách thanh toán và bảo lưu đặt chỗ.',
      badge: 'Phổ biến',
      questions: [
        {
          q: 'Làm thế nào để đặt phòng nhanh chóng nhất?',
          a: 'Bạn có thể đặt phòng trực tuyến qua website của Bean Hotel: chọn ngày nhận/trả phòng, số lượng khách/phòng rồi nhấn "Tìm phòng". Sau khi chọn phòng phù hợp, tiến hành điền thông tin và thanh toán. Hệ thống sẽ gửi email xác nhận ngay lập tức.'
        },
        {
          q: 'Tôi có thể thanh toán bằng những phương thức nào?',
          a: 'Bean Hotel hỗ trợ thanh toán bằng thẻ tín dụng/ghi nợ (Visa, MasterCard), chuyển khoản ngân hàng, ví điện tử và thanh toán tại quầy đối với các đặt phòng linh hoạt.'
        },
        {
          q: 'Tôi muốn xuất hóa đơn VAT, phải làm sao?',
          a: 'Trong bước nhập thông tin khách hàng, bạn chỉ cần đánh dấu yêu cầu xuất hóa đơn và nhập thông tin doanh nghiệp. Hóa đơn sẽ được gửi qua email trong vòng 24 giờ sau khi bạn hoàn tất lưu trú.'
        }
      ]
    },
    {
      key: 'policy',
      title: 'Chính sách & lịch nhận trả phòng',
      description: 'Giờ giấc, chính sách hủy và các quy định khi lưu trú tại Bean Hotel.',
      badge: 'Quan trọng',
      questions: [
        {
          q: 'Giờ nhận phòng và trả phòng như thế nào?',
          a: 'Giờ nhận phòng tiêu chuẩn là 14:00 và trả phòng trước 12:00. Nếu cần nhận sớm hoặc trả muộn, vui lòng thông báo trước để chúng tôi sắp xếp tùy theo tình trạng phòng.'
        },
        {
          q: 'Chính sách hủy phòng ra sao?',
          a: 'Bạn có thể hủy miễn phí trước ít nhất 5 ngày so với ngày nhận phòng. Sau thời gian này, phí hủy sẽ tương đương 50% giá trị đặt phòng. Với các gói không hoàn hủy, phí sẽ là 100%.'
        },
        {
          q: 'Khách sạn có hỗ trợ trẻ em và thú cưng không?',
          a: 'Trẻ em dưới 6 tuổi được ở cùng bố mẹ miễn phí. Khách sạn hiện chưa hỗ trợ thú cưng để đảm bảo tiêu chuẩn vệ sinh chung cho toàn bộ khách hàng.'
        }
      ]
    },
    {
      key: 'service',
      title: 'Dịch vụ bổ trợ & hỗ trợ khách hàng',
      description: 'Các câu hỏi về dịch vụ trải nghiệm, nâng cấp phòng và hỗ trợ 24/7.',
      questions: [
        {
          q: 'Bean Hotel có các gói dịch vụ nào nổi bật?',
          a: 'Chúng tôi có các gói Spa Trị Liệu, Fine-Dining, Đón tiễn sân bay và một số trải nghiệm địa phương (city tour, cooking class). Bạn có thể đặt trước qua mục Dịch vụ hoặc liên hệ trực tiếp với Lễ tân.'
        },
        {
          q: 'Tôi muốn thay đổi hạng phòng sau khi đã đặt?',
          a: 'Nếu phòng còn trống, đội ngũ Lễ tân sẽ hỗ trợ nâng hạng ngay khi bạn đến nhận phòng, hoặc bạn có thể chat với chatbot/Zalo để được hỗ trợ trước.'
        },
        {
          q: 'Tôi cần hỗ trợ khẩn cấp thì liên hệ ai?',
          a: 'Đội ngũ hỗ trợ trực 24/7 qua hotline 0366 228 041, chat trên website hoặc Zalo Bean Hotel. Với khách đang lưu trú, phím nhanh "0" tại điện thoại trong phòng sẽ kết nối tới Lễ tân.'
        }
      ]
    }
  ]), [])

  return (
    <div className="faq-page">
      <div className="container">
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Câu hỏi thường gặp</Breadcrumb.Item>
        </Breadcrumb>

        <section className="faq-hero">
          <div className="hero-content">
            <Tag color="gold" className="hero-tag">24/7 Support</Tag>
            <Title level={1} className="hero-title">
              Giải đáp nhanh mọi thắc mắc của bạn
            </Title>
            <Paragraph className="hero-desc">
              Bộ câu hỏi thường gặp giúp bạn chuẩn bị cho kỳ nghỉ hoàn hảo tại Bean Hotel.
              Nếu cần thêm thông tin, đội ngũ hỗ trợ luôn sẵn sàng đồng hành cùng bạn.
            </Paragraph>
            <Space size={16} wrap>
              <Button type="primary" size="large" className="hero-button" href="tel:0366228041">
                <PhoneOutlined /> Gọi hotline
              </Button>
              <Button size="large" className="hero-button ghost" href="https://zalo.me/0366228041" target="_blank" rel="noreferrer">
                <MessageOutlined /> Chat Zalo
              </Button>
            </Space>
          </div>
          <div className="hero-stats">
            <Card className="stat-card">
              <Statistic title="Mức độ hài lòng" value="4.9/5" prefix={<SmileOutlined />} />
              <Text>Được hơn 12.000 khách hàng đánh giá tích cực</Text>
            </Card>
            <Card className="stat-card">
              <Statistic title="Thời gian phản hồi" value="5 phút" prefix={<QuestionCircleOutlined />} />
              <Text>Viết tới chúng tôi bất cứ lúc nào</Text>
            </Card>
          </div>
        </section>

        <section className="faq-section">
          {faqGroups.map(group => (
            <div key={group.key} className="faq-block">
              <div className="faq-block-header">
                <div>
                  <Tag color="gold">{group.badge || 'Gợi ý'}</Tag>
                  <Title level={2}>{group.title}</Title>
                  <Paragraph>{group.description}</Paragraph>
                </div>
              </div>
              <Collapse
                bordered={false}
                accordion
                items={group.questions.map((item, index) => ({
                  key: `${group.key}-${index}`,
                  label: item.q,
                  children: <Paragraph>{item.a}</Paragraph>
                }))}
                className="faq-collapse"
              />
            </div>
          ))}
        </section>

        <section className="faq-contact-highlight">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card className="contact-card support">
                <Title level={3}>Cần tư vấn trực tiếp?</Title>
                <Paragraph>
                  Đội ngũ concierge của Bean Hotel luôn trực để cá nhân hóa mọi nhu cầu của bạn.
                </Paragraph>
                <Button type="primary" block size="large" href="tel:0366228041">
                  <PhoneOutlined /> 0366 228 041
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="contact-card email">
                <Title level={3}>Gửi email cho chúng tôi</Title>
                <Paragraph>
                  Đặt câu hỏi chi tiết, yêu cầu hợp tác hoặc lịch trình đặc biệt qua email chính thức.
                </Paragraph>
                <Button block size="large" href="mailto:booking@beanhotel.vn">
                  <MessageOutlined /> booking@beanhotel.vn
                </Button>
              </Card>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  )
}

export default FAQ

