import React from 'react'
import { Row, Col, Card, Typography } from 'antd'
import {
  CustomerServiceOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import './WhyChooseUs.css'

const { Title, Paragraph } = Typography

const features = [
  {
    icon: <CustomerServiceOutlined />,
    title: 'Hỗ trợ 24/7',
    description:
      'Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng trợ giúp bạn mọi lúc, mọi nơi, đảm bảo kỳ nghỉ của bạn trọn vẹn.',
  },
  {
    icon: <DollarCircleOutlined />,
    title: 'Đảm bảo giá tốt nhất',
    description:
      'Chúng tôi cam kết mang đến mức giá cạnh tranh nhất. Tìm thấy giá tốt hơn? Chúng tôi sẽ hoàn tiền chênh lệch.',
  },
  {
    icon: <CalendarOutlined />,
    title: 'Hủy phòng linh hoạt',
    description:
      'Nhiều lựa chọn cho phép hủy phòng miễn phí hoặc thay đổi lịch trình, giúp bạn an tâm tuyệt đối khi lên kế hoạch.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Thanh toán an toàn',
    description:
      'Bảo mật thông tin tuyệt đối với các cổng thanh toán uy tín và công nghệ mã hóa tiên tiến hàng đầu.',
  },
]

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

function WhyChooseUs() {
  return (
    <section className="why-choose-us-section">
      <div className="why-choose-us-container">
        <motion.div
          className="why-choose-us-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Title level={2} className="why-choose-us-title">
            TẠI SAO CHỌN CHÚNG TÔI?
          </Title>
        
        </motion.div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={6} key={feature.title}>
                <motion.div variants={cardVariants}>
                  <Card hoverable className="why-choose-us-card">
                    <div className="why-choose-us-icon">
                      <span className="why-choose-us-icon-circle">{feature.icon}</span>
                    </div>
                    <Title level={4} className="why-choose-us-card-title">
                      {feature.title}
                    </Title>
                    <Paragraph className="why-choose-us-card-desc">
                      {feature.description}
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUs