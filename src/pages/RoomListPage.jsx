// src/pages/RoomListPage.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Select,
  Slider,
  Input,
  DatePicker,
  Tag,
  Rate,
  Empty,
  Spin,
  Typography,
  Space,
  Divider,
  Badge,
  message,
  Pagination,
  Image,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  HomeOutlined,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  StarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import roomService from "../services/roomService";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function RoomListPage() {
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    roomType: "all",
    priceRange: [0, 10000],
    guests: 1,
    dates: null,
    searchTerm: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // ดึงพารามิเตอร์การค้นหาจาก state ถ้ามี
  useEffect(() => {
    if (location.state?.searchParams) {
      const searchParams = location.state.searchParams;
      setFilters({
        ...filters,
        dates: searchParams.dates,
        guests: searchParams.guests || 1,
        roomType: searchParams.roomType || "all",
      });
    }
  }, [location.state]);

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
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

  const applyFilters = () => {
    let filtered = [...rooms];

    // กรองตามประเภทห้อง
    if (filters.roomType && filters.roomType !== "all") {
      filtered = filtered.filter(
        (room) => room.room_type_id === parseInt(filters.roomType)
      );
    }

    // กรองตามช่วงราคา
    if (filters.priceRange) {
      filtered = filtered.filter(
        (room) =>
          room.room_type.base_price >= filters.priceRange[0] &&
          room.room_type.base_price <= filters.priceRange[1]
      );
    }

    // กรองตามจำนวนผู้เข้าพัก
    if (filters.guests) {
      filtered = filtered.filter(
        (room) => room.room_type.capacity >= filters.guests
      );
    }

    // กรองตามคำค้นหา
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.room_number.toLowerCase().includes(searchTerm) ||
          room.room_type.name.toLowerCase().includes(searchTerm) ||
          (room.description &&
            room.description.toLowerCase().includes(searchTerm))
      );
    }

    // แสดงเฉพาะห้องที่ว่าง
    filtered = filtered.filter((room) => room.status === "available");

    setFilteredRooms(filtered);
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    if (filters.dates && filters.dates.length === 2) {
      setLoading(true);
      try {
        const searchParams = {
          checkInDate: filters.dates[0].format("YYYY-MM-DD"),
          checkOutDate: filters.dates[1].format("YYYY-MM-DD"),
          guests: filters.guests,
          roomType: filters.roomType !== "all" ? filters.roomType : null,
        };

        const availableRooms = await roomService.searchAvailableRooms(
          searchParams
        );
        setRooms(availableRooms);
        message.success(`พบห้องพักที่ว่าง ${availableRooms.length} ห้อง`);
      } catch (error) {
        console.error("Error searching rooms:", error);
        message.error("เกิดข้อผิดพลาดในการค้นหา");
      } finally {
        setLoading(false);
      }
    } else {
      fetchRooms();
    }
  };

  const clearFilters = () => {
    setFilters({
      roomType: "all",
      priceRange: [0, 10000],
      guests: 1,
      dates: null,
      searchTerm: "",
    });
    fetchRooms();
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

  // คำนวณข้อมูลสำหรับ pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  return (
    <div className="room-list-page">
      <div style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "40px", textAlign: "center" }}>
            <Title level={2}>รายการห้องพัก</Title>
            <Paragraph style={{ fontSize: "16px", color: "#666" }}>
              เลือกห้องพักที่เหมาะกับคุณจากห้องพักคุณภาพระดับพรีเมียม
            </Paragraph>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>วันที่เข้าพัก - ออก</Text>
                </div>
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["เช็คอิน", "เช็คเอาท์"]}
                  value={filters.dates}
                  onChange={(dates) => setFilters({ ...filters, dates })}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>จำนวนผู้เข้าพัก</Text>
                </div>
                <Select
                  style={{ width: "100%" }}
                  value={filters.guests}
                  onChange={(value) =>
                    setFilters({ ...filters, guests: value })
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Option key={num} value={num}>
                      {num} คน
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>ประเภทห้อง</Text>
                </div>
                <Select
                  style={{ width: "100%" }}
                  value={filters.roomType}
                  onChange={(value) =>
                    setFilters({ ...filters, roomType: value })
                  }
                >
                  <Option value="all">ทุกประเภท</Option>
                  {roomTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>ช่วงราคา (บาท/คืน)</Text>
                </div>
                <Slider
                  range
                  min={0}
                  max={10000}
                  step={500}
                  value={filters.priceRange}
                  onChange={(value) =>
                    setFilters({ ...filters, priceRange: value })
                  }
                  tooltip={{
                    formatter: (value) => `${value?.toLocaleString()} บาท`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  <span>{filters.priceRange[0].toLocaleString()}</span>
                  <span>{filters.priceRange[1].toLocaleString()}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>ค้นหา</Text>
                </div>
                <Input
                  placeholder="ค้นหาห้อง..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                  suffix={<SearchOutlined />}
                />
              </Col>
            </Row>
            <Divider />
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                  >
                    ค้นหา
                  </Button>
                  <Button icon={<FilterOutlined />} onClick={clearFilters}>
                    ล้างตัวกรอง
                  </Button>
                </Space>
              </Col>
              <Col>
                <Text type="secondary">พบ {filteredRooms.length} ห้องพัก</Text>
              </Col>
            </Row>
          </Card>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>
                <Text>กำลังโหลดข้อมูลห้องพัก...</Text>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredRooms.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="ไม่พบห้องพักที่ตรงกับเกณฑ์การค้นหา"
              >
                <Button type="primary" onClick={clearFilters}>
                  ล้างตัวกรองและดูห้องพักทั้งหมด
                </Button>
              </Empty>
            </div>
          )}

          {/* Room Grid */}
          {!loading && currentRooms.length > 0 && (
            <>
              <Row gutter={[24, 24]}>
                {currentRooms.map((room) => (
                  <Col xs={24} sm={12} lg={8} key={room.id}>
                    <Card
                      hoverable
                      className="room-card"
                      cover={
                        <div
                          style={{
                            height: "200px",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <Image
                            alt={room.room_type.name}
                            src={
                              room.main_image ||
                              "https://via.placeholder.com/400x200?text=No+Image"
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                            }}
                            preview={false}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              background: "rgba(0,0,0,0.7)",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                            }}
                          >
                            ห้อง {room.room_number}
                          </div>
                        </div>
                      }
                      actions={[
                        <Link to={`/rooms/${room.id}`} key="view">
                          <Button type="link" icon={<EyeOutlined />}>
                            ดูรายละเอียด
                          </Button>
                        </Link>,
                        <Link
                          to="/booking"
                          state={{ roomId: room.id }}
                          key="book"
                        >
                          <Button type="primary">จองเลย</Button>
                        </Link>,
                      ]}
                    >
                      <div style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <Title level={4} style={{ margin: 0 }}>
                            {room.room_type.name}
                          </Title>
                          <Tag
                            color="success"
                            style={{ fontSize: "14px", padding: "2px 8px" }}
                          >
                            {room.room_type.base_price.toLocaleString()} บาท/คืน
                          </Tag>
                        </div>

                        <Space style={{ marginBottom: "12px" }}>
                          <Tag icon={<UserOutlined />}>
                            {room.room_type.capacity} คน
                          </Tag>
                          <Tag color="blue">
                            {room.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                          </Tag>
                        </Space>
                      </div>

                      <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ marginBottom: "12px", minHeight: "40px" }}
                      >
                        {room.description ||
                          room.room_type.description ||
                          "ห้องพักคุณภาพดีพร้อมสิ่งอำนวยความสะดวกครบครัน"}
                      </Paragraph>

                      <div style={{ marginBottom: "12px" }}>
                        <Text
                          strong
                          style={{ marginBottom: "8px", display: "block" }}
                        >
                          สิ่งอำนวยความสะดวก:
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                          }}
                        >
                          {room.room_type.amenities &&
                          room.room_type.amenities.length > 0 ? (
                            room.room_type.amenities
                              .slice(0, 4)
                              .map((amenity, index) => (
                                <Tag
                                  key={index}
                                  icon={getAmenityIcon(amenity)}
                                  size="small"
                                >
                                  {amenity}
                                </Tag>
                              ))
                          ) : (
                            <Text type="secondary">ไม่มีข้อมูล</Text>
                          )}
                          {room.room_type.amenities &&
                            room.room_type.amenities.length > 4 && (
                              <Tag size="small">
                                +{room.room_type.amenities.length - 4}
                              </Tag>
                            )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Rate
                            disabled
                            defaultValue={4}
                            style={{ fontSize: "14px" }}
                          />
                          <Text
                            type="secondary"
                            style={{ fontSize: "12px", marginLeft: "8px" }}
                          >
                            (4.0)
                          </Text>
                        </div>
                        <Badge status="success" text="พร้อมให้บริการ" />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {filteredRooms.length > pageSize && (
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                  <Pagination
                    current={currentPage}
                    total={filteredRooms.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} จาก ${total} ห้อง`
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .room-card .ant-card-cover img:hover {
          transform: scale(1.05);
        }

        .room-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .room-card .ant-card-actions {
          background: #fafafa;
        }
      `}</style>
    </div>
  );
}

export default RoomListPage;
