// src/pages/HomePage.jsx - อัปเดตให้ใช้รูปจาก assets
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Carousel,
  Card,
  Button,
  Typography,
  Input,
  DatePicker,
  Select,
  Space,
  Row,
  Col,
  Divider,
  Rate,
  Tag,
  Image,
  Skeleton,
  message,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  RightOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  CoffeeOutlined,
  CarOutlined,
  HomeOutlined,
  StarOutlined,
  UserOutlined,
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import roomService from "../services/roomService";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// นำเข้ารูปภาพจาก assets
import hotelImage1 from "../assets/S__25985045_0.jpg";
import hotelImage2 from "../assets/S__25985047_0.jpg";
import hotelImage3 from "../assets/S__25985048_0.jpg";
import hotelImage4 from "../assets/S__25985049_0.jpg";
import hotelImage5 from "../assets/S__25985050_0.jpg";
import hotelImage6 from "../assets/S__25985051_0.jpg";
import hotelImage7 from "../assets/S__25985052_0.jpg";
import hotelImage8 from "../assets/S__25985053_0.jpg";
import hotelImage9 from "../assets/S__25985054_0.jpg";

// Mock Data - ในโปรเจคจริงจะดึงจาก Supabase
const TESTIMONIALS = [
  {
    id: 1,
    name: "คุณสมชาย ใจดี",
    avatar: "https://via.placeholder.com/64",
    rating: 5,
    comment:
      "โรงแรมตกแต่งสวยงาม พนักงานบริการดีมาก ห้องพักสะอาด และมีสิ่งอำนวยความสะดวกครบครัน ประทับใจมากครับ",
    date: "15 พฤษภาคม 2025",
  },
  {
    id: 2,
    name: "คุณวาสนา มีสุข",
    avatar: "https://via.placeholder.com/64",
    rating: 4,
    comment:
      "วิวสวยมาก อาหารอร่อย บรรยากาศดี แนะนำสำหรับคนที่อยากพักผ่อนจริงๆ ค่ะ",
    date: "2 พฤษภาคม 2025",
  },
  {
    id: 3,
    name: "คุณประวิตร รักสงบ",
    avatar: "https://via.placeholder.com/64",
    rating: 5,
    comment:
      "ประทับใจกับการบริการมาก พนักงานเป็นกันเอง ให้คำแนะนำดี ห้องพักกว้างขวาง สะอาด จะกลับมาพักอีกแน่นอนครับ",
    date: "25 เมษายน 2025",
  },
];

// ข้อมูลรูปภาพสำหรับ Carousel
const CAROUSEL_IMAGES = [
  {
    src: hotelImage1,
    title: "ห้องพักสุดหรู",
    subtitle: "ผ่อนคลายในห้องพักที่ออกแบบอย่างพิถีพิถัน พร้อมวิวที่สวยงาม",
    action: "ดูห้องพัก",
    target: "#rooms-section",
  },
  {
    src: hotelImage2,
    title: "บริการเหนือระดับ",
    subtitle:
      "เราใส่ใจในทุกรายละเอียด เพื่อให้คุณได้รับประสบการณ์ที่น่าประทับใจ",
    action: "ดูบริการของเรา",
    target: "#features-section",
  },
  {
    src: hotelImage3,
    title: "บรรยากาศที่เป็นส่วนตัว",
    subtitle: "สัมผัสความสงบและความผ่อนคลายในสภาพแวดล้อมที่เป็นส่วนตัว",
    action: "จองเลย",
    target: "/rooms",
  },
];

// ข้อมูลรูปภาพสำหรับแกลเลอรี่
const GALLERY_IMAGES = [
  {
    src: hotelImage4,
    title: "ห้องพักที่หรูหรา",
    description: "ห้องพักที่ออกแบบมาอย่างพิถีพิถัน",
  },
  {
    src: hotelImage5,
    title: "พื้นที่พักผ่อน",
    description: "บรรยากาศที่เหมาะสำหรับการพักผ่อน",
  },
  {
    src: hotelImage6,
    title: "สิ่งอำนวยความสะดวก",
    description: "สิ่งอำนวยความสะดวกครบครันในทุกห้อง",
  },
  {
    src: hotelImage7,
    title: "การตกแต่งสมัยใหม่",
    description: "การตกแต่งที่ผสมผสานระหว่างความสะดวกสบายและความหรูหรา",
  },
  {
    src: hotelImage8,
    title: "พื้นที่ส่วนกลาง",
    description: "พื้นที่ส่วนกลางที่สวยงามและสะดวกสบาย",
  },
  {
    src: hotelImage9,
    title: "ห้องน้ำหรูหรา",
    description: "ห้องน้ำที่ออกแบบมาอย่างหรูหราและใช้งานสะดวก",
  },
];

