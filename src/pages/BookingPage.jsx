// src/pages/BookingPage.jsx - ปรับปรุงให้เลือกวันที่ใหม่ได้
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
  SearchOutlined,
} from "@ant-design/icons";
import roomService from "../services/roomService";
import customerService from "../services/customerService";
import bookingService from "../services/bookingService";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // ข้อมูลการจอง
  const [bookingData, setBookingData] = useState({
    roomId: null,
    room: null,
    checkInDate: null, // string format YYYY-MM-DD
    checkOutDate: null, // string format YYYY-MM-DD
    dates: null, // dayjs objects สำหรับแสดงผล
    guests: 1,
    priceInfo: null,
    customerInfo: null,
    specialRequests: "",
  });

  // state สำหรับการเลือกวันที่ใหม่
  const [needDateSelection, setNeedDateSelection] = useState(false);
  const [tempDates, setTempDates] = useState(null);
  const [tempGuests, setTempGuests] = useState(1);

  useEffect(() => {
    console.log("BookingPage - location.state:", location.state);

    // รับข้อมูลจาก state ที่ส่งมาจากหน้าอื่น
    if (location.state) {
      const {
        roomId,
        room: roomData,
        checkInDate,
        checkOutDate,
        guests,
        priceInfo,
      } = location.state;

      console.log("BookingPage - received data:", {
        roomId,
        room: roomData,
        checkInDate,
        checkOutDate,
        guests,
        priceInfo,
      });

      // ตรวจสอบว่ามีวันที่หรือไม่
      const hasDates = checkInDate && checkOutDate;

      // แปลงวันที่ string กลับเป็น dayjs objects สำหรับแสดงผล
      const dates = hasDates ? [dayjs(checkInDate), dayjs(checkOutDate)] : null;

      // ตั้งค่าข้อมูลการจอง
      setBookingData({
        roomId,
        room: roomData,
        checkInDate: hasDates ? checkInDate : null,
        checkOutDate: hasDates ? checkOutDate : null,
        dates, // สำหรับแสดงผล
        guests: guests || 1,
        priceInfo: hasDates ? priceInfo : null,
        customerInfo: null,
        specialRequests: "",
      });

      // ถ้าไม่มีวันที่ ให้แสดงส่วนเลือกวันที่
      if (!hasDates) {
        setNeedDateSelection(true);
        setTempGuests(guests || 1);
      }

      // ถ้ามีข้อมูลห้องแล้ว
      if (roomData) {
        setRoom(roomData);
        setLoading(false);
      } else if (roomId) {
        // ถ้าไม่มีข้อมูลห้อง ให้ดึงจาก API
        fetchRoomDetails(roomId);
      }
    } else {
      console.log("BookingPage - No state data, redirecting to rooms");
      message.error("ไม่พบข้อมูลการจอง กรุณาเลือกห้องพักใหม่");
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

      // อัปเดตข้อมูลห้องในบุคกิ้งดาต้า
      setBookingData((prev) => ({
        ...prev,
        room: data,
      }));
    } catch (error) {
      console.error("Error fetching room details:", error);
      message.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบความพร้อมของห้องพัก
  const checkAvailability = async () => {
    if (!tempDates || tempDates.length !== 2) {
      message.warning("กรุณาเลือกวันที่เข้าพัก");
      return;
    }

    setCheckingAvailability(true);
    try {
      const checkInDate = tempDates[0].format("YYYY-MM-DD");
      const checkOutDate = tempDates[1].format("YYYY-MM-DD");

      const isAvailable = await roomService.checkRoomAvailability(
        bookingData.roomId,
        checkInDate,
        checkOutDate
      );

      if (isAvailable) {
        const priceInfo = roomService.calculateRoomPrice(
          room.room_type.base_price,
          checkInDate,
          checkOutDate
        );

        // อัปเดตข้อมูลการจอง
        setBookingData((prev) => ({
          ...prev,
          checkInDate,
          checkOutDate,
          dates: tempDates,
          guests: tempGuests,
          priceInfo,
        }));

        setNeedDateSelection(false);
        message.success("ห้องพักว่างในช่วงวันที่ที่เลือก");
      } else {
        message.error(
          "ห้องพักไม่ว่างในช่วงวันที่ที่เลือก กรุณาเลือกวันที่อื่น"
        );
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      message.error("เกิดข้อผิดพลาดในการตรวจสอบความพร้อม");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCustomerInfoSubmit = async (values) => {
    try {
      setSubmitting(true);

      // สร้างข้อมูลลูกค้า
      const customerInfo = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
      };

      setBookingData((prev) => ({
        ...prev,
        customerInfo: customerInfo,
        specialRequests: values.specialRequests || "",
      }));

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

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!bookingData.customerInfo) {
        message.error("กรุณากรอกข้อมูลลูกค้า");
        return;
      }

      if (!bookingData.checkInDate || !bookingData.checkOutDate) {
        message.error("กรุณาเลือกวันที่เข้าพัก");
        return;
      }

      if (!bookingData.priceInfo) {
        message.error("ไม่พบข้อมูลราคา กรุณาตรวจสอบความพร้อมอีกครั้ง");
        return;
      }

      // สร้างลูกค้าก่อน
      const customer = await customerService.createCustomer(
        bookingData.customerInfo
      );

      // สร้างการจอง - ใช้วันที่ในรูปแบบ string
      const newBooking = await bookingService.createBooking({
        customer_id: customer.id,
        room_id: bookingData.roomId,
        check_in_date: bookingData.checkInDate,
        check_out_date: bookingData.checkOutDate,
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

    try {
      // ถ้าเป็น string format YYYY-MM-DD
      if (typeof date === "string") {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

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
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: "24px" }}>
          <Breadcrumb.Item>
            <Button
              type="link"
              onClick={() => navigate("/")}
              style={{ padding: 0 }}
            >
              หน้าแรก
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Button
              type="link"
              onClick={() => navigate("/rooms")}
              style={{ padding: 0 }}
            >
              ห้องพัก
            </Button>
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
            <Button size="small" onClick={() => navigate("/rooms")}>
              เริ่มการจองใหม่
            </Button>
          </div>
        </div>

        {/* ส่วนเลือกวันที่ (แสดงเมื่อไม่มีวันที่) */}
        {needDateSelection && (
          <Card
            title={
              <Space>
                <CalendarOutlined />
                เลือกวันที่เข้าพัก
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <Alert
              message="กรุณาเลือกวันที่เข้าพักและตรวจสอบความพร้อม"
              description="เพื่อดำเนินการจองต่อไป"
              type="info"
              showIcon
              style={{ marginBottom: "24px" }}
            />

            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>วันที่เข้าพัก - ออก</Text>
                </div>
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["เช็คอิน", "เช็คเอาท์"]}
                  value={tempDates}
                  onChange={setTempDates}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>จำนวนผู้เข้าพัก</Text>
                </div>
                <Select
                  style={{ width: "100%" }}
                  value={tempGuests}
                  onChange={setTempGuests}
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
              </Col>
              <Col xs={24} sm={4}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={checkAvailability}
                  loading={checkingAvailability}
                  disabled={!tempDates || tempDates.length !== 2}
                  style={{ width: "100%" }}
                >
                  ตรวจสอบ
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* แสดง Steps และ Form เฉพาะเมื่อมีข้อมูลวันที่แล้ว */}
        {!needDateSelection && (
          <>
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
                            rules={[
                              { required: true, message: "กรุณากรอกชื่อ" },
                            ]}
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
                              {
                                type: "email",
                                message: "รูปแบบอีเมลไม่ถูกต้อง",
                              },
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
                              {
                                required: true,
                                message: "กรุณากรอกเบอร์โทรศัพท์",
                              },
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
                        {bookingData.checkInDate
                          ? formatDate(bookingData.checkInDate)
                          : "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันที่ออก">
                        {bookingData.checkOutDate
                          ? formatDate(bookingData.checkOutDate)
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
                          onClick={() => {
                            setNeedDateSelection(true);
                            setCurrentStep(0);
                          }}
                        >
                          เปลี่ยนวันที่
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          loading={submitting}
                          onClick={handleCreateBooking}
                        >
                          ยืนยันการจอง
                        </Button>
                      </Space>
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
                      src={
                        room.main_image || "https://via.placeholder.com/400x200"
                      }
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
                  {bookingData.checkInDate &&
                    bookingData.checkOutDate &&
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
                              {bookingData.checkInDate
                                ? formatDate(bookingData.checkInDate)
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
                              {bookingData.checkOutDate
                                ? formatDate(bookingData.checkOutDate)
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
                                -
                                {bookingData.priceInfo.discount.toLocaleString()}{" "}
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
                            {bookingData.priceInfo.total?.toLocaleString() || 0}{" "}
                            บาท
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
          </>
        )}

        {/* แสดงข้อมูลห้องพักเมื่อกำลังเลือกวันที่ */}
        {needDateSelection && (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title="ข้อมูลห้องพัก">
                <div style={{ marginBottom: "16px" }}>
                  <Image
                    src={
                      room.main_image || "https://via.placeholder.com/600x300"
                    }
                    alt={room.room_type.name}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <Title level={3}>{room.room_type.name}</Title>
                  <Text type="secondary">ห้อง {room.room_number}</Text>
                </div>

                <Space wrap style={{ marginBottom: "16px" }}>
                  <Tag>ความจุ: {room.room_type.capacity} คน</Tag>
                  <Tag color="success">
                    {room.room_type.base_price.toLocaleString()} บาท/คืน
                  </Tag>
                </Space>

                {room.description && (
                  <Paragraph style={{ marginBottom: "16px" }}>
                    {room.description}
                  </Paragraph>
                )}

                {room.room_type.amenities &&
                  room.room_type.amenities.length > 0 && (
                    <div>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "8px" }}
                      >
                        สิ่งอำนวยความสะดวก:
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {room.room_type.amenities.map((amenity, index) => (
                          <Tag key={index}>{amenity}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title="ข้อมูลการจอง"
                style={{ position: "sticky", top: "20px" }}
              >
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
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

                <Alert
                  message="เลือกวันที่เพื่อเริ่มต้นการจอง"
                  description="กรุณาเลือกวันที่เข้าพักและตรวจสอบความพร้อมก่อน"
                  type="info"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />

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
                        ห้องพักสามารถรองรับได้สูงสุด {room.room_type.capacity}{" "}
                        คน
                      </Text>
                    </li>
                    <li>
                      <Text style={{ fontSize: "14px" }}>
                        ราคาอาจเปลี่ยนแปลงตามช่วงเวลา
                      </Text>
                    </li>
                  </ul>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
