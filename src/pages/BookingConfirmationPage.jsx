// src/pages/BookingConfirmationPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Divider,
  Image,
  QRCode,
  Alert,
  Timeline,
  Empty,
  Spin,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import bookingService from "../services/bookingService";

const { Title, Text, Paragraph } = Typography;

function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      message.error("ไม่สามารถโหลดข้อมูลการจองได้");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH");
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "รอการยืนยัน";
      case "confirmed":
        return "ยืนยันแล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "gold";
      case "confirmed":
        return "green";
      case "completed":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "pending":
        return "รอการยืนยัน";
      case "confirmed":
        return "ชำระแล้ว";
      case "rejected":
        return "ปฏิเสธ";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "gold";
      case "confirmed":
        return "green";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // สร้าง PDF หรือ image ของใบยืนยัน (ในที่นี้จะเป็น mock)
    message.info("กำลังเตรียมไฟล์ดาวน์โหลด...");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>กำลังโหลดข้อมูลการจอง...</Text>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ไม่พบข้อมูลการจอง"
        >
          <Link to="/rooms">
            <Button type="primary">ดูห้องพักอื่น</Button>
          </Link>
        </Empty>
      </div>
    );
  }

  const timelineItems = [
    {
      color: "green",
      dot: <CheckCircleOutlined />,
      children: (
        <div>
          <Text strong>สร้างการจอง</Text>
          <div style={{ marginTop: "4px" }}>
            <Text type="secondary">{formatDateTime(booking.created_at)}</Text>
          </div>
        </div>
      ),
    },
  ];

  // เพิ่ม timeline items ตามสถานะ
  if (booking.payments && booking.payments.length > 0) {
    const payment = booking.payments[0];
    timelineItems.push({
      color: payment.status === "confirmed" ? "green" : "gold",
      dot:
        payment.status === "confirmed" ? (
          <CheckCircleOutlined />
        ) : (
          <ClockCircleOutlined />
        ),
      children: (
        <div>
          <Text strong>
            {payment.status === "confirmed"
              ? "ยืนยันการชำระเงิน"
              : "ส่งหลักฐานการชำระเงิน"}
          </Text>
          <div style={{ marginTop: "4px" }}>
            <Text type="secondary">{formatDateTime(payment.payment_date)}</Text>
          </div>
        </div>
      ),
    });
  }

  if (booking.status === "confirmed") {
    timelineItems.push({
      color: "green",
      dot: <CheckCircleOutlined />,
      children: (
        <div>
          <Text strong>ยืนยันการจอง</Text>
          <div style={{ marginTop: "4px" }}>
            <Text type="secondary">การจองได้รับการยืนยันแล้ว</Text>
          </div>
        </div>
      ),
    });
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <CheckCircleOutlined
            style={{
              fontSize: "64px",
              color: booking.status === "confirmed" ? "#52c41a" : "#faad14",
              marginBottom: "16px",
            }}
          />
          <Title level={2} style={{ marginBottom: "8px" }}>
            {booking.status === "confirmed" ? "การจองสำเร็จ!" : "รอการยืนยัน"}
          </Title>
          <Text style={{ fontSize: "16px", color: "#666" }}>
            เลขที่การจอง: <Text strong>{booking.booking_number}</Text>
          </Text>
        </div>

        {/* Status Alert */}
        {booking.status === "pending" && (
          <Alert
            message="การจองของคุณอยู่ระหว่างการตรวจสอบ"
            description="เราจะตรวจสอบการชำระเงินและส่งอีเมลยืนยันให้คุณภายใน 24 ชั่วโมง"
            type="warning"
            showIcon
            style={{ marginBottom: "24px" }}
          />
        )}

        {booking.status === "confirmed" && (
          <Alert
            message="การจองได้รับการยืนยันแล้ว"
            description="ยินดีต้อนรับสู่ KR .place Hotel กรุณาเตรียมตัวสำหรับการเข้าพัก"
            type="success"
            showIcon
            style={{ marginBottom: "24px" }}
          />
        )}

        <Row gutter={[24, 24]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Booking Details */}
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  รายละเอียดการจอง
                </Space>
              }
              extra={
                <Space>
                  <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                    พิมพ์
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                    ดาวน์โหลด
                  </Button>
                </Space>
              }
              style={{ marginBottom: "24px" }}
            >
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="เลขที่การจอง" span={2}>
                  <Text strong style={{ fontSize: "16px" }}>
                    {booking.booking_number}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="สถานะการจอง">
                  <Tag color={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="สถานะการชำระเงิน">
                  <Tag color={getPaymentStatusColor(booking.payment_status)}>
                    {getPaymentStatusText(booking.payment_status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ห้องพัก">
                  {booking.room?.room_number} - {booking.room?.room_type?.name}
                </Descriptions.Item>
                <Descriptions.Item label="ความจุ">
                  {booking.room?.room_type?.capacity} คน
                </Descriptions.Item>
                <Descriptions.Item label="วันที่เข้าพัก">
                  {formatDate(booking.check_in_date)}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่ออก">
                  {formatDate(booking.check_out_date)}
                </Descriptions.Item>
                <Descriptions.Item label="จำนวนคืน">
                  {Math.ceil(
                    (new Date(booking.check_out_date) -
                      new Date(booking.check_in_date)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  คืน
                </Descriptions.Item>
                <Descriptions.Item label="ราคารวม">
                  <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                    {booking.total_price?.toLocaleString()} บาท
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {booking.special_requests && (
                <>
                  <Divider />
                  <div>
                    <Text strong>คำขอพิเศษ:</Text>
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "12px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "6px",
                      }}
                    >
                      {booking.special_requests}
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Customer Information */}
            <Card
              title={
                <Space>
                  <UserOutlined />
                  ข้อมูลลูกค้า
                </Space>
              }
              style={{ marginBottom: "24px" }}
            >
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="ชื่อ-นามสกุล">
                  {booking.customer?.first_name} {booking.customer?.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="อีเมล">
                  {booking.customer?.email}
                </Descriptions.Item>
                <Descriptions.Item label="เบอร์โทรศัพท์">
                  {booking.customer?.phone}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่สร้างการจอง">
                  {formatDateTime(booking.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Payment Information */}
            {booking.payments && booking.payments.length > 0 && (
              <Card
                title={
                  <Space>
                    <DollarOutlined />
                    ข้อมูลการชำระเงิน
                  </Space>
                }
                style={{ marginBottom: "24px" }}
              >
                {booking.payments.map((payment, index) => (
                  <div key={index}>
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                      <Descriptions.Item label="จำนวนเงิน">
                        {payment.amount?.toLocaleString()} บาท
                      </Descriptions.Item>
                      <Descriptions.Item label="วิธีการชำระเงิน">
                        {payment.payment_method === "bank_transfer"
                          ? "โอนเงินผ่านธนาคาร"
                          : payment.payment_method === "promptpay"
                          ? "พร้อมเพย์"
                          : payment.payment_method === "credit_card"
                          ? "บัตรเครดิต"
                          : "อื่นๆ"}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันที่ชำระเงิน">
                        {formatDateTime(payment.payment_date)}
                      </Descriptions.Item>
                      <Descriptions.Item label="สถานะ">
                        <Tag color={getPaymentStatusColor(payment.status)}>
                          {getPaymentStatusText(payment.status)}
                        </Tag>
                      </Descriptions.Item>
                      {payment.reference_number && (
                        <Descriptions.Item label="หมายเลขอ้างอิง" span={2}>
                          {payment.reference_number}
                        </Descriptions.Item>
                      )}
                    </Descriptions>

                    {payment.slip_image_url && (
                      <div style={{ marginTop: "16px" }}>
                        <Text strong>สลิปการโอนเงิน:</Text>
                        <div style={{ marginTop: "8px" }}>
                          <Image
                            src={payment.slip_image_url}
                            alt="Payment Slip"
                            width={200}
                            style={{ borderRadius: "8px" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            )}
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Room Image */}
            <Card style={{ marginBottom: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <Image
                  src={
                    booking.room?.main_image ||
                    "https://via.placeholder.com/400x250"
                  }
                  alt={booking.room?.room_type?.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0 }}>
                  {booking.room?.room_type?.name}
                </Title>
                <Text type="secondary">ห้อง {booking.room?.room_number}</Text>
              </div>
            </Card>

            {/* QR Code for Check-in */}
            {booking.status === "confirmed" && (
              <Card
                title="QR Code สำหรับเช็คอิน"
                style={{ marginBottom: "24px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <QRCode
                    value={`BOOKING:${booking.booking_number}`}
                    size={160}
                    style={{ marginBottom: "16px" }}
                  />
                  <div>
                    <Text type="secondary">
                      แสดง QR Code นี้ที่เคาน์เตอร์เพื่อเช็คอิน
                    </Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card title="สถานะการจอง" style={{ marginBottom: "24px" }}>
              <Timeline items={timelineItems} />
            </Card>

            {/* Contact Information */}
            <Card title="ติดต่อโรงแรม">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <PhoneOutlined
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  <Text>081-979-7986</Text>
                </div>
                <div>
                  <MailOutlined
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  <Text>info@krplace.com</Text>
                </div>
                <div>
                  <ClockCircleOutlined
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  <Text>เช็คอิน: 14:00 น. / เช็คเอาท์: 12:00 น.</Text>
                </div>
              </Space>

              <Divider />

              <div style={{ textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  หากมีข้อสงสัยเกี่ยวกับการจอง
                  <br />
                  กรุณาติดต่อเราได้ตลอด 24 ชั่วโมง
                </Text>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Link to="/rooms">
                  <Button type="primary" block icon={<HomeOutlined />}>
                    จองห้องพักเพิ่มเติม
                  </Button>
                </Link>
                <Link to="/">
                  <Button block>กลับสู่หน้าแรก</Button>
                </Link>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Important Notes */}
        <Card title="ข้อมูลสำคัญสำหรับการเข้าพัก" style={{ marginTop: "24px" }}>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <CalendarOutlined
                  style={{
                    fontSize: "32px",
                    color: "#1890ff",
                    marginBottom: "8px",
                  }}
                />
                <div>
                  <Text strong>เวลาเช็คอิน/เช็คเอาท์</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">เช็คอิน: 14:00 น.</Text>
                    <br />
                    <Text type="secondary">เช็คเอาท์: 12:00 น.</Text>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <UserOutlined
                  style={{
                    fontSize: "32px",
                    color: "#1890ff",
                    marginBottom: "8px",
                  }}
                />
                <div>
                  <Text strong>เอกสารที่ต้องนำมา</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">บัตรประชาชน หรือ</Text>
                    <br />
                    <Text type="secondary">หนังสือเดินทาง</Text>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <PhoneOutlined
                  style={{
                    fontSize: "32px",
                    color: "#1890ff",
                    marginBottom: "8px",
                  }}
                />
                <div>
                  <Text strong>ติดต่อเรา</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">โทร: 081-979-7986</Text>
                    <br />
                    <Text type="secondary">ตลอด 24 ชั่วโมง</Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Footer */}
        <div
          style={{ textAlign: "center", marginTop: "32px", padding: "16px" }}
        >
          <Text type="secondary">
            ขอบคุณที่เลือกใช้บริการ KR .place Hotel
            <br />
            เรารอต้อนรับคุณด้วยการบริการที่เป็นเลิศ
          </Text>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx="true">{`
        @media print {
          .ant-card-actions,
          .ant-btn,
          .no-print {
            display: none !important;
          }

          .ant-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

export default BookingConfirmationPage;
