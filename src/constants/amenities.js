// Danh sách tiện nghi của khách sạn
// Có thể quản lý thêm/sửa/xóa amenities tại đây
export const AMENITIES_OPTIONS = [
  'WiFi miễn phí',
  'Điều hòa',
  'Tivi',
  'Tủ lạnh',
  'Nước nóng',
  'Ban công',
  'Bồn tắm',
  'Máy sấy tóc',
  'Két sắt',
  'Minibar',
  'Bàn làm việc',
  'Sofa',
  'Tầm nhìn biển',
  'Tầm nhìn thành phố',
  'Không hút thuốc'
]

// Lưu amenities vào localStorage
export const saveAmenitiesToLocal = (amenities) => {
  localStorage.setItem('amenities', JSON.stringify(amenities))
}

// Lấy amenities từ localStorage
export const getAmenitiesFromLocal = () => {
  const stored = localStorage.getItem('amenities')
  if (stored) {
    return JSON.parse(stored)
  }
  return AMENITIES_OPTIONS
}

// Thêm amenities mới
export const addAmenity = (amenity) => {
  const currentAmenities = getAmenitiesFromLocal()
  if (!currentAmenities.includes(amenity)) {
    const updated = [...currentAmenities, amenity]
    saveAmenitiesToLocal(updated)
    return updated
  }
  return currentAmenities
}

// Xóa amenities
export const removeAmenity = (amenity) => {
  const currentAmenities = getAmenitiesFromLocal()
  const updated = currentAmenities.filter(a => a !== amenity)
  saveAmenitiesToLocal(updated)
  return updated
}

