import React from 'react'
import { Carousel, Typography, Image } from 'antd'
import './Moments.css'
import banner1 from "../../assets/images/banner/banner1.webp"
import banner2 from '../../assets/images/banner/banner2.webp'
import banner3 from '../../assets/images/banner/banner3.webp'
import banner4 from '../../assets/images/banner/banner4.webp'

const { Title, Text } = Typography

const defaultImages = [
  { id: 1, src: banner1, alt: 'Khoảnh khắc 1' },
  { id: 2, src: banner2, alt: 'Khoảnh khắc 2' },
  { id: 3, src: banner3, alt: 'Khoảnh khắc 3' },
  { id: 4, src: banner4, alt: 'Khoảnh khắc 4' },
  { id: 6, src: 'https://phuchoa.com.vn/wp-content/uploads/2021/05/khu-be-boi-khach-san-hilton.jpg', alt: 'Khoảnh khắc 5' },
]

function Moments({ images = defaultImages }) {
  const settings = {
    autoplay: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,  
    draggable: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  }

  return (
    <div className="moments-section">
      <div className="moments-header">
        <Title level={2} className="moments-title">Khoảnh khắc thú vị với Bean Hotel</Title>
        <Text type="secondary">Những hình ảnh được khách hàng chia sẻ</Text>
      </div>

      <Image.PreviewGroup>
        <Carousel {...settings} className="moments-carousel">
          {images.map((item) => (
            <div key={item.id} className="moments-slide">
              <div className="moments-image-wrapper">
                <Image
                  src={item.src}
                  alt={item.alt}
                  className="moments-image"
                />
              </div>
            </div>
          ))}
        </Carousel>
      </Image.PreviewGroup>
    </div>
  )
}

export default Moments


