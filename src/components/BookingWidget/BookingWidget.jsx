import React, { useState } from 'react'
import { 
  DatePicker, Button, Popover, 
  Form, message, Space
} from 'antd'
import { 
  CalendarOutlined, UserOutlined,
  RightOutlined
} from '@ant-design/icons'
import './BookingWidget.css'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { searchAvailableRooms } from '../../services/booking.service'

const BookingWidget = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [guestVisible, setGuestVisible] = useState(false)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)

  const handleSearch = async (values) => {
    try {
      setLoading(true)
      
      // Validate dates
      if (!values.checkIn || !values.checkOut) {
        message.error('Vui lòng chọn ngày nhận và trả phòng!')
        return
      }

      const checkIn = values.checkIn.format('YYYY-MM-DD')
      const checkOut = values.checkOut.format('YYYY-MM-DD')
      
      // Check if checkout is after checkin
      if (values.checkIn.isAfter(values.checkOut) || 
          values.checkIn.isSame(values.checkOut)) {
        message.error('Ngày trả phòng phải sau ngày nhận phòng!')
        return
      }

      // Call API to search available rooms
      const guests = (adults || 1) + (children || 0)
      const searchParams = {
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
        sort: 'price_asc',
        page: 1,
        limit: 50
      }

      try {
        const response = await searchAvailableRooms(searchParams)
        const availableRooms = response?.rooms || []
        
        if (availableRooms.length === 0) {
          message.warning('Không tìm thấy phòng trống trong khoảng thời gian này!')
          return
        }

        message.success(`Tìm thấy ${availableRooms.length} phòng khả dụng`)
      } catch (error) {
        console.error('Error searching rooms:', error)
        message.warning('Không thể kiểm tra phòng trống. Đang chuyển hướng...')
      }

      // Navigate to hotels page with search parameters in URL
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        adults: adults || 1,
        children: children || 0,
        rooms: rooms || 1
      })
      
      navigate(`/hotels?${params.toString()}`)
    } catch (error) {
      console.error('Error searching:', error)
      message.error('Có lỗi xảy ra khi tìm kiếm!')
    } finally {
      setLoading(false)
    }
  }

  // Disable dates before today
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day')
  }

  const guestContent = (
    <div className="guest-popover">
      <div className="guest-item">
        <span>Người lớn</span>
        <Space>
          <Button size="small" onClick={() => adults > 1 && setAdults(adults - 1)}>-</Button>
          <span>{adults}</span>
          <Button size="small" onClick={() => setAdults(adults + 1)}>+</Button>
        </Space>
      </div>
      <div className="guest-item">
        <span>Trẻ em</span>
        <Space>
          <Button size="small" onClick={() => children > 0 && setChildren(children - 1)}>-</Button>
          <span>{children}</span>
          <Button size="small" onClick={() => setChildren(children + 1)}>+</Button>
        </Space>
      </div>
      <div className="guest-item">
        <span>Phòng</span>
        <Space>
          <Button size="small" onClick={() => rooms > 1 && setRooms(rooms - 1)}>-</Button>
          <span>{rooms}</span>
          <Button size="small" onClick={() => setRooms(rooms + 1)}>+</Button>
        </Space>
      </div>
      <Button type="primary" block onClick={() => setGuestVisible(false)}>
        Xác nhận
      </Button>
    </div>
  )

  const guestText = `${adults} Người lớn | ${children} Trẻ em | ${rooms} Phòng`

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
            {/* Check-in Date */}
            <div className="widget-field">
              <CalendarOutlined className="widget-icon" />
              <Form.Item
                name="checkIn"
                className="widget-form-item"
              >
                <DatePicker
                  className="widget-date-picker"
                  placeholder="Ngày đặt"
                  format="DD/MM/YYYY"
                  disabledDate={disabledDate}
                  suffixIcon={null}
                />
              </Form.Item>
            </div>

            {/* Separator */}
            <div className="widget-separator">
              <div className="separator-line"></div>
              <div className="separator-arrow">↔</div>
            </div>

            {/* Check-out Date */}
            <div className="widget-field">
              <CalendarOutlined className="widget-icon" />
              <Form.Item
                name="checkOut"
                className="widget-form-item"
              >
                <DatePicker
                  className="widget-date-picker"
                  placeholder="Ngày trả"
                  format="DD/MM/YYYY"
                  disabledDate={disabledDate}
                  suffixIcon={null}
                />
              </Form.Item>
            </div>

            {/* Separator */}
            <div className="widget-separator">
              <div className="separator-line"></div>
            </div>

            {/* Guest and Room Selector */}
            <Popover
              content={guestContent}
              title="Chọn số khách và phòng"
              trigger="click"
              open={guestVisible}
              onOpenChange={setGuestVisible}
              placement="bottomLeft"
              className="guest-popover-wrapper"
            >
              <div className="widget-field">
                <UserOutlined className="widget-icon" />
                <div className="guest-selector">
                  <span>{guestText}</span>
                  <RightOutlined className="selector-arrow" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>
            </Popover>

            {/* Submit Button */}
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
        </Form>
      </div>
    </div>
  )
}

export default BookingWidget

