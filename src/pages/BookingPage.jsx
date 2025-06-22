// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Form,
  Input,
  DatePicker,
  Select,
  Steps,
  Descriptions,
  Divider,
  Space,
  message,
  Image,
  Tag,
  Breadcrumb,
  Alert,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import roomService from "../services/roomService";
import customerService from "../services/customerService";
import bookingService from "../services/bookingService";
import { bookingStorageUtils } from "../utils/bookingStorageUtils";

// หมายเหตุ: ไม่ใช้ dayjs เพื่อหลีกเลี่ยงปัญหา clone function

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ข้อมูลการจอง
  const [bookingData, setBookingData] = useState({
    roomId: null,
    dates: null,
    guests: 1,
    priceInfo: null,
    customerInfo: null,
    specialRequests: "",
  });

  useEffect(() => {
    console.log("BookingPage - location.state:", location.state);

    // รับข้อมูลจาก state ที่ส่งมาจากหน้าอื่น
    if (location.state) {
      const { roomId, dates, guests, priceInfo } = location.state;
      console.log("BookingPage - received data:", {
        roomId,
        dates,
        guests,
        priceInfo,
      });
      console.log("BookingPage - dates type:", typeof dates, dates);

      setBookingData({
        roomId,
        dates,
        guests,
        priceInfo,
        customerInfo: null,
        specialRequests: "",
      });

      if (roomId) {
        fetchRoomDetails(roomId);
      }
    } else {
      console.log("BookingPage - No state data, redirecting to rooms");
      // ถ้าไม่มีข้อมูล redirect กลับไปหน้าห้องพัก
      navigate("/rooms");
    }
  }, [location.state, navigate]);

  const fetchRoomDetails = async (roomId) => {
    console.log("BookingPage - fetchRoomDetails for roomId:", roomId);
    setLoading(true);
    try {
      const data = await roomService.getRoomById(roomId);
      console.log("BookingPage - room data received:", data);
      setRoom(data);
    } catch (error) {
      console.error("Error fetching room details:", error);
      message.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInfoSubmit = async (values) => {
    try {
      setSubmitting(true);

      // สร้างข้อมูลลูกค้าโดยไม่ต้องเช็คในฐานข้อมูล
      const customerInfo = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
      };

      setBookingData({
        ...bookingData,
        customerInfo: customerInfo,
        specialRequests: values.specialRequests || "",
      });

      setCurrentStep(1);
      message.success("บันทึกข้อมูลลูกค้าสำเร็จ");
    } catch (error) {
      console.error("Error saving customer info:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกค้า");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBooking = async () => {
    try {
      setSubmitting(true);

      // สร้างลูกค้าก่อน
      const customer = await customerService.createCustomer(
        bookingData.customerInfo
      );

      // แปลงวันที่เป็น string format
      let checkInDate, checkOutDate;

      if (bookingData.dates && bookingData.dates.length === 2) {
        // ถ้าเป็น dayjs object
        if (
          bookingData.dates[0] &&
          typeof bookingData.dates[0] === "object" &&
          bookingData.dates[0].format
        ) {
          checkInDate = bookingData.dates[0].format("YYYY-MM-DD");
          checkOutDate = bookingData.dates[1].format("YYYY-MM-DD");
        }
        // ถ้าเป็น Date object หรือ string
        else {
          const date1 = new Date(bookingData.dates[0]);
          const date2 = new Date(bookingData.dates[1]);

          checkInDate = date1.toISOString().split("T")[0];
          checkOutDate = date2.toISOString().split("T")[0];
        }
      }

      // สร้างการจอง
      const newBooking = await bookingService.createBooking({
        customer_id: customer.id,
        room_id: bookingData.roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: bookingData.priceInfo.total,
        special_requests: bookingData.specialRequests,
      });

      message.success("สร้างการจองสำเร็จ!");

      // นำทางไปหน้าชำระเงิน
      navigate(`/payment/${newBooking.id}`, {
        state: {
          booking: newBooking,
          room: room,
          priceInfo: bookingData.priceInfo,
        },
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      message.error("เกิดข้อผิดพลาดในการสร้างการจอง: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    console.log("formatDate - input:", date, "type:", typeof date);

    try {
      // ถ้าเป็น dayjs object
      if (
        date &&
        typeof date === "object" &&
        date.format &&
        typeof date.format === "function"
      ) {
        return date.format("DD/MM/YYYY");
      }

      // ถ้าเป็น Date object
      if (date instanceof Date) {
        return date.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      // ถ้าเป็น string
      if (typeof date === "string") {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      // ถ้าไม่ใช่รูปแบบที่รู้จัก ลองใช้ dayjs

      return "";
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "";
    }
  };

  const steps = [
    {
      title: "ข้อมูลลูกค้า",
      icon: <UserOutlined />,
    },
    {
      title: "ยืนยันการจอง",
      icon: <CalendarOutlined />,
    },
  ];

  if (loading || !room || !bookingData.roomId) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <div>กำลังโหลดข้อมูล...</div>
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          Debug: loading={loading.toString()}, room={room ? "exists" : "null"},
          roomId={bookingData.roomId || "null"}
        </div>
      </div>
    );
  }

  // เพิ่มการตรวจสอบข้อมูลวันที่
  console.log("BookingPage - render bookingData:", bookingData);
  console.log("BookingPage - render dates:", bookingData.dates);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: "24px" }}>
          <Breadcrumb.Item>
            <a href="/">หน้าแรก</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href="/rooms">ห้องพัก</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>จองห้องพัก</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Title level={2}>จองห้องพัก</Title>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary">
              กรอกข้อมูลเพื่อทำการจองห้องพัก {room.room_type.name}
            </Text>
            {bookingStorageUtils.hasBookingInfo() && (
              <Button
                size="small"
                onClick={() => {
                  bookingStorageUtils.clearBookingInfo();
                  navigate("/rooms");
                }}
              >
                เริ่มการจองใหม่
              </Button>
            )}
          </div>
        </div>

        {/* Steps */}
        <Card style={{ marginBottom: "24px" }}>
          <Steps current={currentStep} items={steps} />
        </Card>

        <Row gutter={[24, 24]}>
          {/* Left Column - Form */}
          <Col xs={24} lg={14}>
            {/* Step 1: Customer Information */}
            {currentStep === 0 && (
              <Card title="ข้อมูลลูกค้า">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleCustomerInfoSubmit}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        label="ชื่อ"
                        rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                      >
                        <Input placeholder="กรอกชื่อ" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        label="นามสกุล"
                        rules={[
                          { required: true, message: "กรุณากรอกนามสกุล" },
                        ]}
                      >
                        <Input placeholder="กรอกนามสกุล" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="อีเมล"
                        rules={[
                          { required: true, message: "กรุณากรอกอีเมล" },
                          { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                        ]}
                      >
                        <Input placeholder="example@email.com" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="เบอร์โทรศัพท์"
                        rules={[
                          { required: true, message: "กรุณากรอกเบอร์โทรศัพท์" },
                        ]}
                      >
                        <Input placeholder="08x-xxx-xxxx" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="specialRequests" label="คำขอพิเศษ">
                    <TextArea
                      rows={4}
                      placeholder="ระบุคำขอพิเศษ เช่น ต้องการห้องชั้นสูง, เตียงเสริม ฯลฯ (ถ้ามี)"
                    />
                  </Form.Item>

                  <div style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={submitting}
                    >
                      ถัดไป
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

            {/* Step 2: Booking Confirmation */}
            {currentStep === 1 && (
              <Card title="ยืนยันการจอง">
                <Alert
                  message="กรุณาตรวจสอบข้อมูลการจองให้ถูกต้อง"
                  description="เมื่อกดยืนยันการจอง ระบบจะสร้างการจองและนำคุณไปยังหน้าชำระเงิน"
                  type="info"
                  showIcon
                  style={{ marginBottom: "24px" }}
                />

                <Descriptions column={1} bordered>
                  <Descriptions.Item label="ลูกค้า">
                    {bookingData.customerInfo?.first_name}{" "}
                    {bookingData.customerInfo?.last_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="อีเมล">
                    {bookingData.customerInfo?.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="เบอร์โทรศัพท์">
                    {bookingData.customerInfo?.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="ห้องพัก">
                    {room.room_type.name} (ห้อง {room.room_number})
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่เข้าพัก">
                    {bookingData.dates && bookingData.dates[0]
                      ? formatDate(bookingData.dates[0])
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่ออก">
                    {bookingData.dates && bookingData.dates[1]
                      ? formatDate(bookingData.dates[1])
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="จำนวนผู้เข้าพัก">
                    {bookingData.guests} คน
                  </Descriptions.Item>
                  <Descriptions.Item label="จำนวนคืน">
                    {bookingData.priceInfo?.nights} คืน
                  </Descriptions.Item>
                  {bookingData.specialRequests && (
                    <Descriptions.Item label="คำขอพิเศษ">
                      {bookingData.specialRequests}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <div style={{ marginTop: "24px", textAlign: "right" }}>
                  <Space>
                    <Button onClick={() => setCurrentStep(0)}>
                      กลับไปแก้ไข
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      loading={submitting}
                      onClick={handleCreateBooking}
                      disabled={
                        !bookingData.dates ||
                        !bookingData.dates[0] ||
                        !bookingData.dates[1] ||
                        !bookingData.priceInfo
                      }
                    >
                      ยืนยันการจอง
                    </Button>
                  </Space>
                  {(!bookingData.dates ||
                    !bookingData.dates[0] ||
                    !bookingData.dates[1] ||
                    !bookingData.priceInfo) && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#ff4d4f",
                      }}
                    >
                      *
                      กรุณาเลือกวันที่เข้าพักและตรวจสอบความพร้อมก่อนยืนยันการจอง
                    </div>
                  )}
                </div>
              </Card>
            )}
          </Col>

          {/* Right Column - Booking Summary */}
          <Col xs={24} lg={10}>
            <Card
              title="สรุปการจอง"
              style={{ position: "sticky", top: "20px" }}
            >
              {/* Room Image */}
              <div style={{ marginBottom: "16px" }}>
                <Image
                  src={room.main_image || "https://via.placeholder.com/400x200"}
                  alt={room.room_type.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>

              {/* Room Info */}
              <div style={{ marginBottom: "16px" }}>
                <Title level={4} style={{ margin: 0 }}>
                  {room.room_type.name}
                </Title>
                <Text type="secondary">ห้อง {room.room_number}</Text>
              </div>

              <Space wrap style={{ marginBottom: "16px" }}>
                <Tag>จำนวนผู้เข้าพัก: {bookingData.guests} คน</Tag>
                <Tag>ความจุ: {room.room_type.capacity} คน</Tag>
              </Space>

              <Divider />

              {/* Booking Details */}
              {bookingData.dates &&
                bookingData.dates.length === 2 &&
                bookingData.priceInfo && (
                  <>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>วันที่เข้าพัก:</Text>
                        <Text strong>
                          {bookingData.dates && bookingData.dates[0]
                            ? formatDate(bookingData.dates[0])
                            : "-"}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>วันที่ออก:</Text>
                        <Text strong>
                          {bookingData.dates && bookingData.dates[1]
                            ? formatDate(bookingData.dates[1])
                            : "-"}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>จำนวนคืน:</Text>
                        <Text strong>
                          {bookingData.priceInfo?.nights || 0} คืน
                        </Text>
                      </div>
                    </div>

                    <Divider />

                    {/* Price Breakdown */}
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>ราคาต่อคืน:</Text>
                        <Text>
                          {bookingData.priceInfo.basePrice?.toLocaleString() ||
                            0}{" "}
                          บาท
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text>
                          รวม {bookingData.priceInfo.nights || 0} คืน:
                        </Text>
                        <Text>
                          {bookingData.priceInfo.subtotal?.toLocaleString() ||
                            0}{" "}
                          บาท
                        </Text>
                      </div>
                      {bookingData.priceInfo.discount > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <Text>ส่วนลด:</Text>
                          <Text style={{ color: "#52c41a" }}>
                            -{bookingData.priceInfo.discount.toLocaleString()}{" "}
                            บาท
                          </Text>
                        </div>
                      )}
                    </div>

                    <Divider />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                      }}
                    >
                      <Text strong style={{ fontSize: "18px" }}>
                        ราคารวมทั้งสิ้น:
                      </Text>
                      <Text
                        strong
                        style={{ fontSize: "20px", color: "#1890ff" }}
                      >
                        {bookingData.priceInfo.total?.toLocaleString() || 0} บาท
                      </Text>
                    </div>
                  </>
                )}

              {/* Important Notes */}
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f6ffed",
                  borderRadius: "6px",
                  border: "1px solid #b7eb8f",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <InfoCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text strong style={{ color: "#52c41a" }}>
                    ข้อมูลสำคัญ
                  </Text>
                </div>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li>
                    <Text style={{ fontSize: "14px" }}>
                      เช็คอิน: 14:00 น. / เช็คเอาท์: 12:00 น.
                    </Text>
                  </li>
                  <li>
                    <Text style={{ fontSize: "14px" }}>
                      กรุณาชำระเงินภายใน 24 ชั่วโมงหลังจองเพื่อยืนยันการจอง
                    </Text>
                  </li>
                  <li>
                    <Text style={{ fontSize: "14px" }}>
                      สามารถยกเลิกการจองได้ก่อนวันเข้าพัก 3 วัน
                    </Text>
                  </li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default BookingPage;
