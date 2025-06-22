// src/pages/HomePage.jsx
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
      {/* Hero Section */}
      <section className="relative">
        <Carousel autoplay effect="fade" className="h-[600px] overflow-hidden">
          <div className="h-[600px] relative">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format')",
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
                ห้องพักสุดหรู
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-center max-w-3xl">
                ผ่อนคลายในห้องพักที่ออกแบบอย่างพิถีพิถัน พร้อมวิวที่สวยงาม
              </p>
              <Button
                type="primary"
                size="large"
                className="text-lg h-12 px-8"
                onClick={() =>
                  document
                    .getElementById("rooms-section")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                ดูห้องพัก
              </Button>
            </div>
          </div>
          <div className="h-[600px] relative">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1920&auto=format')",
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
                บริการเหนือระดับ
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-center max-w-3xl">
                เราใส่ใจในทุกรายละเอียด
                เพื่อให้คุณได้รับประสบการณ์ที่น่าประทับใจ
              </p>
              <Button
                type="primary"
                size="large"
                className="text-lg h-12 px-8"
                onClick={() =>
                  document
                    .getElementById("features-section")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                ดูบริการของเรา
              </Button>
            </div>
          </div>
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

      {/* Features Section */}
      <section id="features-section" className="py-20 px-4">
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
      <section className="py-20 px-4 bg-gray-50">
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
      <section className="py-20 px-4">
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
                      <div>+66 2 123 4567</div>
                    </div>
                  </Space>
                </div>
                <div>
                  <Space>
                    <MailOutlined className="text-primary text-xl" />
                    <div>
                      <Text strong>อีเมล</Text>
                      <div>info@luxuryhotel.com</div>
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
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format"
                  alt="Hotel Exterior"
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
}
export default HomePage;
