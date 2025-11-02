// Mock data cho danh sách tin tức để test và demo
export const mockNewsData = [
  {
    post_id: 1,
    user_id: 1,
    category_id: 1,
    title: '10 Xu Hướng Thịnh Hành Trong Ngành Khách Sạn 2024',
    slug: '10-xu-huong-thinh-hanh-trong-nganh-khach-san-2024',
    content: `
      <p>Ngành khách sạn đang có những thay đổi đáng kể sau đại dịch. Không gian ngoài trời mở rộng hơn, nâng cấp công nghệ để hạn chế tối đa tiếp xúc là những xu hướng mới nhiều khách sạn đang áp dụng.</p>
      
      <h2>1. Không gian ngoài trời mở rộng</h2>
      <p>Từ việc tích hợp công nghệ không chạm (touchless) đến việc mở rộng không gian ngoài trời, các khách sạn đang tìm cách tạo ra trải nghiệm an toàn và tiện nghi hơn cho khách hàng.</p>
      
      <h2>2. Công nghệ không chạm</h2>
      <p>Bên cạnh đó, tính bền vững và thân thiện với môi trường cũng là một trong những ưu tiên hàng đầu của các khách sạn hiện đại.</p>
      
      <p>Các khách sạn đang đầu tư vào hệ thống check-in tự động, điều khiển phòng thông qua ứng dụng di động, và các giải pháp thanh toán không tiếp xúc.</p>
      
      <h2>3. Tính bền vững</h2>
      <p>Khách sạn xanh không còn là xu hướng mà đã trở thành tiêu chuẩn mới trong ngành du lịch. Từ việc sử dụng năng lượng tái tạo đến giảm thiểu rác thải nhựa, các khách sạn đang tạo ra giá trị bền vững cho môi trường.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['khách sạn', 'xu hướng', 'công nghệ', '2024', 'bền vững'],
    status: 'published',
    published_at: '2024-01-15T10:00:00.000Z',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 1,
      name: 'Tin tức',
      slug: 'tin-tuc'
    }
  },
  {
    post_id: 2,
    user_id: 1,
    category_id: 2,
    title: 'Những Điều Kiêng Kị Khi Ở Khách Sạn Mà Bạn Nên Biết',
    slug: 'nhung-dieu-kieng-ki-khi-o-khach-san-ma-ban-nen-biet',
    content: `
      <p>Để không gặp nhiều phiền toái và giữ an toàn cho chính bản thân trong mỗi chuyến đi, bạn nên cẩn thận tìm hiểu một số điều kiêng kị khi ở khách sạn.</p>
      
      <h2>Những điều không nên làm</h2>
      <ul>
        <li><strong>Không đặt giày dép lên giường:</strong> Đây là điều cấm kỵ ở nhiều nơi trên thế giới, đặc biệt là các nước châu Á.</li>
        <li><strong>Kiểm tra kỹ phòng trước khi vào:</strong> Luôn kiểm tra ổ khóa, cửa sổ, và các thiết bị an toàn trước khi định cư.</li>
        <li><strong>Không để thông tin cá nhân ở nơi công khai:</strong> Bảo vệ thông tin cá nhân là điều quan trọng.</li>
      </ul>
      
      <h2>Lưu ý về an toàn</h2>
      <p>Từ việc không đặt giày dép lên giường đến việc kiểm tra kỹ phòng trước khi vào, những điều tưởng chừng nhỏ nhặt này có thể giúp bạn có một kỳ nghỉ an toàn và thoải mái hơn.</p>
      
      <p>Ngoài ra, bạn cũng nên chú ý đến các biện pháp an toàn và quy tắc riêng của từng khách sạn để tránh những rắc rối không đáng có.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['mẹo vặt', 'an toàn', 'kinh nghiệm', 'du lịch'],
    status: 'published',
    published_at: '2024-01-20T14:30:00.000Z',
    created_at: '2024-01-20T14:30:00.000Z',
    updated_at: '2024-01-20T14:30:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 2,
      name: 'Sự kiện',
      slug: 'su-kien'
    }
  },
  {
    post_id: 3,
    user_id: 1,
    category_id: 3,
    title: 'Ý Nghĩa Việc Khách Sạn Để Chocolate Lên Gối Khi Dọn Phòng',
    slug: 'y-nghia-viec-khach-san-de-chocolate-len-goi-khi-don-phong',
    content: `
      <p>Các quản lý khách sạn phát hiện ra dịch vụ này nhận được nhiều lời khen từ khách thuê phòng hơn bất kỳ hoạt động nào khác.</p>
      
      <h2>Lịch sử của truyền thống này</h2>
      <p>Việc để chocolate lên gối không chỉ là một cử chỉ lịch sự mà còn là cách thể hiện sự quan tâm đến từng chi tiết nhỏ để tạo ra trải nghiệm tuyệt vời cho khách hàng.</p>
      
      <p>Truyền thống này bắt đầu từ những năm 1990 khi các khách sạn cao cấp muốn tạo ra một điểm nhấn đặc biệt trong dịch vụ của mình.</p>
      
      <h2>Tại sao lại là chocolate?</h2>
      <p>Từ đó, nhiều khách sạn cao cấp trên thế giới đã áp dụng phương pháp này như một phần của dịch vụ chăm sóc khách hàng.</p>
      
      <blockquote>
        "Một miếng chocolate nhỏ có thể tạo ra nụ cười và làm cho khách hàng cảm thấy được chào đón và đặc biệt." - Tổng giám đốc một khách sạn 5 sao
      </blockquote>
      
      <p>Chocolate không chỉ là một món quà mà còn là biểu tượng của sự sang trọng và chăm sóc chu đáo.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['dịch vụ', 'khách sạn', 'truyền thống', 'chocolate'],
    status: 'published',
    published_at: '2024-01-25T09:15:00.000Z',
    created_at: '2024-01-25T09:15:00.000Z',
    updated_at: '2024-01-25T09:15:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 3,
      name: 'Khuyến mãi',
      slug: 'khuyen-mai'
    }
  },
  {
    post_id: 4,
    user_id: 1,
    category_id: 4,
    title: 'Khám Phá Sài Gòn: Những Địa Điểm Không Thể Bỏ Qua',
    slug: 'kham-pha-sai-gon-nhung-dia-diem-khong-the-bo-qua',
    content: `
      <p>Sài Gòn - thành phố không bao giờ ngủ, nơi hội tụ của văn hóa, ẩm thực và cuộc sống sôi động. Từ những con phố ẩm thực đêm đông đúc đến các di tích lịch sử hàng trăm năm tuổi.</p>
      
      <h2>1. Nhà thờ Đức Bà</h2>
      <p>Một trong những biểu tượng của Sài Gòn, Nhà thờ Đức Bà là điểm đến không thể bỏ qua cho bất kỳ du khách nào.</p>
      
      <h2>2. Bưu điện Trung tâm</h2>
      <p>Nằm ngay bên cạnh Nhà thờ Đức Bà, Bưu điện Trung tâm Sài Gòn là một kiến trúc cổ điển đẹp mắt từ thời Pháp thuộc.</p>
      
      <h2>3. Chợ Bến Thành</h2>
      <p>Thành phố này luôn có điều gì đó mới mẻ để khám phá, từ những quán cà phê vintage đến các tòa nhà chọc trời hiện đại. Du khách sẽ không bao giờ cảm thấy nhàm chán khi đến đây.</p>
      
      <h2>4. Ẩm thực đường phố</h2>
      <p>Hãy cùng chúng tôi khám phá những địa điểm độc đáo và trải nghiệm cuộc sống về đêm đầy sôi động tại thành phố Hồ Chí Minh.</p>
      
      <p>Từ phở Bắc đến bún bò Huế, từ bánh mì đến chè, Sài Gòn là thiên đường ẩm thực với vô số món ăn đường phố hấp dẫn.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1539650116574-75c3c3d17187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['du lịch', 'sài gòn', 'khám phá', 'địa điểm', 'ẩm thực'],
    status: 'published',
    published_at: '2024-02-01T11:00:00.000Z',
    created_at: '2024-02-01T11:00:00.000Z',
    updated_at: '2024-02-01T11:00:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 4,
      name: 'Du lịch',
      slug: 'du-lich'
    }
  },
  {
    post_id: 5,
    user_id: 1,
    category_id: 1,
    title: 'Cách Chọn Khách Sạn Phù Hợp Cho Chuyến Du Lịch Của Bạn',
    slug: 'cach-chon-khach-san-phu-hop-cho-chuyen-du-lich-cua-ban',
    content: `
      <p>Việc chọn khách sạn phù hợp có thể làm thay đổi hoàn toàn trải nghiệm du lịch của bạn. Từ vị trí, giá cả đến các tiện ích, có rất nhiều yếu tố cần cân nhắc.</p>
      
      <h2>Các yếu tố quan trọng</h2>
      <ol>
        <li><strong>Vị trí:</strong> Chọn khách sạn gần các điểm tham quan hoặc trung tâm thành phố sẽ tiết kiệm thời gian di chuyển.</li>
        <li><strong>Giá cả:</strong> Cân nhắc ngân sách và so sánh giá giữa các khách sạn để có lựa chọn tốt nhất.</li>
        <li><strong>Tiện ích:</strong> WiFi, bữa sáng, bãi đỗ xe là những tiện ích cơ bản nên có.</li>
        <li><strong>Đánh giá:</strong> Đọc đánh giá từ các khách hàng trước đó để hiểu rõ về chất lượng dịch vụ.</li>
      </ol>
      
      <p>Một khách sạn tốt không chỉ là nơi để ngủ mà còn là điểm khởi đầu cho những cuộc phiêu lưu và trải nghiệm mới. Hãy tìm hiểu kỹ trước khi đặt phòng.</p>
      
      <p>Chúng tôi sẽ chia sẻ những bí quyết và kinh nghiệm để giúp bạn chọn được khách sạn phù hợp nhất với nhu cầu và ngân sách của mình.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['hướng dẫn', 'mẹo vặt', 'du lịch', 'khách sạn'],
    status: 'published',
    published_at: '2024-02-05T16:20:00.000Z',
    created_at: '2024-02-05T16:20:00.000Z',
    updated_at: '2024-02-05T16:20:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 1,
      name: 'Tin tức',
      slug: 'tin-tuc'
    }
  },
  {
    post_id: 6,
    user_id: 1,
    category_id: 3,
    title: 'Ưu Đãi Đặc Biệt: Giảm 30% Cho Đặt Phòng Trước 30 Ngày',
    slug: 'uu-dai-dac-biet-giam-30-cho-dat-phong-truoc-30-ngay',
    content: `
      <p>Nhân dịp kỷ niệm khai trương, Bean Hotel mang đến chương trình ưu đãi đặc biệt với mức giảm giá lên đến 30% cho khách đặt phòng trước 30 ngày.</p>
      
      <h2>Chi tiết chương trình</h2>
      <ul>
        <li>Giảm <strong>30%</strong> cho đặt phòng trước 30 ngày</li>
        <li>Giảm <strong>20%</strong> cho đặt phòng trước 15 ngày</li>
        <li>Giảm <strong>10%</strong> cho đặt phòng trước 7 ngày</li>
        <li>Miễn phí bữa sáng cho tất cả các đơn đặt</li>
        <li>Tặng voucher ăn uống tại nhà hàng khách sạn</li>
      </ul>
      
      <p>Áp dụng cho tất cả các loại phòng từ phòng tiêu chuẩn đến suite cao cấp. Đây là cơ hội tuyệt vời để bạn và gia đình có một kỳ nghỉ đáng nhớ với mức giá ưu đãi nhất.</p>
      
      <p><strong>Lưu ý:</strong> Chương trình có giới hạn số lượng phòng, vui lòng đặt sớm để đảm bảo có phòng phù hợp với nhu cầu của bạn.</p>
      
      <h2>Cách thức tham gia</h2>
      <p>Đơn giản chỉ cần đặt phòng trực tuyến trên website của chúng tôi và chọn mức ưu đãi phù hợp. Mã giảm giá sẽ được áp dụng tự động khi thanh toán.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['khuyến mãi', 'ưu đãi', 'giảm giá', 'đặc biệt'],
    status: 'published',
    published_at: '2024-02-10T08:00:00.000Z',
    created_at: '2024-02-10T08:00:00.000Z',
    updated_at: '2024-02-10T08:00:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 3,
      name: 'Khuyến mãi',
      slug: 'khuyen-mai'
    }
  },
  {
    post_id: 7,
    user_id: 1,
    category_id: 2,
    title: 'Sự Kiện Đặc Biệt: Đêm Nhạc Jazz Tại Rooftop Bar',
    slug: 'su-kien-dac-biet-dem-nhac-jazz-tai-rooftop-bar',
    content: `
      <p>Thứ Bảy hàng tuần, Bean Hotel tổ chức đêm nhạc Jazz đặc biệt tại Rooftop Bar với không gian thoáng mát và tầm nhìn toàn cảnh thành phố.</p>
      
      <h2>Điểm nổi bật</h2>
      <p>Đến với chúng tôi, bạn sẽ được thưởng thức những bản nhạc Jazz kinh điển trong không gian sang trọng, cùng những ly cocktail đặc biệt và view đẹp nhất thành phố.</p>
      
      <h2>Thời gian và địa điểm</h2>
      <ul>
        <li><strong>Thời gian:</strong> Mỗi thứ Bảy từ 19:00 - 23:00</li>
        <li><strong>Địa điểm:</strong> Rooftop Bar - Tầng 25 Bean Hotel</li>
        <li><strong>Giá vé:</strong> Miễn phí cho khách lưu trú tại khách sạn</li>
        <li><strong>Đặt chỗ:</strong> Liên hệ lễ tân hoặc đặt qua ứng dụng</li>
      </ul>
      
      <p>Sự kiện miễn phí cho khách lưu trú tại khách sạn. Đặt chỗ ngay để có trải nghiệm tuyệt vời nhất.</p>
      
      <h2>Menu đặc biệt</h2>
      <p>Thực đơn cocktail đặc biệt được phục vụ trong đêm, bao gồm các loại cocktail signature và rượu vang cao cấp.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['sự kiện', 'âm nhạc', 'giải trí', 'rooftop'],
    status: 'published',
    published_at: '2024-02-15T19:00:00.000Z',
    created_at: '2024-02-15T19:00:00.000Z',
    updated_at: '2024-02-15T19:00:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 2,
      name: 'Sự kiện',
      slug: 'su-kien'
    }
  },
  {
    post_id: 8,
    user_id: 1,
    category_id: 4,
    title: 'Gợi Ý Lịch Trình 3 Ngày 2 Đêm Tại Sài Gòn',
    slug: 'goi-y-lich-trinh-3-ngay-2-dem-tai-sai-gon',
    content: `
      <p>Khám phá Sài Gòn trong 3 ngày 2 đêm với lịch trình được thiết kế hoàn hảo, giúp bạn trải nghiệm những điều tuyệt vời nhất của thành phố này.</p>
      
      <h2>Ngày 1: Khám phá trung tâm thành phố</h2>
      <ul>
        <li><strong>Sáng:</strong> Tham quan Nhà thờ Đức Bà, Bưu điện Trung tâm, Dinh Thống Nhất</li>
        <li><strong>Trưa:</strong> Thưởng thức phở Bắc tại quán phở nổi tiếng</li>
        <li><strong>Chiều:</strong> Tham quan Bảo tàng Chứng tích Chiến tranh, Chợ Bến Thành</li>
        <li><strong>Tối:</strong> Thưởng thức ẩm thực đường phố tại quận 1</li>
      </ul>
      
      <h2>Ngày 2: Văn hóa và ẩm thực</h2>
      <ul>
        <li><strong>Sáng:</strong> Tham quan Địa đạo Củ Chi (nếu có thời gian) hoặc các điểm văn hóa trong thành phố</li>
        <li><strong>Trưa:</strong> Thưởng thức bún bò Huế tại quán đặc sản</li>
        <li><strong>Chiều:</strong> Khám phá các quán cà phê vintage, tham quan các gallery nghệ thuật</li>
        <li><strong>Tối:</strong> Ngắm cảnh đêm tại Sky Bar, thưởng thức cocktail</li>
      </ul>
      
      <h2>Ngày 3: Mua sắm và thư giãn</h2>
      <ul>
        <li><strong>Sáng:</strong> Mua sắm tại các trung tâm thương mại lớn</li>
        <li><strong>Trưa:</strong> Thưởng thức bữa trưa tại nhà hàng cao cấp</li>
        <li><strong>Chiều:</strong> Massage và thư giãn tại spa, chuẩn bị lên đường</li>
      </ul>
      
      <p>Chúng tôi đã chuẩn bị một lịch trình chi tiết với những địa điểm không thể bỏ qua và những món ăn phải thử khi đến Sài Gòn.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1539650116574-75c3c3d17187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1539650116574-75c3c3d17187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['lịch trình', 'du lịch', 'sài gòn', 'gợi ý', '3 ngày'],
    status: 'published',
    published_at: '2024-02-20T13:45:00.000Z',
    created_at: '2024-02-20T13:45:00.000Z',
    updated_at: '2024-02-20T13:45:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 4,
      name: 'Du lịch',
      slug: 'du-lich'
    }
  },
  {
    post_id: 9,
    user_id: 1,
    category_id: 1,
    title: 'Khách Sạn Xanh: Xu Hướng Bền Vững Trong Du Lịch',
    slug: 'khach-san-xanh-xu-huong-ben-vung-trong-du-lich',
    content: `
      <p>Khách sạn xanh không còn là xu hướng mà đã trở thành tiêu chuẩn mới trong ngành du lịch. Từ việc sử dụng năng lượng tái tạo đến giảm thiểu rác thải nhựa.</p>
      
      <h2>Tại sao khách sạn xanh quan trọng?</h2>
      <p>Các khách sạn hiện đại đang đầu tư vào công nghệ xanh và các phương pháp bền vững để vừa bảo vệ môi trường, vừa tạo ra trải nghiệm tốt hơn cho khách hàng.</p>
      
      <h2>Các giải pháp xanh</h2>
      <ul>
        <li><strong>Năng lượng tái tạo:</strong> Sử dụng năng lượng mặt trời, gió để giảm thiểu lượng khí thải carbon</li>
        <li><strong>Tiết kiệm nước:</strong> Hệ thống tái sử dụng nước, vòi sen tiết kiệm nước</li>
        <li><strong>Giảm rác thải:</strong> Loại bỏ đồ nhựa dùng một lần, tái chế rác thải</li>
        <li><strong>Nội thất thân thiện môi trường:</strong> Sử dụng vật liệu tái chế, nội thất từ gỗ bền vững</li>
        <li><strong>Thực phẩm địa phương:</strong> Sử dụng nguyên liệu địa phương để giảm thiểu vận chuyển</li>
      </ul>
      
      <p>Bean Hotel tự hào là một trong những khách sạn tiên phong trong việc áp dụng các giải pháp xanh và bền vững tại Việt Nam.</p>
      
      <h2>Lợi ích cho khách hàng</h2>
      <p>Khách hàng không chỉ được trải nghiệm dịch vụ chất lượng mà còn cảm thấy hài lòng khi biết rằng họ đang góp phần bảo vệ môi trường.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['môi trường', 'bền vững', 'khách sạn xanh', 'tái tạo'],
    status: 'published',
    published_at: '2024-02-25T10:30:00.000Z',
    created_at: '2024-02-25T10:30:00.000Z',
    updated_at: '2024-02-25T10:30:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 1,
      name: 'Tin tức',
      slug: 'tin-tuc'
    }
  },
  {
    post_id: 10,
    user_id: 1,
    category_id: 2,
    title: 'Workshop Nấu Ăn: Học Cách Làm Phở Chuẩn Vị Hà Nội',
    slug: 'workshop-nau-an-hoc-cach-lam-pho-chuan-vi-ha-noi',
    content: `
      <p>Tham gia workshop đặc biệt tại Bean Hotel để học cách nấu phở chuẩn vị Hà Nội từ đầu bếp chuyên nghiệp. Trải nghiệm ẩm thực độc đáo dành cho khách lưu trú.</p>
      
      <h2>Nội dung workshop</h2>
      <p>Bạn sẽ được hướng dẫn từng bước một, từ việc chọn nguyên liệu đến cách nấu nước dùng đậm đà. Sau buổi học, bạn sẽ có thể tự tay làm món phở thơm ngon cho gia đình.</p>
      
      <h2>Thời gian và địa điểm</h2>
      <ul>
        <li><strong>Thời gian:</strong> Chủ nhật hàng tuần, 14:00 - 17:00</li>
        <li><strong>Địa điểm:</strong> Nhà bếp khách sạn - Tầng 2</li>
        <li><strong>Giá vé:</strong> 500.000 VNĐ/người (khách lưu trú), 700.000 VNĐ (khách ngoài)</li>
        <li><strong>Số lượng:</strong> Tối đa 12 người/lớp</li>
      </ul>
      
      <h2>Những gì bạn sẽ học</h2>
      <ol>
        <li>Cách chọn và chuẩn bị nguyên liệu</li>
        <li>Bí quyết nấu nước dùng trong và đậm đà</li>
        <li>Cách chế biến thịt bò tái, chín vừa</li>
        <li>Cách trình bày đẹp mắt</li>
        <li>Các mẹo vặt để phở ngon hơn</li>
      </ol>
      
      <p>Workshop được tổ chức vào cuối tuần với số lượng giới hạn. Đăng ký ngay để có cơ hội tham gia sớm nhất.</p>
      
      <p>Sau khi hoàn thành, bạn sẽ được nhận chứng nhận tham gia và công thức chi tiết để có thể làm tại nhà.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['workshop', 'ẩm thực', 'học nấu ăn', 'phở'],
    status: 'published',
    published_at: '2024-03-01T15:00:00.000Z',
    created_at: '2024-03-01T15:00:00.000Z',
    updated_at: '2024-03-01T15:00:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 2,
      name: 'Sự kiện',
      slug: 'su-kien'
    }
  },
  {
    post_id: 11,
    user_id: 1,
    category_id: 4,
    title: 'Top 5 Bãi Biển Đẹp Nhất Việt Nam Nên Đến Một Lần',
    slug: 'top-5-bai-bien-dep-nhat-viet-nam-nen-den-mot-lan',
    content: `
      <p>Việt Nam được thiên nhiên ưu đãi với bờ biển dài hơn 3.000 km và vô số bãi biển tuyệt đẹp. Hãy cùng khám phá top 5 bãi biển đẹp nhất mà bạn nên đến một lần trong đời.</p>
      
      <h2>1. Bãi biển Mỹ Khê - Đà Nẵng</h2>
      <p>Được tạp chí Forbes bình chọn là một trong 6 bãi biển đẹp nhất hành tinh, Mỹ Khê có cát trắng mịn và nước biển trong xanh.</p>
      
      <h2>2. Bãi biển Nha Trang</h2>
      <p>Nha Trang nổi tiếng với bãi biển dài, sóng nhẹ phù hợp cho các hoạt động thể thao dưới nước như lặn biển, chèo thuyền.</p>
      
      <h2>3. Bãi biển Phú Quốc</h2>
      <p>Hòn đảo ngọc với những bãi biển hoang sơ, nước biển trong vắt như pha lê, là điểm đến lý tưởng cho những ai yêu thiên nhiên.</p>
      
      <h2>4. Bãi biển Cửa Lò - Nghệ An</h2>
      <p>Với bãi cát vàng mịn màng, nước biển trong xanh, Cửa Lò là một trong những bãi biển đẹp nhất miền Bắc.</p>
      
      <h2>5. Bãi biển Mũi Né - Phan Thiết</h2>
      <p>Nổi tiếng với những cồn cát đỏ và hoạt động lướt ván, Mũi Né là thiên đường cho những người yêu thích thể thao biển.</p>
      
      <p>Mỗi bãi biển đều có nét đẹp riêng và mang đến trải nghiệm khác biệt. Hãy lên kế hoạch và khám phá những thiên đường biển này!</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['du lịch', 'bãi biển', 'việt nam', 'top 5'],
    status: 'published',
    published_at: '2024-03-05T09:00:00.000Z',
    created_at: '2024-03-05T09:00:00.000Z',
    updated_at: '2024-03-05T09:00:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 4,
      name: 'Du lịch',
      slug: 'du-lich'
    }
  },
  {
    post_id: 12,
    user_id: 1,
    category_id: 1,
    title: 'Công Nghệ AI Trong Ngành Khách Sạn: Tương Lai Đã Đến',
    slug: 'cong-nghe-ai-trong-nganh-khach-san-tuong-lai-da-den',
    content: `
      <p>Trí tuệ nhân tạo (AI) đang cách mạng hóa ngành khách sạn, từ việc cá nhân hóa trải nghiệm khách hàng đến tối ưu hóa vận hành.</p>
      
      <h2>AI trong dịch vụ khách hàng</h2>
      <p>Các chatbot AI có thể trả lời câu hỏi của khách hàng 24/7, đặt phòng tự động, và cung cấp thông tin về khách sạn một cách nhanh chóng và chính xác.</p>
      
      <h2>AI trong quản lý giá phòng</h2>
      <p>Hệ thống AI có thể phân tích dữ liệu thị trường, mùa vụ, và sự kiện để tự động điều chỉnh giá phòng tối ưu, tăng doanh thu và tỷ lệ lấp đầy.</p>
      
      <h2>AI trong cá nhân hóa trải nghiệm</h2>
      <p>Từ việc đề xuất phòng phù hợp đến gợi ý các hoạt động và nhà hàng, AI giúp tạo ra trải nghiệm cá nhân hóa cho từng khách hàng.</p>
      
      <p>Bean Hotel đang nghiên cứu và triển khai các giải pháp AI để nâng cao chất lượng dịch vụ và trải nghiệm khách hàng.</p>
      
      <h2>Tương lai của AI trong khách sạn</h2>
      <p>Với sự phát triển không ngừng của công nghệ, AI sẽ tiếp tục đóng vai trò quan trọng trong việc định hình tương lai của ngành khách sạn.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['công nghệ', 'AI', 'khách sạn', 'tương lai'],
    status: 'published',
    published_at: '2024-03-10T11:30:00.000Z',
    created_at: '2024-03-10T11:30:00.000Z',
    updated_at: '2024-03-10T11:30:00.000Z',
    author: {
      user_id: 1,
      full_name: 'Admin Bean Hotel',
      email: 'admin@beanhotel.com'
    },
    category: {
      category_id: 1,
      name: 'Tin tức',
      slug: 'tin-tuc'
    }
  }
]

