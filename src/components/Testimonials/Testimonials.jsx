import React from 'react'
import { Carousel, Card, Rate, Typography, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import './Testimonials.css'

const { Text, Paragraph, Title } = Typography

const defaultReviews = [
  { id: 1, name: 'Nguyễn Văn A', rating: 5, comment: 'Dịch vụ tuyệt vời, nhân viên thân thiện và chu đáo. Phòng sạch sẽ và tiện nghi.' },
  { id: 2, name: 'Trần Thị B', rating: 4, comment: 'Vị trí thuận tiện, bữa sáng ngon. Sẽ quay lại trong lần sau!' },
  { id: 3, name: 'Lê Minh C', rating: 5, comment: 'Trải nghiệm tuyệt vời, đặt phòng nhanh chóng, thủ tục nhận phòng rất nhanh.' },
  { id: 4, name: 'Phạm Thu D', rating: 5, comment: 'Không gian yên tĩnh, giường êm ái. Rất hài lòng với kỳ nghỉ.' },
  { id: 5, name: 'Phạm Thu D', rating: 5, comment: 'Không gian yên tĩnh, giường êm ái. Rất hài lòng với kỳ nghỉ.' },
  { id: 6, name: 'Phạm Thu D', rating: 5, comment: 'Không gian yên tĩnh, giường êm ái. Rất hài lòng với kỳ nghỉ.' }
]

function Testimonials({ reviews = defaultReviews }) {
  const settings = {
    autoplay: true,
    dots: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  }

  return (
    <div className="testimonials-section">
      <div className="testimonials-header">
        <Title level={2} className="testimonials-title">Khách hàng nói gì về chúng tôi</Title>
      </div>

      <Carousel {...settings} className="testimonials-carousel">
        {reviews.map((item) => (
          <div key={item.id} className="testimonials-slide">
            <Card className="testimonial-card">
              <div className="testimonial-card-header">
                <Avatar size={48} icon={<UserOutlined />} />
                <div className="testimonial-user">
                  <Text strong className="testimonial-name">{item.name}</Text>
                  <Rate disabled value={item.rating} allowHalf={false} className="testimonial-rate" />
                </div>
              </div>
              <Paragraph className="testimonial-comment">“{item.comment}”</Paragraph>
            </Card>
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default Testimonials


