import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { 
  CustomerServiceOutlined, 
  DollarCircleOutlined, 
  CalendarOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import './WhyChooseUs.css'; // File CSS để tùy chỉnh giao diện

const { Title, Paragraph } = Typography;

// Dữ liệu cho các lý do, dễ dàng thêm/bớt sau này
const features = [
  {
    icon: <CustomerServiceOutlined />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng trợ giúp bạn mọi lúc, mọi nơi, đảm bảo kỳ nghỉ của bạn trọn vẹn."
  },
  {
    icon: <DollarCircleOutlined />,
    title: "Đảm bảo giá tốt nhất",
    description: "Chúng tôi cam kết mang đến mức giá cạnh tranh nhất. Tìm thấy giá tốt hơn? Chúng tôi sẽ hoàn tiền chênh lệch."
  },
  {
    icon: <CalendarOutlined />,
    title: "Hủy phòng linh hoạt",
    description: "Nhiều lựa chọn cho phép hủy phòng miễn phí hoặc thay đổi lịch trình, giúp bạn an tâm tuyệt đối khi lên kế hoạch."
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Thanh toán an toàn",
    description: "Bảo mật thông tin tuyệt đối với các cổng thanh toán uy tín và công nghệ mã hóa tiên tiến hàng đầu."
  }
];

function WhyChooseUs() {
  return (
    <div className="why-choose-us-section">
      <div className="why-choose-us-container">
        <Title level={2} className="why-choose-us-title">
          Tại sao chọn chúng tôi?
        </Title>
        <Paragraph className="why-choose-us-subtitle">
          Chúng tôi không chỉ cung cấp phòng, chúng tôi mang đến trải nghiệm an tâm và tiện lợi.
        </Paragraph>
        
        <Row gutter={[24, 24]}> {/* gutter={[horizontal, vertical]} */}
          {features.map((feature, index) => (
            // Đây là phần xử lý responsive:
            // - PC (lg): 4 cột (6 * 4 = 24)
            // - Tablet (md): 2 cột (12 * 2 = 24)
            // - Mobile (xs): 1 cột (24 * 1 = 24)
            <Col xs={24} md={12} lg={6} key={index}>
              <Card hoverable className="why-choose-us-card">
                <div className="why-choose-us-icon">
                  {feature.icon}
                </div>
                <Title level={4} className="why-choose-us-card-title">
                  {feature.title}
                </Title>
                <Paragraph className="why-choose-us-card-desc">
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default WhyChooseUs;