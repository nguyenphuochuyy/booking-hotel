const ROOM_CATEGORY_STORAGE_KEY = 'room_categories'

export const DEFAULT_ROOM_CATEGORIES = [
  'Standard',
  'Deluxe ',
  'Superior',
  'Suite',
]

export const saveRoomCategoriesToLocal = (categories) => {
  try {
    localStorage.setItem(ROOM_CATEGORY_STORAGE_KEY, JSON.stringify(categories))
  } catch (error) {
    console.error('Không thể lưu danh mục phòng vào localStorage:', error)
  }
}

export const getRoomCategoriesFromLocal = () => {
  try {
    const stored = localStorage.getItem(ROOM_CATEGORY_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string' && item.trim().length > 0)
      }
    }
  } catch (error) {
    console.warn('Không thể đọc danh mục phòng từ localStorage:', error)
  }
  return DEFAULT_ROOM_CATEGORIES
}

export const addRoomCategory = (label) => {
  const name = (label || '').trim()
  if (!name) return getRoomCategoriesFromLocal()

  const current = getRoomCategoriesFromLocal()
  const exists = current.some(item => item.toLowerCase() === name.toLowerCase())
  if (exists) return current

  const updated = [...current, name]
  saveRoomCategoriesToLocal(updated)
  return updated
}

export const removeRoomCategory = (label) => {
  const current = getRoomCategoriesFromLocal()
  const updated = current.filter(item => item !== label)
  saveRoomCategoriesToLocal(updated)
  return updated
}

export const mergeRoomCategories = (categories = []) => {
  const current = getRoomCategoriesFromLocal()
  const categorySet = new Set(current)

  categories.forEach(cat => {
    if (!cat) return
    const name = String(cat).trim()
    if (name) {
      categorySet.add(name)
    }
  })

  const merged = Array.from(categorySet)
  saveRoomCategoriesToLocal(merged)
  return merged
}

