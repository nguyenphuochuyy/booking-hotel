import React, { useState, useEffect, useMemo } from 'react'
import { DatePicker, Button, Popover, Form, message, Space } from 'antd'
import { 
  CalendarOutlined, UserOutlined,
  RightOutlined
} from '@ant-design/icons'
import './BookingWidget.css'
import dayjs from 'dayjs'
import { useNavigate, useLocation } from 'react-router-dom'

const { RangePicker } = DatePicker

const GuestSelector = ({ adults, rooms, setAdults, setRooms, onClose }) => {
  // Đảm bảo giá trị là number trước khi tính toán
  const currentAdults = Number(adults) || 1
  const currentRooms = Number(rooms) || 1

  return (
    <div className="guest-popover">
      <div className="guest-item">
        <span>Người lớn</span>
        <Space>
          <Button size="small" onClick={() => currentAdults > 1 && setAdults(currentAdults - 1)}>-</Button>
          <span>{currentAdults}</span>
          <Button size="small" onClick={() => setAdults(currentAdults + 1)}>+</Button>
        </Space>
      </div>
      <div className="guest-item">
        <span>Phòng</span>
        <Space>
          <Button size="small" onClick={() => currentRooms > 1 && setRooms(currentRooms - 1)}>-</Button>
          <span>{currentRooms}</span>
          <Button size="small" onClick={() => setRooms(currentRooms + 1)}>+</Button>
        </Space>
      </div>
      <Button type="primary" block onClick={onClose}>
        Xác nhận
      </Button>
    </div>
  )
}

