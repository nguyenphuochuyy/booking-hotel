import React from 'react'
import { Row, Col, Typography, Button, Card } from 'antd'
import './HomeNews.css'

const { Title, Paragraph, Text } = Typography

const HomeNews = () => {
  const newsData = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: '10 xu hướng thịnh hành trong ngành khách sạn 2022',
      description: 'Không gian ngoài trời mở rộng hơn, nâng cấp công nghệ để hạn chế tối đa tiếp xúc là những xu hướng mới nhiều khách...',
      author: 'Bean Hotel',
      date: '06/12/2022'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Những điều kiêng kị khi ở khách sạn mà bạn nên biết',
      description: 'Để không gặp nhiều phiền toái và giữ an toàn cho chính bản thân trong mỗi chuyến đi, bạn nên cẩn thận tìm hiểu một...',
      author: 'Bean Hotel',
      date: '06/12/2022'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Ý nghĩa việc khách sạn để chocolate lên gối khi dọn phòng',
      description: 'Các quản lý khách sạn phát hiện ra dịch vụ này nhận được nhiều lời khen từ khách thuê phòng hơn bất kỳ hoạt động...',
      author: 'Bean Hotel',
      date: '06/12/2022'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Ý nghĩa việc khách sạn để chocolate lên gối khi dọn phòng',
      description: 'Các quản lý khách sạn phát hiện ra dịch vụ này nhận được nhiều lời khen từ khách thuê phòng hơn bất kỳ hoạt động...',
      author: 'Bean Hotel',
      date: '06/12/2022'
    }
  ]

  return (
    <div className="home-news">
      <div className="home-news-container">
        <div className="home-news-header">
          <Title level={2} className="home-news-title">
            HIỂU BIẾT KHÁCH SẠN
          </Title>
        </div>
        
        <Row gutter={[24, 24]} className="home-news-grid">
          {newsData.map((news) => (
            <Col 
              key={news.id}
              xs={24} 
              sm={12} 
              md={8} 
              lg={8} 
              xl={8}
              className="home-news-col"
            >
              <Card 
                className="home-news-card"
                cover={
                  <div className="home-news-image-container">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="home-news-image"
                    />
                  </div>
                }
                bordered={false}
              >
                <div className="home-news-content">
                  <Title level={4} className="home-news-card-title">
                    {news.title}
                  </Title>
                  
                  <Paragraph className="home-news-description">
                    {news.description}
                  </Paragraph>
                  
                  <div className="home-news-footer">
                    <div className="home-news-meta">
                      <Text className="home-news-author">By {news.author}</Text>
                      <Text className="home-news-date">{news.date}</Text>
                    </div>
                    
                    <Button 
                      className="home-news-button"
                      type="primary"
                    >
                      Đọc Thêm
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default HomeNews