// Mock categories data
export const mockNewsCategories = [
  {
    category_id: 1,
    name: 'Tin tức',
    slug: 'tin-tuc'
  },
  {
    category_id: 2,
    name: 'Sự kiện',
    slug: 'su-kien'
  },
  {
    category_id: 3,
    name: 'Khuyến mãi',
    slug: 'khuyen-mai'
  },
  {
    category_id: 4,
    name: 'Du lịch',
    slug: 'du-lich'
  }
]

// Helper function để lấy post theo slug hoặc ID
export const getMockPostByIdentifier = (identifier) => {
  const isNumeric = /^\d+$/.test(String(identifier))
  
  if (isNumeric) {
    return mockNewsData.find(post => post.post_id === parseInt(identifier))
  } else {
    return mockNewsData.find(post => post.slug === identifier)
  }
}

// Helper function để filter posts
export const filterMockPosts = (posts, { search, category, tag } = {}) => {
  let filtered = [...posts]
  
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower)
    )
  }
  
  if (category && category !== 'all') {
    const categoryId = typeof category === 'string' ? parseInt(category) : category
    filtered = filtered.filter(post => post.category_id === categoryId)
  }
  
  if (tag) {
    filtered = filtered.filter(post => 
      post.tags && Array.isArray(post.tags) && post.tags.some(t => 
        t.toLowerCase().includes(tag.toLowerCase())
      )
    )
  }
  
  return filtered
}


