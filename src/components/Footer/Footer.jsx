import React from 'react'
import { Layout, Row, Col, Space, Button, Typography, Divider, Select } from 'antd'
import { PhoneFilled, MessageFilled, EnvironmentFilled, MailFilled, ClockCircleFilled, CarFilled, InfoCircleFilled, LockFilled, FileTextFilled, GlobalOutlined, DollarOutlined, ArrowRightOutlined } from '@ant-design/icons'
import logo from '../../assets/images/logo.png'
const { Footer: AntFooter } = Layout
const { Title, Text, Link } = Typography

function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <AntFooter style={{
      background: '#f6f5f2',
      color: '#1f2937',
      padding: '48px 16px 16px',
      borderTop: '1px solid rgba(2,6,23,0.08)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[24, 32]} align="top">
          {/* 1) Thương hiệu & CTA */}
          <Col xs={24} md={12} lg={6}>
            <Space direction="vertical" size={12}>
              <img src= {logo} alt="Khách sạn An Yên" style={{ width: 40, height: 40 }} />
              <Text strong style={{ color: '#0f172a' }}>Khách sạn An Yên – Đặt trực tiếp giá tốt hơn</Text>
              <Space wrap>
                <a href="#booking">
                  <Button type="primary" icon={<ArrowRightOutlined />}>Đặt phòng ngay</Button>
                </a>
                <a href="tel:09xxxxxxxx">
                  <Button>Gọi 24/7: 09xx xxx xxx</Button>
                </a>
                <a href="https://zalo.me/09xxxxxxxx" target="_blank" rel="noreferrer">
                  <Button>Chat Zalo</Button>
                </a>
              </Space>
              <Space direction="vertical" size={8}>
                <img src="/qr-vietqr.png" alt="VietQR chuyển khoản nhanh" style={{ width: 120, height: 120, background: '#ffffff', padding: 8, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
                <Text type="secondary">VietQR • STK 12345678 (Vietcombank – CN Đà Lạt)</Text>
              </Space>
            </Space>
          </Col>

          {/* 2) Liên hệ & Bản đồ */}
          <Col xs={24} md={12} lg={6}>
            <Title level={4} style={{ color: '#0f172a', marginTop: 0 }}>Liên hệ</Title>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <a href="tel:09xxxxxxxx" style={{ color: '#1d4ed8' }}>Hotline/Zalo: 09xx xxx xxx</a>
              <a href="mailto:hello@anyen.vn" style={{ color: '#1d4ed8' }}>hello@anyen.vn</a>
              <Text>Địa chỉ: Số 12 Hoa Sữa, P.7, TP. Đà Lạt, Lâm Đồng</Text>
              <a target="_blank" rel="noopener" href="https://maps.google.com/?q=Khach+san+An+Yen+Da+Lat" style={{ color: '#1d4ed8' }}>Xem bản đồ</a>
              <Text>Check-in 14:00 • Check-out 12:00 • Hỗ trợ 07:00–22:00</Text>
            </Space>
          </Col>

          {/* 3) Hỗ trợ & Chính sách */}
          <Col xs={24} md={12} lg={6}>
            <Title level={4} style={{ color: '#0f172a', marginTop: 0 }}>Hỗ trợ & Chính sách</Title>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              <li><a href="/huong-dan-di-chuyen" style={{ color: '#334155' }}>Hướng dẫn di chuyển/đậu xe</a></li>
              <li><a href="/faq" style={{ color: '#334155' }}>Câu hỏi thường gặp</a></li>
              <li><a href="/chinh-sach-huy" style={{ color: '#334155' }}>Chính sách hủy/đổi ngày</a></li>
              <li><a href="/thanh-toan" style={{ color: '#334155' }}>Thanh toán & Hoàn tiền</a></li>
              <li><a href="/tre-em-thu-cung" style={{ color: '#334155' }}>Trẻ em & Thú cưng</a></li>
              <li><a href="/bao-mat" style={{ color: '#334155' }}>Bảo mật dữ liệu cá nhân</a></li>
              <li><a href="/hoa-don-vat" style={{ color: '#334155' }}>Xuất hóa đơn VAT</a></li>
            </ul>
          </Col>

          {/* 4) Tin cậy & Thanh toán */}
          <Col xs={24} md={12} lg={6}>
            <Title level={4} style={{ color: '#0f172a', marginTop: 0 }}>Tin cậy & Thanh toán</Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text>Đánh giá: ⭐ 4.8/5 (320+ đánh giá Google)</Text>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <img src="/pay/napas.svg" alt="Napas" height="20" />
                <img src="/pay/visa.svg" alt="Visa" height="20" />
                <img src="/pay/mastercard.svg" alt="Mastercard" height="20" />
                <img src="/pay/vnpay.svg" alt="VNPay QR" height="20" />
                <img src="/pay/vietqr.svg" alt="VietQR" height="20" />
                <img src="/pay/momo.svg" alt="Momo" height="20" />
                <img src="/pay/zalopay.svg" alt="ZaloPay" height="20" />
              </div>
              <Text className="legal">Chủ sở hữu: Nguyễn Văn A • Hộ KD số 41A802xxx, cấp ngày 15/08/2024 tại UBND TP…<br/>MST: 0xxx xxx xxx • Kết nối an toàn SSL</Text>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(2,6,23,0.08)', margin: '24px 0' }} />

        {/* Bottom bar */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Space size={8} wrap aria-label="Ngôn ngữ & Tiền tệ">
              <Button size="small" type="primary" ghost aria-pressed>VI</Button>
              <Button size="small" type="text">EN</Button>
              <Select size="small" defaultValue="VND" options={[{ value: 'VND', label: 'VND' }, { value: 'USD', label: 'USD' }]} style={{ width: 100 }} />
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Text style={{ color: '#334155' }}>© {currentYear} Khách sạn An Yên. All rights reserved.</Text>
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <a href="/dieu-khoan" style={{ color: '#1d4ed8' }}>Điều khoản</a>
            <a href="/bao-mat" style={{ color: '#1d4ed8' }}>Bảo mật</a>
            <a href="/cookie" style={{ color: '#1d4ed8' }}>Cookie</a>
          </Col>
        </Row>
      </div>
    </AntFooter>
  )
}

export default AppFooter



