import React from 'react'
import { Layout, Row, Col, Space, Button, Typography, Divider, Select } from 'antd'
import { PhoneFilled, MessageFilled, EnvironmentFilled, MailFilled, ClockCircleFilled, CarFilled, InfoCircleFilled, LockFilled, FileTextFilled, GlobalOutlined, DollarOutlined, ArrowRightOutlined } from '@ant-design/icons'
import logo from '../../assets/images/z7069108952704_e5432be9b3a36f7a517a48cad2d3807b-removebg-preview.png'
import vietqr from '../../assets/images/qr.png'
const { Footer: AntFooter } = Layout
const { Title, Text, Link } = Typography

function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <AntFooter style={{
  
      backgroundSize: 'cover',
      color: '#1f2937',
      padding: '48px 16px 16px',
      borderTop: '1px solid rgba(2,6,23,0.08)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 8px', 
      }}>
        <Row
          gutter={[
            { xs: 16, sm: 24, md: 24 },
            { xs: 24, sm: 32, md: 32 }
          ]}
          justify="center"
          align="top"
        >
          {/* Cột 1: Logo, Tên khách sạn, Nút đặt phòng, QR */}
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer'
              }} onClick={() => window.location.href = '/'}>
                <img
                  src={logo}
                  alt="Bean Hotel"
                  style={{
                    width: window.innerWidth < 768 ? 60 : 100,
                    height: window.innerWidth < 768 ? 60 : 100
                  }}
                />
                <div>
                  <Title
                    level={4}
                    style={{
                      color: '#0f172a',
                      margin: 0,
                      fontSize: window.innerWidth < 768 ? '16px' : '18px'
                    }}
                  >
                    Bean Hotel
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: '14px' }}>Đặt trực tiếp giá tốt hơn</Text>
                </div>
              </div>

              <a href="/hotels" style={{ width: '100%', display: 'block' }}>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  size="large"
                  style={{
                    width: window.innerWidth < 768 ? '100%' : '70%',
                    height: '48px',
                    fontSize: window.innerWidth < 768 ? '14px' : '16px'
                  }}
                >
                  Đặt phòng ngay
                </Button>
              </a>

              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={vietqr}
                    alt="VietQR chuyển khoản nhanh"
                    style={{
                      width: window.innerWidth < 768 ? 60 : 80,
                      height: window.innerWidth < 768 ? 60 : 80,
                      background: '#ffffff',
                      padding: 8,
                      borderRadius: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  <div>
                    <Text strong style={{ color: '#0f172a', display: 'block' }}>Chuyển khoản nhanh</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>VietQR • STK: 0858369609 - 0366228041</Text>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>MB Bank - CN Thành Phố Hồ Chí Minh</Text>
                  </div>
                </div>
              </Space>
            </Space>
          </Col>

          {/* Cột 2: Liên hệ */}
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Title
              level={4}
              style={{
                color: '#0f172a',
                marginTop: 0,
                marginBottom: 16,
                fontSize: window.innerWidth < 768 ? '16px' : '18px'
              }}
            >
              Liên hệ
            </Title>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <PhoneFilled style={{ color: '#000', marginRight: 8 }} />
                <a href="tel:0858369609" style={{ color: '#000', marginRight: 8 }}>
                  Hotline: 0858 369 609
                </a>
              </div>

              <div
              >
                <MailFilled style={{ color: '#000', marginRight: 8 }} />
                <a href="mailto:beanhotelvn@gmail.com" style={{ color: '#334155' }}>
                  beanhotelvn@gmail.com
                </a>
              </div>

              <div>
                <EnvironmentFilled style={{ color: '#64748b', marginRight: 8 }} />
                <Text style={{ color: '#334155' }}>
                  Số 12 Hoa Sữa, P.7, TP. Đà Lạt, Lâm Đồng
                </Text>
              </div>

              <div>
                <GlobalOutlined style={{ color: '#000', marginRight: 8 }} />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.google.com/maps/place/Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+C%C3%B4ng+nghi%E1%BB%87p+TP.HCM/@10.8221642,106.6842705,17z/data=!3m1!4b1!4m6!3m5!1s0x3174deb3ef536f31:0x8b7bb8b7c956157b!8m2!3d10.8221589!4d106.6868454!16s%2Fm%2F02pyzdj?entry=ttu&g_ep=EgoyMDI1MTAwNC4wIKXMDSoASAFQAw%3D%3D"
                  style={{ color: '#334155' }}
                >
                  Xem bản đồ
                </a>
              </div>

              <div>
                <ClockCircleFilled style={{ color: '#64748b', marginRight: 8 }} />
                <Text style={{ color: '#334155' }}>
                  Check-in: 14:00 • Check-out: 12:00
                </Text>
              </div>

              <div>
                <InfoCircleFilled style={{ color: '#64748b', marginRight: 8 }} />
                <Text style={{ color: '#334155' }}>
                  Thời gian hỗ trợ: 07:00 - 22:00
                </Text>
              </div>
            </Space>
          </Col>

          {/* Cột 3: Hỗ trợ & Chính sách */}
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Title
              level={4}
              style={{
                color: '#0f172a',
                marginTop: 0,
                marginBottom: 16,
                fontSize: window.innerWidth < 768 ? '16px' : '18px'
              }}
            >
              Hỗ trợ & Chính sách
            </Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <a href="/faq" style={{ color: '#334155', display: 'block' }}>
                <InfoCircleFilled style={{ marginRight: 8, color: '#64748b' }} />
                Câu hỏi thường gặp
              </a>

              <a href="/cancellation-policy" style={{ color: '#334155', display: 'block' }}>
                <FileTextFilled style={{ marginRight: 8, color: '#64748b' }} />
                Chính sách hủy/đổi ngày
              </a>

              <a href="/room-change-policy" style={{ color: '#334155', display: 'block' }}>
                <CarFilled style={{ marginRight: 8, color: '#64748b' }} />
                Chính sách đổi phòng
              </a>

              <a href="/thanh-toan" style={{ color: '#334155', display: 'block' }}>
                <DollarOutlined style={{ marginRight: 8, color: '#64748b' }} />
                Thanh toán & Hoàn tiền
              </a>

              <a href="/privacy-policy" style={{ color: '#334155', display: 'block' }}>
                <LockFilled style={{ marginRight: 8, color: '#64748b' }} />
                Bảo mật dữ liệu cá nhân
              </a>

              <a href="/hoa-don-vat" style={{ color: '#334155', display: 'block' }}>
                <FileTextFilled style={{ marginRight: 8, color: '#64748b' }} />
                Xuất hóa đơn VAT
              </a>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(2,6,23,0.08)', margin: '24px 0' }} />

        {/* Bottom bar */}
        <Row gutter={[16, 16]} align="middle">
          {/* <Col xs={24} md={8} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Space size={8} wrap aria-label="Ngôn ngữ & Tiền tệ">
              <Button size="small" type="primary" ghost aria-pressed>VI</Button>
              <Button size="small" type="text">EN</Button>
              <Select size="small" defaultValue="VND" options={[{ value: 'VND', label: 'VND' }, { value: 'USD', label: 'USD' }]} style={{ width: 100 }} />
            </Space>
          </Col> */}
          <Col xs={24} md={12} style={{ textAlign: 'center' }}>
            <Text style={{ color: '#334155' }}>© {currentYear} Bean Hotel. All rights reserved.</Text>
          </Col>
          <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <a href="/terms-of-service" style={{ color: '#1d4ed8' }}>Điều khoản</a>
            <a href="/privacy-policy" style={{ color: '#1d4ed8' }}>Bảo mật</a>
            <a href="/cookie-policy" style={{ color: '#1d4ed8' }}>Cookie</a>
          </Col>
        </Row>
      </div>
    </AntFooter>
  )
}

export default AppFooter



