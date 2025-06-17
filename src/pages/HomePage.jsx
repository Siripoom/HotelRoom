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
import { supabase } from "../lib/supabase";

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
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    dates: null,
    guests: 1,
    roomType: "all",
  });

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const fetchFeaturedRooms = async () => {
    setLoading(true);
    try {
      // ในโปรเจคจริง: ดึงข้อมูลจาก Supabase
      /*
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          main_image,
          description,
          status,
          room_type:room_type_id (
            id,
            name,
            base_price,
            capacity,
            amenities
          )
        `)
        .eq('status', 'available')
        .limit(3);
        
      if (error) throw error;
      setFeaturedRooms(data);
      */

      // Mock data สำหรับตัวอย่าง
      const mockFeaturedRooms = [
        {
          id: 1,
          room_number: "101",
          main_image:
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format",
          description:
            "ห้องพักหรูหราที่ตกแต่งอย่างสวยงาม พร้อมวิวภูเขาที่สวยงาม เหมาะสำหรับการพักผ่อน",
          status: "available",
          room_type: {
            id: 1,
            name: "Deluxe Room",
            base_price: 2500,
            capacity: 2,
            amenities: ["Free WiFi", "Air Conditioning", "Mini Bar", "TV"],
          },
        },
        {
          id: 2,
          room_number: "201",
          main_image:
            "https://images.unsplash.com/photo-1587985064135-0366536eab42?q=80&w=800&auto=format",
          description:
            "ห้องสวีทหรูหรา กว้างขวาง พร้อมวิวทะเลที่สวยงาม มีอ่างจากุซซี่ส่วนตัว",
          status: "available",
          room_type: {
            id: 2,
            name: "Executive Suite",
            base_price: 4500,
            capacity: 2,
            amenities: [
              "Free WiFi",
              "Air Conditioning",
              "Jacuzzi",
              "Mini Bar",
              "TV",
              "Balcony",
            ],
          },
        },
        {
          id: 3,
          room_number: "301",
          main_image:
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format",
          description:
            "ห้องพักสำหรับครอบครัว กว้างขวาง พร้อมเตียงขนาดใหญ่ และเตียงเสริม",
          status: "available",
          room_type: {
            id: 3,
            name: "Family Room",
            base_price: 3500,
            capacity: 4,
            amenities: [
              "Free WiFi",
              "Air Conditioning",
              "Mini Bar",
              "TV",
              "Extra Bed",
            ],
          },
        },
      ];

      // จำลองการโหลดข้อมูล
      setTimeout(() => {
        setFeaturedRooms(mockFeaturedRooms);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching featured rooms:", error);
      message.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchParams.dates) {
      message.warning("กรุณาเลือกวันที่เข้าพัก");
      return;
    }

    // ในโปรเจคจริง: บันทึกพารามิเตอร์การค้นหาและนำทางไปยังหน้ารายการห้องพัก
    console.log("Search params:", searchParams);
    message.success("กำลังค้นหาห้องพัก...");
    // navigate('/rooms', { state: { searchParams } });
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
                KR .place
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-center max-w-3xl">
                เค อาร์ เพลส
              </p>
              <Button
                type="primary"
                size="large"
                className="text-lg h-12 px-8"
                onClick={() =>
                  document
                    .getElementById("booking-section")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                จองห้องพักเลย
              </Button>
            </div>
          </div>
          <div className="h-[600px] relative">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format')",
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
                  <Option value="1">Deluxe Room</Option>
                  <Option value="2">Executive Suite</Option>
                  <Option value="3">Family Room</Option>
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
            {loading
              ? // Loading skeletons
                Array(3)
                  .fill()
                  .map((_, index) => (
                    <Col xs={24} md={8} key={`skeleton-${index}`}>
                      <Card
                        className="h-full"
                        cover={
                          <Skeleton.Image className="w-full h-48" active />
                        }
                      >
                        <Skeleton active paragraph={{ rows: 3 }} />
                      </Card>
                    </Col>
                  ))
              : featuredRooms.map((room) => (
                  <Col xs={24} md={8} key={room.id}>
                    <Card
                      hoverable
                      className="h-full shadow-md transition-all duration-300 hover:shadow-xl"
                      cover={
                        <div className="h-48 overflow-hidden">
                          <img
                            alt={room.room_type.name}
                            src={room.main_image}
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
                        {room.description}
                      </Paragraph>
                      <div className="mb-4">
                        {room.room_type.amenities
                          .slice(0, 3)
                          .map((amenity, index) => (
                            <Tag key={index} className="mb-1 mr-1">
                              {amenity}
                            </Tag>
                          ))}
                        {room.room_type.amenities.length > 3 && (
                          <Tag className="mb-1">
                            +{room.room_type.amenities.length - 3}
                          </Tag>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <Link to={`/rooms/${room.id}`}>
                          <Button type="link" className="p-0">
                            ดูรายละเอียด <RightOutlined />
                          </Button>
                        </Link>
                        <Link to="/booking" state={{ roomId: room.id }}>
                          <Button type="primary">จองเลย</Button>
                        </Link>
                      </div>
                    </Card>
                  </Col>
                ))}
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
    </div>
  );
}
export default HomePage;
