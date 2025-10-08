import React, { useState } from 'react'
import './Hotels.css'
import { 
  Row, 
  Col, 
  Breadcrumb, 
  Select, 
  Card, 
  Slider, 
  Switch, 
  Button, 
  Tag,
  Space,
  Typography,
  Divider
} from 'antd'
import { 
  HomeOutlined, 
  FilterOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined,
  UserOutlined,
  StarOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

// Dữ liệu mẫu cho danh sách phòng
const mockRooms = [
  {
    id: 1,
    name: 'Phòng Deluxe Standard',
    type: 'Deluxe',
    price: 1500000,
    image: '🏨',
    capacity: 2,
    allowChildren: true,
    allowPets: false,
    description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi',
    rating: 4.5
  },
  {
    id: 2,
    name: 'Phòng Suite Royal',
    type: 'Suite',
    price: 3500000,
    image: '👑',
    capacity: 4,
    allowChildren: true,
    allowPets: true,
    description: 'Phòng cao cấp với view đẹp',
    rating: 5.0
  },
  {
    id: 3,
    name: 'Phòng Standard Single',
    type: 'Standard',
    price: 800000,
    image: '🛏️',
    capacity: 1,
    allowChildren: false,
    allowPets: false,
    description: 'Phòng đơn giản, tiện nghi',
    rating: 4.0
  },
  {
    id: 4,
    name: 'Phòng Family Suite',
    type: 'Suite',
    price: 4500000,
    image: '👨‍👩‍👧‍👦',
    capacity: 6,
    allowChildren: true,
    allowPets: true,
    description: 'Phòng rộng rãi cho gia đình',
    rating: 4.8
  },
  {
    id: 5,
    name: 'Phòng Deluxe Twin',
    type: 'Deluxe',
    price: 2000000,
    image: '🛏️🛏️',
    capacity: 2,
    allowChildren: true,
    allowPets: false,
    description: 'Phòng 2 giường đơn cao cấp',
    rating: 4.6
  },
  {
    id: 6,
    name: 'Phòng Standard Double',
    type: 'Standard',
    price: 1200000,
    image: '🏨',
    capacity: 2,
    allowChildren: true,
    allowPets: false,
    description: 'Phòng đôi tiêu chuẩn',
    rating: 4.2
  }
]

function Hotels() {
  const [sortBy, setSortBy] = useState('default')
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [allowChildren, setAllowChildren] = useState(false)
  const [allowPets, setAllowPets] = useState(false)
  const [filteredRooms, setFilteredRooms] = useState(mockRooms)

  // Hàm lọc và sắp xếp phòng
  const applyFilters = () => {
    let rooms = [...mockRooms]
    
    // Lọc theo giá
    rooms = rooms.filter(room => room.price >= priceRange[0] && room.price <= priceRange[1])
    
    // Lọc theo loại phòng
    if (selectedRoomType !== 'all') {
      rooms = rooms.filter(room => room.type === selectedRoomType)
    }
    
    // Lọc theo trẻ em
    if (allowChildren) {
      rooms = rooms.filter(room => room.allowChildren)
    }
    
    // Lọc theo thú cưng
    if (allowPets) {
      rooms = rooms.filter(room => room.allowPets)
    }
    
    // Sắp xếp
    switch(sortBy) {
      case 'price-asc':
        rooms.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        rooms.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        rooms.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        rooms.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }
    
    setFilteredRooms(rooms)
  }

  // Áp dụng filter mỗi khi có thay đổi
  React.useEffect(() => {
    applyFilters()
  }, [sortBy, priceRange, selectedRoomType, allowChildren, allowPets])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div className="hotels-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Danh sách phòng</Breadcrumb.Item>
        </Breadcrumb>

        {/* Page Title */}
        <Title level={2} className="page-title">
          Danh sách phòng khách sạn
        </Title>

        {/* Main Layout */}
        <Row gutter={[24, 24]}>
          {/* Bên phải - Filter (8 col ~ 4 phần) */}
          <Col xs={24} lg={8}>
            <Card className="filter-card" title={
              <Space>
                <FilterOutlined style={{ color: '#c08a19' }} />
                <span>Bộ lọc tìm kiếm</span>
              </Space>
            }>
              {/* Lọc theo giá */}
              <div className="filter-section">
                <Text strong className="filter-label">Khoảng giá</Text>
                <Slider
                  range
                  min={0}
                  max={5000000}
                  step={100000}
                  value={priceRange}
                  onChange={setPriceRange}
                  tooltip={{
                    formatter: (value) => formatPrice(value)
                  }}
                />
                <div className="price-range-display">
                  <Text>{formatPrice(priceRange[0])}</Text>
                  <Text>{formatPrice(priceRange[1])}</Text>
                </div>
              </div>

              <Divider />

              {/* Lọc theo loại phòng */}
              <div className="filter-section">
                <Text strong className="filter-label">Loại phòng</Text>
                <Select
                  value={selectedRoomType}
                  onChange={setSelectedRoomType}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="Standard">Standard</Option>
                  <Option value="Deluxe">Deluxe</Option>
                  <Option value="Suite">Suite</Option>
                </Select>
              </div>

              <Divider />

              {/* Cho phép trẻ em */}
              <div className="filter-section">
                <Space>
                  <Switch checked={allowChildren} onChange={setAllowChildren} />
                  <Text strong>Cho phép trẻ em</Text>
                </Space>
              </div>

              <Divider />

              {/* Cho phép thú cưng */}
              <div className="filter-section">
                <Space>
                  <Switch checked={allowPets} onChange={setAllowPets} />
                  <Text strong>Cho phép thú cưng</Text>
                </Space>
              </div>

              <Divider />

              {/* Nút reset */}
              <Button 
                block 
                size="large"
                onClick={() => {
                  setSortBy('default')
                  setPriceRange([0, 5000000])
                  setSelectedRoomType('all')
                  setAllowChildren(false)
                  setAllowPets(false)
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </Card>
          </Col>
          {/* Bên trái - Danh sách phòng (16 col ~ 6 phần) */}
          <Col xs={24} lg={16}>
            {/* Sort Section */}
            <Card className="sort-card">
              <Space align="center" size="middle">
                <SortAscendingOutlined style={{ fontSize: '20px', color: '#c08a19' }} />
                <Text strong>Sắp xếp theo:</Text>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 200 }}
                  size="large"
                >
                  <Option value="default">Mặc định</Option>
                  <Option value="price-asc">Giá tăng dần</Option>
                  <Option value="price-desc">Giá giảm dần</Option>
                  <Option value="name-asc">Tên A → Z</Option>
                  <Option value="name-desc">Tên Z → A</Option>
                </Select>
                <Text type="secondary">({filteredRooms.length} phòng)</Text>
              </Space>
            </Card>

            {/* Room List */}
            <div className="rooms-list">
              {filteredRooms.map(room => (
                <Card key={room.id} className="room-card" hoverable>
                  <Row gutter={16}>
                    <Col xs={24} sm={8} md={6}>
                      <div className="room-image">
                        <img alt={room.image} src={room.image} />
                      </div>
                    </Col>
                    <Col xs={24} sm={16} md={18}>
                      <div className="room-info">
                        <Title level={4} className="room-name">{room.name}</Title>
                        <Space size="small" wrap>
                          <Tag color="blue">{room.type}</Tag>
                          <Tag icon={<UserOutlined />}>{room.capacity} người</Tag>
                          {room.allowChildren && <Tag color="green">Cho phép trẻ em</Tag>}
                          {room.allowPets && <Tag color="orange">Cho phép thú cưng</Tag>}
                        </Space>
                        <Text className="room-description">{room.description}</Text>
                        <div className="room-footer">
                          <div className="room-rating">
                            <StarOutlined style={{ color: '#faad14' }} />
                            <Text strong>{room.rating}</Text>
                          </div>
                          <div className="room-price-action">
                            <div className="room-price">
                              <Text type="secondary" style={{ fontSize: '12px' }}>Từ</Text>
                              <Text strong style={{ color: '#c08a19', fontSize: '20px' }}>
                                {formatPrice(room.price)}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>/đêm</Text>
                            </div>
                            <Button type="primary" size="large" className="book-btn">
                              Đặt phòng
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </Col>

        
        </Row>
      </div>
    </div>
  )
}

export default Hotels

