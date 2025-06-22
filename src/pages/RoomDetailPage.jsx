// src/pages/RoomDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Rate,
  Divider,
  Carousel,
  List,
  Avatar,
  DatePicker,
  Select,
  InputNumber,
  message,
  Badge,
  Descriptions,
  Image,
  Spin,
  Empty,
  Breadcrumb,
} from "antd";
import {
  UserOutlined,
  HomeOutlined,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  StarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import roomService from "../services/roomService";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function RoomDetailPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingParams, setBookingParams] = useState({
    dates: null,
    guests: 1,
    specialRequests: "",
  });
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
      fetchRelatedRooms();
      fetchReviews();
    }
  }, [roomId]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomById(roomId);
      setRoom(data);
    } catch (error) {
      console.error("Error fetching room details:", error);
      message.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedRooms = async () => {
    try {
      const data = await roomService.getRelatedRooms(roomId);
      setRelatedRooms(data);
    } catch (error) {
      console.error("Error fetching related rooms:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await roomService.getRoomReviews(roomId);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const checkAvailability = async () => {
    if (!bookingParams.dates || bookingParams.dates.length !== 2) {
      message.warning("กรุณาเลือกวันที่เข้าพัก");
      return;
    }

    setCheckingAvailability(true);
    try {
      const checkInDate = bookingParams.dates[0].format("YYYY-MM-DD");
      const checkOutDate = bookingParams.dates[1].format("YYYY-MM-DD");

      const isAvailable = await roomService.checkRoomAvailability(
        roomId,
        checkInDate,
        checkOutDate
      );

      if (isAvailable) {
        const priceInfo = roomService.calculateRoomPrice(
          room.room_type.base_price,
          checkInDate,
          checkOutDate
        );
        setAvailability({ available: true, ...priceInfo });
        message.success("ห้องพักว่างในช่วงวันที่ที่เลือก");
      } else {
        setAvailability({ available: false });
        message.error("ห้องพักไม่ว่างในช่วงวันที่ที่เลือก");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      message.error("เกิดข้อผิดพลาดในการตรวจสอบความพร้อม");
    } finally {
      setCheckingAvailability(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>กำลังโหลดข้อมูลห้องพัก...</Text>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ไม่พบข้อมูลห้องพัก"
        >
          <Link to="/rooms">
            <Button type="primary">กลับไปดูห้องพักอื่น</Button>
          </Link>
        </Empty>
      </div>
    );
  }
  console.log(bookingParams);
  return (
    <div className="room-detail-page">
      <div style={{ padding: "20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <Breadcrumb style={{ marginBottom: "24px" }}>
            <Breadcrumb.Item>
              <Link to="/">หน้าแรก</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/rooms">ห้องพัก</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{room.room_type.name}</Breadcrumb.Item>
          </Breadcrumb>

          {/* Back Button */}
          <div style={{ marginBottom: "24px" }}>
            <Link to="/rooms">
              <Button icon={<ArrowLeftOutlined />}>กลับไปดูห้องพักอื่น</Button>
            </Link>
          </div>

          <Row gutter={[24, 24]}>
            {/* Left Column - Room Images and Details */}
            <Col xs={24} lg={16}>
              {/* Room Images */}
              <Card style={{ marginBottom: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <Title level={3} style={{ margin: 0 }}>
                    {room.room_type.name}
                  </Title>
                  <Space style={{ marginTop: "8px" }}>
                    <Tag icon={<HomeOutlined />}>ห้อง {room.room_number}</Tag>
                    <Tag icon={<UserOutlined />}>
                      {room.room_type.capacity} คน
                    </Tag>
                    <Badge
                      status={room.status === "available" ? "success" : "error"}
                      text={
                        room.status === "available"
                          ? "พร้อมให้บริการ"
                          : "ไม่ว่าง"
                      }
                    />
                  </Space>
                </div>

                {/* Main Image and Gallery */}
                <div style={{ marginBottom: "24px" }}>
                  {room.images && room.images.length > 0 ? (
                    <Carousel autoplay>
                      {room.main_image && (
                        <div>
                          <Image
                            src={room.main_image}
                            alt={`${room.room_type.name} - Main`}
                            style={{
                              width: "100%",
                              height: "400px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      )}
                      {room.images.map((image, index) => (
                        <div key={index}>
                          <Image
                            src={image}
                            alt={`${room.room_type.name} - ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "400px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      ))}
                    </Carousel>
                  ) : room.main_image ? (
                    <Image
                      src={room.main_image}
                      alt={room.room_type.name}
                      style={{
                        width: "100%",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "400px",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                      }}
                    >
                      <Text type="secondary">ไม่มีรูปภาพ</Text>
                    </div>
                  )}
                </div>
              </Card>

              {/* Room Description */}
              <Card title="รายละเอียดห้องพัก" style={{ marginBottom: "24px" }}>
                <Paragraph style={{ fontSize: "16px", lineHeight: "1.6" }}>
                  {room.description ||
                    room.room_type.description ||
                    "ห้องพักคุณภาพดีที่ออกแบบมาเพื่อการพักผ่อนที่สมบูรณ์แบบ พร้อมสิ่งอำนวยความสะดวกครบครัน "}
                </Paragraph>

                <Divider />

                <Title level={5}>สิ่งอำนวยความสะดวก</Title>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {room.room_type.amenities &&
                  room.room_type.amenities.length > 0 ? (
                    room.room_type.amenities.map((amenity, index) => (
                      <Tag
                        key={index}
                        icon={getAmenityIcon(amenity)}
                        style={{ padding: "4px 8px" }}
                      >
                        {amenity}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">ไม่มีข้อมูลสิ่งอำนวยความสะดวก</Text>
                  )}
                </div>

                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="ขนาดห้อง">
                    {room.room_type.capacity === 1
                      ? "สำหรับ 1 คน"
                      : room.room_type.capacity === 2
                      ? "สำหรับ 2 คน"
                      : `สำหรับ ${room.room_type.capacity} คน`}
                  </Descriptions.Item>
                  <Descriptions.Item label="ราคาต่อคืน">
                    {room.room_type.base_price.toLocaleString()} บาท
                  </Descriptions.Item>
                  <Descriptions.Item label="สถานะ">
                    <Badge
                      status={room.status === "available" ? "success" : "error"}
                      text={
                        room.status === "available"
                          ? "พร้อมให้บริการ"
                          : "ไม่ว่าง"
                      }
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="เช็คอิน / เช็คเอาท์">
                    14:00 / 12:00
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Right Column - Booking Card */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    ตรวจสอบความพร้อมและจอง
                  </Space>
                }
                style={{ position: "sticky", top: "20px" }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <Title level={4} style={{ color: "#1890ff", margin: 0 }}>
                    {room.room_type.base_price.toLocaleString()} บาท
                    <Text
                      type="secondary"
                      style={{ fontSize: "14px", fontWeight: "normal" }}
                    >
                      {" "}
                      / คืน
                    </Text>
                  </Title>
                </div>

                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="large"
                >
                  <div>
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      วันที่เข้าพัก - ออก
                    </Text>
                    <RangePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder={["เช็คอิน", "เช็คเอาท์"]}
                      value={bookingParams.dates}
                      onChange={(dates) => {
                        setBookingParams({ ...bookingParams, dates });
                        setAvailability(null);
                      }}
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </div>

                  <div>
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      จำนวนผู้เข้าพัก
                    </Text>
                    <Select
                      style={{ width: "100%" }}
                      value={bookingParams.guests}
                      onChange={(value) =>
                        setBookingParams({ ...bookingParams, guests: value })
                      }
                    >
                      {Array.from(
                        { length: room.room_type.capacity },
                        (_, i) => i + 1
                      ).map((num) => (
                        <Option key={num} value={num}>
                          {num} คน
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={checkAvailability}
                    loading={checkingAvailability}
                    disabled={
                      !bookingParams.dates || room.status !== "available"
                    }
                  >
                    ตรวจสอบความพร้อม
                  </Button>

                  {availability && (
                    <Card
                      size="small"
                      style={{
                        backgroundColor: availability.available
                          ? "#f6ffed"
                          : "#fff2f0",
                      }}
                    >
                      {availability.available ? (
                        <>
                          <div style={{ marginBottom: "12px" }}>
                            <Space>
                              <CheckCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                              <Text strong style={{ color: "#52c41a" }}>
                                ห้องพักว่าง
                              </Text>
                            </Space>
                          </div>

                          <div style={{ marginBottom: "16px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px",
                              }}
                            >
                              <Text>ราคาต่อคืน:</Text>
                              <Text>
                                {availability.basePrice.toLocaleString()} บาท
                              </Text>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px",
                              }}
                            >
                              <Text>จำนวนคืน:</Text>
                              <Text>{availability.nights} คืน</Text>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                              }}
                            >
                              <Text>รวม:</Text>
                              <Text>
                                {availability.subtotal.toLocaleString()} บาท
                              </Text>
                            </div>
                            <Divider style={{ margin: "8px 0" }} />
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text strong>ราคารวมทั้งสิ้น:</Text>
                              <Text
                                strong
                                style={{ color: "#1890ff", fontSize: "16px" }}
                              >
                                {availability.total.toLocaleString()} บาท
                              </Text>
                            </div>
                          </div>

                          <Link
                            to="/booking"
                            state={{
                              roomId: room.id,
                              dates: bookingParams.dates,

                              guests: bookingParams.guests,
                              priceInfo: availability,
                            }}
                          >
                            <Button type="primary" block size="large">
                              จองเลย
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <div>
                          <Space>
                            <CheckCircleOutlined style={{ color: "#ff4d4f" }} />
                            <Text strong style={{ color: "#ff4d4f" }}>
                              ห้องพักไม่ว่าง
                            </Text>
                          </Space>
                          <div style={{ marginTop: "8px" }}>
                            <Text type="secondary">
                              ห้องพักนี้ไม่ว่างในช่วงวันที่ที่เลือก
                              กรุณาเลือกวันที่อื่น
                            </Text>
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "6px",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div style={{ display: "flex", align: "center" }}>
                        <PhoneOutlined
                          style={{ marginRight: "8px", color: "#1890ff" }}
                        />
                        <Text strong>ติดต่อโรงแรม</Text>
                      </div>
                      <Text>โทร: +66 819797986</Text>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Related Rooms */}
          {relatedRooms.length > 0 && (
            <div style={{ marginTop: "48px" }}>
              <Title level={3} style={{ marginBottom: "24px" }}>
                ห้องพักที่เกี่ยวข้อง
              </Title>
              <Row gutter={[24, 24]}>
                {relatedRooms.map((relatedRoom) => (
                  <Col xs={24} sm={12} lg={8} key={relatedRoom.id}>
                    <Card
                      hoverable
                      cover={
                        <div style={{ height: "200px", overflow: "hidden" }}>
                          <Image
                            alt={relatedRoom.room_type.name}
                            src={
                              relatedRoom.main_image ||
                              "https://via.placeholder.com/400x200"
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            preview={false}
                          />
                        </div>
                      }
                      actions={[
                        <Link to={`/rooms/${relatedRoom.id}`} key="view">
                          <Button type="link">ดูรายละเอียด</Button>
                        </Link>,
                      ]}
                    >
                      <div style={{ marginBottom: "8px" }}>
                        <Title level={5} style={{ margin: 0 }}>
                          {relatedRoom.room_type.name}
                        </Title>
                        <Text type="secondary">
                          ห้อง {relatedRoom.room_number}
                        </Text>
                      </div>
                      <div style={{ marginBottom: "8px" }}>
                        <Tag color="success">
                          {relatedRoom.room_type.base_price.toLocaleString()}{" "}
                          บาท/คืน
                        </Tag>
                      </div>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {relatedRoom.description ||
                          relatedRoom.room_type.description}
                      </Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;