const BookingWidget = ({ checkIn: propCheckIn, checkOut: propCheckOut, adults: propAdults, rooms: propRooms }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [guestVisible, setGuestVisible] = useState(false)
  
  // Lấy params từ URL nếu có
  const searchParams = new URLSearchParams(location.search)
  const urlCheckIn = searchParams.get('checkIn')
  const urlCheckOut = searchParams.get('checkOut')
  const urlAdults = searchParams.get('adults')
  // const urlChildren = searchParams.get('children')
  const urlRooms = searchParams.get('rooms')
  
  // Ưu tiên props, sau đó URL params, cuối cùng là default
  // Đảm bảo luôn là number
  const [adults, setAdults] = useState(() => {
    const value = propAdults || (urlAdults ? parseInt(urlAdults, 10) : 1)
    return Number(value) || 1
  })
  const [rooms, setRooms] = useState(() => {
    const value = propRooms || (urlRooms ? parseInt(urlRooms, 10) : 1)
    return Number(value) || 1
  })
  
  // Đồng bộ state với URL params khi URL thay đổi
  useEffect(() => {
    if (urlAdults && !propAdults) {
      const value = parseInt(urlAdults, 10)
      setAdults(Number(value) || 1)
    }
    if (urlRooms && !propRooms) {
      const value = parseInt(urlRooms, 10)
      setRooms(Number(value) || 1)
    }
  }, [urlAdults, urlRooms, propAdults, propRooms])
  
  const initialRange = useMemo(() => {
    const initialCheckIn = propCheckIn || urlCheckIn
    const initialCheckOut = propCheckOut || urlCheckOut
    const now = dayjs()
    const cutoff = now.hour(14).minute(0).second(0).millisecond(0)
    const earliestCheckIn = now.isAfter(cutoff) ? now.add(1, 'day').startOf('day') : now.startOf('day')

    let checkInValue = initialCheckIn ? dayjs(initialCheckIn) : earliestCheckIn
    let checkOutValue = initialCheckOut ? dayjs(initialCheckOut) : checkInValue.add(1, 'day')

    if (checkInValue.isBefore(earliestCheckIn, 'day')) {
      checkInValue = earliestCheckIn
    }
    if (!checkOutValue.isAfter(checkInValue, 'day')) {
      checkOutValue = checkInValue.add(1, 'day')
    }

    return [checkInValue, checkOutValue]
  }, [propCheckIn, propCheckOut, urlCheckIn, urlCheckOut])

  useEffect(() => {
    form.setFieldsValue({
      dateRange: initialRange
    })
  }, [initialRange, form])

  const handleSearch = async (values) => {
    try {
      setLoading(true)
      // Validate dates
      if (!values?.dateRange || values.dateRange.length !== 2) {
        message.error('Vui lòng chọn ngày nhận và trả phòng!')
        return
      }

      const [checkInValue, checkOutValue] = values.dateRange
      const checkIn = checkInValue.format('YYYY-MM-DD')
      const checkOut = checkOutValue.format('YYYY-MM-DD')
      
      // Navigate to hotels page with search parameters in URL
      // Đảm bảo giá trị là number trước khi convert sang string
      const adultsNum = Number(adults) || 1
      const roomsNum = Number(rooms) || 1
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        adults: adultsNum.toString(),
        children: '0', // Không có children trong widget này
        rooms: roomsNum.toString()
      })
      
      // Nếu đang ở trang hotels, chỉ cập nhật URL params
      if (location.pathname === '/hotels') {
        navigate(`/hotels?${params.toString()}`, { replace: true })
      } else {
        // Nếu đang ở trang khác (trang chủ), navigate sang hotels
        navigate(`/hotels?${params.toString()}`)
      }
    } catch (error) {
      console.error('Error searching:', error)
      message.error('Có lỗi xảy ra khi tìm kiếm!')
    } finally {
      setLoading(false)
    }
  }

  // Disable dates trước mốc nhận phòng sớm nhất (sau 14:00 thì là ngày mai)
  const disabledDate = (current) => {
    const now = dayjs()
    const cutoff = now.hour(14).minute(0).second(0).millisecond(0)
    const earliestCheckIn = now.isAfter(cutoff) ? now.add(1, 'day').startOf('day') : now.startOf('day')
    return current && current < earliestCheckIn
  }

  // Đảm bảo hiển thị đúng số
  const adultsNum = Number(adults) || 1
  const roomsNum = Number(rooms) || 1
  const guestText = `${adultsNum} Người lớn | ${roomsNum} Phòng`

  return (
    <div className="booking-widget">
      <div className="booking-widget-card">
        <Form
          form={form}
          onFinish={handleSearch}
          initialValues={{
            guests: { adults: 1, children: 0, rooms: 1 }
          }}
        >
          <div className="widget-content-inline">
            {/* Range Picker */}
            <div className="widget-field widget-range-field">
              <Form.Item
                name="dateRange"
                className="widget-form-item"
              >
                <RangePicker
                  className="widget-range-picker"
                  format="DD/MM/YYYY"
                  disabledDate={disabledDate}
                  separator={<span className="range-separator">↔</span>}
                  allowClear={false}
                  popupClassName="widget-range-popup"
                />
              </Form.Item>
            </div>

            {/* Guest and Room Selector */}
            <Popover
              content={
                <GuestSelector
                  adults={adults}
                  rooms={rooms}
                  setAdults={setAdults}
                  setRooms={setRooms}
                  onClose={() => setGuestVisible(false)}
                />
              }
              title="Chọn số khách và phòng"
              trigger="click"
              open={guestVisible}
              onOpenChange={setGuestVisible}
              placement="bottomLeft"
              className="guest-popover-wrapper"
            >
              <div className="widget-field guest-field">
                <div className="guest-selector">
                  <span>{guestText}</span>
                  <RightOutlined className="selector-arrow" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>
            </Popover>

            {/* Submit Button */}
            <div className="widget-submit-wrapper">
              <Button
                type="primary"
                htmlType="submit"
                className="widget-submit-button"
                loading={loading}
              >
                <span>GIỮ CHỖ NGAY</span>
                <RightOutlined className="button-arrow" />
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default BookingWidget

