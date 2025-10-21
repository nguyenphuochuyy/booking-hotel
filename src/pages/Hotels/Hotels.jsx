import React, { useState, useEffect, useMemo } from 'react'
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
  Divider,
  Spin,
  Empty,
  Input
} from 'antd'
import { 
  HomeOutlined, 
  FilterOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined,
  UserOutlined,
  StarOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { useRoomTypes } from '../../hooks/roomtype'
import { useNavigate } from 'react-router-dom'
import formatPrice from '../../utils/formatPrice'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

function Hotels() {
  const navigate = useNavigate()
  const { roomTypes, loading, error, search, setSearch, category, setCategory } = useRoomTypes({
    limit: 50 // Lấy nhiều room types để hiển thị
  })

  // State cho filters
  const [sortBy, setSortBy] = useState('default')
  const [priceRange, setPriceRange] = useState([0, 10000000]) // Tăng max price
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [allowChildren, setAllowChildren] = useState(false)
  const [allowPets, setAllowPets] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Lấy danh sách categories từ roomTypes
  const availableCategories = useMemo(() => {
    const categories = [...new Set(roomTypes.map(rt => rt.category).filter(Boolean))]
    return categories
  }, [roomTypes])

  // Lấy min/max price từ roomTypes
  const priceBounds = useMemo(() => {
    const prices = roomTypes
      .map(rt => rt.price_per_night)
      .filter(price => price && price > 0)
    
    if (prices.length === 0) return { min: 0, max: 10000000 }
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }, [roomTypes])

  // Filtered rooms dựa trên các tiêu chí
  const filteredRooms = useMemo(() => {
    let filtered = [...roomTypes]

    // Lọc theo search keyword
    if (searchKeyword) {
      filtered = filtered.filter(room => 
        room.room_type_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    // Lọc theo khoảng giá
    filtered = filtered.filter(room => {
      if (!room.price_per_night) return false
      return room.price_per_night >= priceRange[0] && room.price_per_night <= priceRange[1]
    })

    // Lọc theo loại phòng (category)
    if (selectedRoomType !== 'all') {
      filtered = filtered.filter(room => room.category === selectedRoomType)
    }

    // Lọc theo capacity (trẻ em)
    if (allowChildren) {
      filtered = filtered.filter(room => room.capacity && room.capacity > 1)
    }

    // Lọc theo amenities (thú cưng) - giả sử có amenity "pet-friendly"
    if (allowPets) {
      filtered = filtered.filter(room => 
        room.amenities && 
        Array.isArray(room.amenities) && 
        room.amenities.some(amenity => 
          amenity.toLowerCase().includes('pet') || 
          amenity.toLowerCase().includes('thú cưng')
        )
      )
    }

    // Sắp xếp
    switch(sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.price_per_night || 0) - (b.price_per_night || 0))
        break
      case 'price-desc':
        filtered.sort((a, b) => (b.price_per_night || 0) - (a.price_per_night || 0))
        break
      case 'name-asc':
        filtered.sort((a, b) => (a.room_type_name || '').localeCompare(b.room_type_name || ''))
        break
      case 'name-desc':
        filtered.sort((a, b) => (b.room_type_name || '').localeCompare(a.room_type_name || ''))
        break
      case 'capacity-asc':
        filtered.sort((a, b) => (a.capacity || 0) - (b.capacity || 0))
        break
      case 'capacity-desc':
        filtered.sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
        break
      default:
        break
    }

    return filtered
  }, [roomTypes, searchKeyword, priceRange, selectedRoomType, allowChildren, allowPets, sortBy])

  // Reset price range khi có data mới
  useEffect(() => {
    if (priceBounds.min !== priceBounds.max) {
      setPriceRange([priceBounds.min, priceBounds.max])
    }
  }, [priceBounds])

  const handleSearch = (value) => {
    setSearchKeyword(value)
  }

  const handleRoomTypeChange = (value) => {
    setSelectedRoomType(value)
  }

  const handleBookRoom = (roomTypeId) => {
    navigate(`/rooms/${roomTypeId}`)
  }

  const resetFilters = () => {
    setSortBy('default')
    setPriceRange([priceBounds.min, priceBounds.max])
    setSelectedRoomType('all')
    setAllowChildren(false)
    setAllowPets(false)
    setSearchKeyword('')
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
        <h1 style={{ textAlign: 'center', color: '#000',fontSize: '2rem', fontWeight: '700' , marginBottom: '2rem' }}>
          Danh sách phòng khách sạn
        </h1>

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
              {/* Tìm kiếm */}
              <div className="filter-section">
                <Text strong className="filter-label">Tìm kiếm</Text>
                <Search
                  placeholder="Tìm theo tên phòng..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              <Divider />

              {/* Lọc theo giá */}
              <div className="filter-section">
                <Text strong className="filter-label">Khoảng giá</Text>
                <Slider
                  range
                  min={priceBounds.min}
                  max={priceBounds.max}
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
                  onChange={handleRoomTypeChange}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  {availableCategories.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </div>

              <Divider />

              {/* Cho phép trẻ em */}
              <div className="filter-section">
                <Space>
                  <Switch checked={allowChildren} onChange={setAllowChildren} />
                  <Text strong>Phù hợp cho gia đình (2+ người)</Text>
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
                onClick={resetFilters}
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
                  <Option value="capacity-asc">Sức chứa tăng dần</Option>
                  <Option value="capacity-desc">Sức chứa giảm dần</Option>
                </Select>
                <Text type="secondary">({filteredRooms.length} phòng)</Text>
              </Space>
            </Card>

            {/* Room List */}
            <div className="rooms-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px' }}>
                    <Text>Đang tải danh sách phòng...</Text>
                  </div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Empty
                    description={error}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : filteredRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Empty
                    description="Không tìm thấy phòng nào phù hợp"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                filteredRooms.map(room => (
                  <Card key={room.room_type_id} className="room-card" hoverable>
                    <Row gutter={16}>
                      <Col xs={24} sm={8} md={6}>
                        <div className="room-image">
                          {room.images && room.images.length > 0 ? (
                            <img 
                              alt={room.room_type_name} 
                              src={room.images[0]} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '200px', 
                              background: '#f0f0f0', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#999'
                            }}>
                              Không có hình ảnh
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col xs={24} sm={16} md={18}>
                        <div className="room-info">
                          <Title level={4} className="room-name">{room.room_type_name}</Title>
                          <Space size="small" wrap>
                            <Tag color="blue">{room.category}</Tag>
                            <Tag icon={<UserOutlined />}>{room.capacity} người</Tag>
                            {room.area && <Tag color="green">{room.area}m²</Tag>}
                            {room.amenities && Array.isArray(room.amenities) && room.amenities.some(amenity => 
                              amenity.toLowerCase().includes('pet') || amenity.toLowerCase().includes('thú cưng')
                            ) && <Tag color="orange">Cho phép thú cưng</Tag>}
                          </Space>
                          <Text className="room-description">
                            {room.description || 'Phòng tiện nghi với đầy đủ trang thiết bị hiện đại'}
                          </Text>
                          
                          {/* Amenities */}
                          {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              <Space size={4} wrap>
                                {room.amenities.slice(0, 4).map((amenity, index) => (
                                  <Tag key={index} size="small">{amenity}</Tag>
                                ))}
                                {room.amenities.length > 4 && (
                                  <Tag size="small">+{room.amenities.length - 4} khác</Tag>
                                )}
                              </Space>
                            </div>
                          )}

                          <div className="room-footer">
                            <div className="room-rating">
                              <StarOutlined style={{ color: '#faad14' }} />
                              <Text strong>4.5</Text>
                            </div>
                            <div className="room-price-action">
                              <div className="room-price">
                                <Text type="secondary" style={{ fontSize: '12px' }}>Từ</Text>
                                <Text strong style={{ color: '#c08a19', fontSize: '20px' }}>
                                  {room.price_per_night ? formatPrice(room.price_per_night) : 'Liên hệ'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>/đêm</Text>
                              </div>
                              <Button 
                                type="primary" 
                                size="large" 
                                className="book-btn"
                                onClick={() => handleBookRoom(room.room_type_id)}
                              >
                                Đặt phòng
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Hotels