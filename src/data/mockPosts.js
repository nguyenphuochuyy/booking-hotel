// Mock data cho bài viết tin tức
export const mockPosts = [
  {
    post_id: 1,
    user_id: 1,
    category_id: 1,
    title: '10 Xu Hướng Thịnh Hành Trong Ngành Khách Sạn 2024',
    slug: '10-xu-huong-thinh-hanh-trong-nganh-khach-san-2024',
    content: `
      <p>Ngành khách sạn đang có những thay đổi đáng kể sau đại dịch. Không gian ngoài trời mở rộng hơn, nâng cấp công nghệ để hạn chế tối đa tiếp xúc là những xu hướng mới nhiều khách sạn đang áp dụng.</p>
      <p>Từ việc tích hợp công nghệ không chạm (touchless) đến việc mở rộng không gian ngoài trời, các khách sạn đang tìm cách tạo ra trải nghiệm an toàn và tiện nghi hơn cho khách hàng.</p>
      <p>Bên cạnh đó, tính bền vững và thân thiện với môi trường cũng là một trong những ưu tiên hàng đầu của các khách sạn hiện đại.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['khách sạn', 'xu hướng', 'công nghệ', '2024'],
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
      <p>Từ việc không đặt giày dép lên giường đến việc kiểm tra kỹ phòng trước khi vào, những điều tưởng chừng nhỏ nhặt này có thể giúp bạn có một kỳ nghỉ an toàn và thoải mái hơn.</p>
      <p>Ngoài ra, bạn cũng nên chú ý đến các biện pháp an toàn và quy tắc riêng của từng khách sạn để tránh những rắc rối không đáng có.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['mẹo vặt', 'an toàn', 'kinh nghiệm'],
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
      <p>Việc để chocolate lên gối không chỉ là một cử chỉ lịch sự mà còn là cách thể hiện sự quan tâm đến từng chi tiết nhỏ để tạo ra trải nghiệm tuyệt vời cho khách hàng.</p>
      <p>Từ đó, nhiều khách sạn cao cấp trên thế giới đã áp dụng phương pháp này như một phần của dịch vụ chăm sóc khách hàng.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['dịch vụ', 'khách sạn', 'truyền thống'],
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
      <p>Thành phố này luôn có điều gì đó mới mẻ để khám phá, từ những quán cà phê vintage đến các tòa nhà chọc trời hiện đại. Du khách sẽ không bao giờ cảm thấy nhàm chán khi đến đây.</p>
      <p>Hãy cùng chúng tôi khám phá những địa điểm độc đáo và trải nghiệm cuộc sống về đêm đầy sôi động tại thành phố Hồ Chí Minh.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['du lịch', 'sài gòn', 'khám phá', 'địa điểm'],
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
      <p>Một khách sạn tốt không chỉ là nơi để ngủ mà còn là điểm khởi đầu cho những cuộc phiêu lưu và trải nghiệm mới. Hãy tìm hiểu kỹ trước khi đặt phòng.</p>
      <p>Chúng tôi sẽ chia sẻ những bí quyết và kinh nghiệm để giúp bạn chọn được khách sạn phù hợp nhất với nhu cầu và ngân sách của mình.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['hướng dẫn', 'mẹo vặt', 'du lịch'],
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
      <p>Áp dụng cho tất cả các loại phòng từ phòng tiêu chuẩn đến suite cao cấp. Đây là cơ hội tuyệt vời để bạn và gia đình có một kỳ nghỉ đáng nhớ với mức giá ưu đãi nhất.</p>
      <p>Chương trình có giới hạn số lượng phòng, vui lòng đặt sớm để đảm bảo có phòng phù hợp với nhu cầu của bạn.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['khuyến mãi', 'ưu đãi', 'giảm giá'],
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
      <p>Đến với chúng tôi, bạn sẽ được thưởng thức những bản nhạc Jazz kinh điển trong không gian sang trọng, cùng những ly cocktail đặc biệt và view đẹp nhất thành phố.</p>
      <p>Sự kiện miễn phí cho khách lưu trú tại khách sạn. Đặt chỗ ngay để có trải nghiệm tuyệt vời nhất.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['sự kiện', 'âm nhạc', 'giải trí'],
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
      <p>Từ việc tham quan các di tích lịch sử vào buổi sáng, thưởng thức ẩm thực đường phố vào buổi trưa, đến khám phá cuộc sống về đêm sôi động.</p>
      <p>Chúng tôi đã chuẩn bị một lịch trình chi tiết với những địa điểm không thể bỏ qua và những món ăn phải thử khi đến Sài Gòn.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1539650116574-75c3c3d17187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1539650116574-75c3c3d17187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['lịch trình', 'du lịch', 'sài gòn', 'gợi ý'],
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
      <p>Các khách sạn hiện đại đang đầu tư vào công nghệ xanh và các phương pháp bền vững để vừa bảo vệ môi trường, vừa tạo ra trải nghiệm tốt hơn cho khách hàng.</p>
      <p>Bean Hotel tự hào là một trong những khách sạn tiên phong trong việc áp dụng các giải pháp xanh và bền vững tại Việt Nam.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['môi trường', 'bền vững', 'khách sạn xanh'],
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
      <p>Bạn sẽ được hướng dẫn từng bước một, từ việc chọn nguyên liệu đến cách nấu nước dùng đậm đà. Sau buổi học, bạn sẽ có thể tự tay làm món phở thơm ngon cho gia đình.</p>
      <p>Workshop được tổ chức vào cuối tuần với số lượng giới hạn. Đăng ký ngay để có cơ hội tham gia sớm nhất.</p>
    `,
    cover_image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['workshop', 'ẩm thực', 'học nấu ăn'],
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
  }
]

// Mock categories
export const mockCategories = [
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