// Features Icons Components
const FeatureIcon = ({ icon, title, description }) => (
  <div className="text-center p-4">
    <div className="text-4xl text-primary mb-4 flex justify-center">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

function HomePage() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    dates: null,
    guests: 1,
    roomType: "all",
  });

  useEffect(() => {
    fetchFeaturedRooms();
    fetchRoomTypes();
  }, []);

  const fetchFeaturedRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getFeaturedRooms(3);
      setFeaturedRooms(data);
    } catch (error) {
      console.error("Error fetching featured rooms:", error);
      message.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const data = await roomService.getRoomTypes();
      setRoomTypes(data);
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchParams.dates) {
      message.warning("กรุณาเลือกวันที่เข้าพัก");
      return;
    }

    try {
      const searchQuery = {
        checkInDate: searchParams.dates[0].format("YYYY-MM-DD"),
        checkOutDate: searchParams.dates[1].format("YYYY-MM-DD"),
        guests: searchParams.guests,
        roomType:
          searchParams.roomType !== "all" ? searchParams.roomType : null,
      };

      // นำทางไปยังหน้ารายการห้องพักพร้อมพารามิเตอร์การค้นหา
      window.location.href = `/rooms?search=${encodeURIComponent(
        JSON.stringify(searchQuery)
      )}`;
    } catch (error) {
      console.error("Search error:", error);
      message.error("เกิดข้อผิดพลาดในการค้นหา");
    }
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return <WifiOutlined />;
    if (amenityLower.includes("car") || amenityLower.includes("parking"))
      return <CarOutlined />;
    if (amenityLower.includes("coffee") || amenityLower.includes("bar"))
      return <CoffeeOutlined />;
    return <StarOutlined />;
  };

  return (
    <div className="homepage">
      {/* Hero Section with Asset Images */}
      <section className="relative">
        <Carousel autoplay effect="fade" className="h-[600px] overflow-hidden">
          {CAROUSEL_IMAGES.map((slide, index) => (
            <div key={index} className="h-[600px] relative">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${slide.src}')`,
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-center max-w-3xl">
                  {slide.subtitle}
                </p>
                <Button
                  type="primary"
                  size="large"
                  className="text-lg h-12 px-8"
                  onClick={() => {
                    if (slide.target.startsWith("#")) {
                      document
                        .getElementById(slide.target.substring(1))
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = slide.target;
                    }
                  }}
                >
                  {slide.action}
                </Button>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Search/Booking Box */}
        <div
          id="booking-section"
          className="max-w-6xl mx-auto px-4 relative -mt-20 z-10"
        >
          <Card
            className="shadow-xl rounded-lg overflow-hidden"
            bodyStyle={{ padding: "24px" }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Text strong className="mb-2 block">
                  วันที่เข้าพัก - ออก
                </Text>
                <RangePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder={["วันที่เช็คอิน", "วันที่เช็คเอาท์"]}
                  onChange={(dates) =>
                    setSearchParams({ ...searchParams, dates })
                  }
                />
              </div>
              <div className="md:w-1/4">
                <Text strong className="mb-2 block">
                  จำนวนผู้เข้าพัก
                </Text>
                <Select
                  className="w-full"
                  defaultValue={1}
                  onChange={(value) =>
                    setSearchParams({ ...searchParams, guests: value })
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Option key={num} value={num}>
                      {num} {num === 1 ? "คน" : "คน"}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="md:w-1/4">
                <Text strong className="mb-2 block">
                  ประเภทห้อง
                </Text>
                <Select
                  className="w-full"
                  defaultValue="all"
                  onChange={(value) =>
                    setSearchParams({ ...searchParams, roomType: value })
                  }
                >
                  <Option value="all">ทุกประเภท</Option>
                  {roomTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="md:w-1/4 flex items-end">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  size="large"
                  className="w-full"
                  onClick={handleSearch}
                >
                  ค้นหา
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section id="rooms-section" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4 text-3xl font-bold">
              <span className="border-b-2 border-primary pb-2">
                ห้องพักแนะนำ
              </span>
            </Title>
            <Paragraph className="text-lg max-w-2xl mx-auto">
              เลือกห้องพักที่เหมาะกับความต้องการของคุณ ด้วยการออกแบบที่หรูหรา
              และสิ่งอำนวยความสะดวกครบครัน
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {loading ? (
              // Loading skeletons
              Array(3)
                .fill()
                .map((_, index) => (
                  <Col xs={24} md={8} key={`skeleton-${index}`}>
                    <Card
                      className="h-full"
                      cover={<Skeleton.Image className="w-full h-48" active />}
                    >
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </Card>
                  </Col>
                ))
            ) : featuredRooms.length > 0 ? (
              featuredRooms.map((room) => (
                <Col xs={24} md={8} key={room.id}>
                  <Card
                    hoverable
                    className="h-full shadow-md transition-all duration-300 hover:shadow-xl"
                    cover={
                      <div className="h-48 overflow-hidden">
                        <img
                          alt={room.room_type.name}
                          src={
                            room.main_image ||
                            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format"
                          }
                          className="w-full h-full object-cover transition-transform duration-500 transform hover:scale-110"
                        />
                      </div>
                    }
                  >
                    <div className="mb-2 flex justify-between items-center">
                      <Title level={4} className="m-0">
                        {room.room_type.name}
                      </Title>
                      <Tag color="success">
                        {room.room_type.base_price.toLocaleString()} บาท/คืน
                      </Tag>
                    </div>
                    <div className="mb-4">
                      <Space>
                        <Tag
                          icon={<HomeOutlined />}
                        >{`ห้อง ${room.room_number}`}</Tag>
                        <Tag
                          icon={<UserOutlined />}
                        >{`${room.room_type.capacity} คน`}</Tag>
                      </Space>
                    </div>
                    <Paragraph className="mb-4 h-12 overflow-hidden">
                      {room.description ||
                        room.room_type.description ||
                        "ห้องพักคุณภาพดีพร้อมสิ่งอำนวยความสะดวกครบครัน"}
                    </Paragraph>
                    <div className="mb-4">
                      {room.room_type.amenities &&
                      room.room_type.amenities.length > 0 ? (
                        <>
                          {room.room_type.amenities
                            .slice(0, 3)
                            .map((amenity, index) => (
                              <Tag
                                key={index}
                                className="mb-1 mr-1"
                                icon={getAmenityIcon(amenity)}
                              >
                                {amenity}
                              </Tag>
                            ))}
                          {room.room_type.amenities.length > 3 && (
                            <Tag className="mb-1">
                              +{room.room_type.amenities.length - 3}
                            </Tag>
                          )}
                        </>
                      ) : (
                        <Tag>พร้อมสิ่งอำนวยความสะดวก</Tag>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <Link to={`/rooms/${room.id}`}>
                        <Button type="link" className="p-0">
                          ดูรายละเอียด <RightOutlined />
                        </Button>
                      </Link>
                      <Link to={`/rooms/${room.id}`}>
                        <Button type="primary">จองเลย</Button>
                      </Link>
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              // No rooms found
              <Col span={24}>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Title level={4}>ไม่พบข้อมูลห้องพัก</Title>
                  <Paragraph>
                    กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล หรือติดต่อผู้ดูแลระบบ
                  </Paragraph>
                  <Button onClick={fetchFeaturedRooms}>
                    ลองโหลดข้อมูลอีกครั้ง
                  </Button>
                </div>
              </Col>
            )}
          </Row>

          <div className="text-center mt-12">
            <Link to="/rooms">
              <Button type="primary" size="large">
                ดูห้องพักทั้งหมด
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section - ใหม่ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4 text-3xl font-bold">
              <span className="border-b-2 border-primary pb-2">
                บรรยากาศโรงแรม
              </span>
            </Title>
            <Paragraph className="text-lg max-w-2xl mx-auto">
              สัมผัสบรรยากาศและความงามของโรงแรมผ่านภาพถ่ายที่แสดงถึงคุณภาพการบริการของเรา
            </Paragraph>
          </div>

          <Row gutter={[16, 16]}>
            {GALLERY_IMAGES.map((image, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  hoverable
                  className="overflow-hidden"
                  cover={
                    <div className="h-64 overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        style={{ objectFit: "cover" }}
                        preview={{
                          mask: "ดูรูปภาพ",
                        }}
                      />
                    </div>
                  }
                >
                  <div className="p-2">
                    <Title level={5} className="mb-2">
                      {image.title}
                    </Title>
                    <Text type="secondary" className="text-sm">
                      {image.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4 text-3xl font-bold">
              <span className="border-b-2 border-primary pb-2">
                บริการของเรา
              </span>
            </Title>
            <Paragraph className="text-lg max-w-2xl mx-auto">
              เราให้บริการที่ครบครัน
              เพื่อให้การพักผ่อนของคุณเป็นประสบการณ์ที่น่าประทับใจ
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={8}>
              <FeatureIcon
                icon={<WifiOutlined className="text-primary" />}
                title="Free Wi-Fi"
                description="บริการ Wi-Fi ความเร็วสูงฟรีตลอดการเข้าพัก"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <FeatureIcon
                icon={<CoffeeOutlined className="text-primary" />}
                title="อาหารเช้า"
                description="เพลิดเพลินกับอาหารเช้าที่หลากหลายและมีคุณภาพ"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <FeatureIcon
                icon={<CarOutlined className="text-primary" />}
                title="บริการรถรับ-ส่ง"
                description="บริการรถรับ-ส่งจากสนามบินถึงโรงแรม"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <FeatureIcon
                icon={<ClockCircleOutlined className="text-primary" />}
                title="บริการ 24 ชั่วโมง"
                description="พนักงานพร้อมให้บริการตลอด 24 ชั่วโมง"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <FeatureIcon
                icon={<CheckCircleOutlined className="text-primary" />}
                title="ทำความสะอาดทุกวัน"
                description="บริการทำความสะอาดห้องพักทุกวัน"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <FeatureIcon
                icon={<StarOutlined className="text-primary" />}
                title="กิจกรรมพิเศษ"
                description="กิจกรรมพิเศษสำหรับผู้เข้าพัก"
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4 text-3xl font-bold">
              <span className="border-b-2 border-primary pb-2">
                รีวิวจากผู้เข้าพัก
              </span>
            </Title>
            <Paragraph className="text-lg max-w-2xl mx-auto">
              ฟังความคิดเห็นจากผู้เข้าพักที่มีประสบการณ์ดีกับเรา
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {TESTIMONIALS.map((testimonial) => (
              <Col xs={24} md={8} key={testimonial.id}>
                <Card className="h-full">
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full mx-auto"
                      />
                    </div>
                    <Title level={5} className="mb-1">
                      {testimonial.name}
                    </Title>
                    <Rate disabled defaultValue={testimonial.rating} />
                  </div>
                  <Paragraph className="text-center italic mb-4">
                    "{testimonial.comment}"
                  </Paragraph>
                  <div className="text-center">
                    <Text type="secondary">{testimonial.date}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <Title level={2} className="mb-6">
                ติดต่อเรา
              </Title>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Space>
                    <EnvironmentOutlined className="text-primary text-xl" />
                    <div>
                      <Text strong>ที่อยู่</Text>
                      <div>123 ถนนสุขุมวิท, สวนหลวง, กรุงเทพฯ 10250</div>
                    </div>
                  </Space>
                </div>
                <div>
                  <Space>
                    <PhoneOutlined className="text-primary text-xl" />
                    <div>
                      <Text strong>โทรศัพท์</Text>
                      <div>+66 819797986</div>
                    </div>
                  </Space>
                </div>
                <div>
                  <Space>
                    <MailOutlined className="text-primary text-xl" />
                    <div>
                      <Text strong>อีเมล</Text>
                      <div>info@krplace.com</div>
                    </div>
                  </Space>
                </div>
                <div>
                  <Space>
                    <ClockCircleOutlined className="text-primary text-xl" />
                    <div>
                      <Text strong>เวลาทำการ</Text>
                      <div>เช็คอิน: 14:00 | เช็คเอาท์: 12:00</div>
                    </div>
                  </Space>
                </div>
              </Space>

              <Divider />

              <div>
                <Text strong className="mb-3 block">
                  ติดตามเราได้ที่
                </Text>
                <Space size="middle">
                  <Button
                    shape="circle"
                    icon={<FacebookOutlined />}
                    style={{
                      backgroundColor: "#1877f2",
                      borderColor: "#1877f2",
                      color: "#fff",
                    }}
                  />
                  <Button
                    shape="circle"
                    icon={<InstagramOutlined />}
                    style={{
                      backgroundColor: "#E4405F",
                      borderColor: "#E4405F",
                      color: "#fff",
                    }}
                  />
                  <Button
                    shape="circle"
                    icon={<TwitterOutlined />}
                    style={{
                      backgroundColor: "#1DA1F2",
                      borderColor: "#1DA1F2",
                      color: "#fff",
                    }}
                  />
                </Space>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="text-center">
                <img
                  src={hotelImage4}
                  alt="Hotel Exterior"
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${hotelImage5}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "16px",
              padding: "60px 20px",
              color: "white",
            }}
          >
            <Title level={2} style={{ color: "white", marginBottom: "16px" }}>
              พร้อมสำหรับการพักผ่อนที่ดีที่สุดแล้วหรือยัง?
            </Title>
            <Paragraph
              style={{
                fontSize: "18px",
                color: "white",
                marginBottom: "32px",
                maxWidth: "600px",
                margin: "0 auto 32px",
              }}
            >
              จองห้องพักกับเราวันนี้และสัมผัสประสบการณ์การพักผ่อนที่ไม่เหมือนใคร
              พร้อมบริการที่เหนือความคาดหมาย
            </Paragraph>
            <Space size="large">
              <Link to="/rooms">
                <Button
                  type="primary"
                  size="large"
                  style={{
                    backgroundColor: "#AA8453",
                    borderColor: "#AA8453",
                    height: "50px",
                    padding: "0 40px",
                    fontSize: "16px",
                  }}
                >
                  เริ่มจองเลย
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="large"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "white",
                    color: "white",
                    height: "50px",
                    padding: "0 40px",
                    fontSize: "16px",
                  }}
                >
                  ติดต่อเรา
                </Button>
              </Link>
            </Space>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
