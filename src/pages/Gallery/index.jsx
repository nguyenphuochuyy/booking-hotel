import React, { useState } from 'react'
import { Image, Typography, Tabs, Empty, Breadcrumb } from 'antd'
import { AppstoreOutlined, HomeOutlined, CoffeeOutlined, StarOutlined } from '@ant-design/icons'
import './gallery.css'

// Import ảnh (Giữ nguyên import của bạn)
import banner1 from '../../assets/images/banner1.webp'
import banner2 from '../../assets/images/banner2.webp'
import banner3 from '../../assets/images/banner3.webp'
import banner4 from '../../assets/images/banner4.webp'
import mainBanner from '../../assets/images/main-banner.webp'
import luxyryRoom from '../../assets/images/luxyryRoom.webp'
// import about1 from '../../assets/images/about1.webp'

const { Title, Paragraph } = Typography

// Thêm category cho ảnh để làm bộ lọc
const allImages = [
  { src: mainBanner, title: 'Đại sảnh sang trọng', category: 'lobby' },
  { src: luxyryRoom, title: 'Phòng Suite Hạng Sang', category: 'room' },
  { src: banner1, title: 'Không gian thư giãn', category: 'relax' },
  { src: banner2, title: 'Lối vào chính', category: 'exterior' },
  { src: banner3, title: 'Khu vực chờ', category: 'lobby' },
  { src: banner4, title: 'Quầy lễ tân 24/7', category: 'lobby' },
  // Bạn có thể thêm ảnh duplicate để test giao diện Masonry
  { src: banner1, title: 'Góc nhìn từ ban công', category: 'exterior' }, 
]

function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  // Lọc ảnh theo danh mục
  const filteredImages = activeCategory === 'all' 
    ? allImages 
    : allImages.filter(img => img.category === activeCategory)

  // Danh sách Tabs
  const items = [
    { key: 'all', label: <span><AppstoreOutlined /> Tất cả</span> },
    { key: 'lobby', label: <span><StarOutlined /> Sảnh & Tiện ích</span> },
    { key: 'room', label: <span><HomeOutlined /> Phòng nghỉ</span> },
    { key: 'exterior', label: <span><CoffeeOutlined /> Ngoại cảnh</span> },
  ]

  return (
    <div className="gallery-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Thư viện ảnh</Breadcrumb.Item>
        </Breadcrumb>
        
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">THƯ VIỆN ẢNH</h1>
          <Paragraph className="page-description">
            Chiêm ngưỡng vẻ đẹp kiến trúc và không gian nghỉ dưỡng đẳng cấp tại Bean Hotel qua từng khung hình.
          </Paragraph>
        </div>

        {/* Tabs Filter - Điểm nhấn UX */}
        <div className="gallery-filter">
          <Tabs 
            defaultActiveKey="all" 
            centered 
            items={items} 
            onChange={setActiveCategory}
            className="custom-tabs"
          />
        </div>

        {/* Gallery Grid - Masonry Style */}
        {filteredImages.length > 0 ? (
          <Image.PreviewGroup>
            <div className="masonry-grid">
              {filteredImages.map((img, idx) => (
                <div className="masonry-item" key={idx}>
                  <div className="image-wrapper">
                    <Image 
                      src={img.src} 
                      alt={img.title} 
                      className="masonry-image"
                      preview={{ mask: 'Xem phóng to' }} // Text khi hover vào để xem
                    />
                    <div className="image-overlay">
                      <span className="overlay-text">{img.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        ) : (
          <Empty description="Chưa có hình ảnh cho mục này" style={{ padding: 50 }} />
        )}
      </div>
    </div>
  )
}

export default GalleryPage