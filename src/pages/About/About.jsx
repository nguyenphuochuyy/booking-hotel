import React from 'react'
import "./About.css"
import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

function About() {
  return (
    <div className='about-page'>
      <div className="container">
   {/* phần breakcrumb */}
   <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Danh sách phòng</Breadcrumb.Item>
      </Breadcrumb>
      <h1>về chúng tôi</h1>
      <p>Là khách sạn 5 sao đẳng cấp quốc tế, tọa lạc tại giao điểm của bốn quận chính, nơi được xem như trái tim và trung tâm của TP. Hồ Chí Minh.</p>
      <div className='about-image'>
        <img src="https://bizweb.dktcdn.net/100/423/358/files/alper-gio-thieu.jpg?v=1623225626615" alt="About Image" />
      </div>
      <p>Với hệ thống phòng tiêu chuẩn và phòng hạng sang thiết kế đẹp mắt và trang nhã được chú trọng tới từng chi tiết sẽ đem lại sự tiện nghi và thoải mái tối đa cho quý khách dù là thời gian nghỉ ngơi thư giãn hay trong chuyến công tác. </p>
      <p>Bean Hotel tích hợp đầy đủ tất cả các dịch vụ cho Quý khách có một chuyến công tác hoặc kỳ nghỉ thật sự tiện ích như nhà hàng, phòng hội nghị, hồ bơi, dịch vụ đón tiễn sân bay, các tour du lịch, chơi golf, vé máy bay với chất lượng tốt nhất do những nhân viên chuyên nghiệp của khách sạn đảm nhiệm . Đảm bảo tuyệt đối chất lượng dịch vụ do khách sạn cung cấp là cam kết hàng đầu của chúng tôi. Điều này góp phần tạo nên sự khác biệt của hệ thống Khách sạn Bean Hotel.</p>
      <p>Cùng với đội ngũ nhân viên được tuyển chọn và đào tạo chuyên nghiệp, chu đáo và thân thiện, Bean Hotel hứa hẹn sẽ mang đến cho Quý khách sự thoải mái và hài lòng nhất.
        Đến với Bean Hotel là đến với sư tinh tế nhất về chất lượng, dịch vụ và sự thân thiện như chính ngôi nhà của bạn.</p>
      <b>HÃY ĐẾN BEAN HOTEL ĐỂ TRẢI NGHIỆM SỰ KHÁC BIỆT!</b>
      </div>
   
    </div>
  )
}

export default About

