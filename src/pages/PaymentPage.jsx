// src/pages/PaymentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Form,
  Input,
  Select,
  Upload,
  message,
  Descriptions,
  Divider,
  Space,
  Image,
  Tag,
  Alert,
  Steps,
  Result,
  Breadcrumb,
} from "antd";
import {
  UploadOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  BankOutlined,
  MobileOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import paymentService from "../services/paymentService";
import bookingService from "../services/bookingService";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function PaymentPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [booking, setBooking] = useState(null);
  const [room, setRoom] = useState(null);
  const [priceInfo, setPriceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (location.state) {
      const {
        booking: bookingData,
        room: roomData,
        priceInfo: priceData,
      } = location.state;
      setBooking(bookingData);
      setRoom(roomData);
      setPriceInfo(priceData);
      setLoading(false);
    } else if (bookingId) {
      fetchBookingDetails();
    } else {
      navigate("/rooms");
    }
  }, [bookingId, location.state, navigate]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
      setRoom(data.room);

      // คำนวณข้อมูลราคา
      const checkInDate = data.check_in_date;
      const checkOutDate = data.check_out_date;
      const nights = Math.ceil(
        (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
      );

      setPriceInfo({
        basePrice: data.room.room_type.base_price,
        nights,
        subtotal: data.total_price,
        discount: 0,
        total: data.total_price,
      });
    } catch (error) {
      console.error("Error fetching booking details:", error);
      message.error("ไม่สามารถโหลดข้อมูลการจองได้");
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSlipUpload = (info) => {
    if (info.file && info.file.originFileObj) {
      const file = info.file.originFileObj;

      // ตรวจสอบขนาดและประเภทไฟล์
      const isLt5M = file.size / 1024 / 1024 < 5;
      const isImage = file.type.startsWith("image/");

      if (!isImage) {
        message.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!");
        return;
      }

      if (!isLt5M) {
        message.error("รูปภาพต้องมีขนาดไม่เกิน 5MB!");
        return;
      }

      setSlipFile(file);
      const previewUrl = URL.createObjectURL(file);
      setSlipPreview(previewUrl);
    }
  };

  const handlePaymentSubmit = async (values) => {
    if (!slipFile) {
      message.error("กรุณาอัปโหลดสลิปการโอนเงิน");
      return;
    }

    try {
      setSubmitting(true);

      const paymentData = {
        booking_id: booking.id,
        amount: priceInfo.total,
        payment_method: values.payment_method,
        payment_date: new Date().toISOString(),
        reference_number: values.reference_number || "",
        notes: values.notes || "",
      };

      const payment = await paymentService.createPayment(paymentData, slipFile);

      setPaymentResult(payment);
      setPaymentCompleted(true);

      message.success("ส่งข้อมูลการชำระเงินสำเร็จ!");
    } catch (error) {
      console.error("Error submitting payment:", error);
      message.error(
        "เกิดข้อผิดพลาดในการส่งข้อมูลการชำระเงิน: " + error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const slipUploadProps = {
    name: "slip",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    beforeUpload: () => false, // ป้องกันการอัปโหลดอัตโนมัติ
    onChange: handleSlipUpload,
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <div>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div style={{ padding: "20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Result
            status="success"
            title="ส่งข้อมูลการชำระเงินสำเร็จ!"
            subTitle={`เลขที่การจอง: ${booking.booking_number} - รอการยืนยันจากทางโรงแรม`}
            extra={[
              <Button
                type="primary"
                key="confirmation"
                onClick={() => navigate(`/confirmation/${booking.id}`)}
              >
                ดูใบยืนยันการจอง
              </Button>,
              <Button key="home" onClick={() => navigate("/")}>
                กลับสู่หน้าแรก
              </Button>,
            ]}
          >
            <div
              style={{
                backgroundColor: "#fafafa",
                padding: "16px",
                borderRadius: "6px",
              }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="วิธีการชำระเงิน">
                  {form.getFieldValue("payment_method") === "bank_transfer"
                    ? "โอนเงินผ่านธนาคาร"
                    : form.getFieldValue("payment_method") === "promptpay"
                    ? "พร้อมเพย์"
                    : "อื่นๆ"}
                </Descriptions.Item>
                <Descriptions.Item label="จำนวนเงิน">
                  {priceInfo.total.toLocaleString()} บาท
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ">
                  <Tag color="gold">รอการยืนยัน</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Result>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: "24px" }}>
          <Breadcrumb.Item>
            <a href="/">หน้าแรก</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href="/rooms">ห้องพัก</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>ชำระเงิน</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Title level={2}>ชำระเงิน</Title>
          <Text type="secondary">เลขที่การจอง: {booking?.booking_number}</Text>
        </div>

        {/* Steps */}
        <Card style={{ marginBottom: "24px" }}>
          <Steps
            current={2}
            items={[
              { title: "ข้อมูลลูกค้า", icon: <CheckCircleOutlined /> },
              { title: "ยืนยันการจอง", icon: <CheckCircleOutlined /> },
              { title: "ชำระเงิน", icon: <CreditCardOutlined /> },
            ]}
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* Left Column - Payment Form */}
          <Col xs={24} lg={14}>
            {/* Payment Instructions */}
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  วิธีการชำระเงิน
                </Space>
              }
              style={{ marginBottom: "24px" }}
            >
              <Alert
                message="โปรดโอนเงินตามจำนวนที่ระบุและอัปโหลดสลิปการโอนเงิน"
                description="ระบบจะตรวจสอบการชำระเงินและส่งอีเมลยืนยันให้คุณภายใน 24 ชั่วโมง"
                type="info"
                showIcon
                style={{ marginBottom: "16px" }}
              />

              {/* Bank Account Information */}
              <div style={{ marginBottom: "16px" }}>
                <Title level={5}>ข้อมูลบัญชีธนาคาร</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <BankOutlined
                            style={{ marginRight: "8px", color: "#52c41a" }}
                          />
                          <Text strong>ธนาคารกสิกรไทย</Text>
                        </div>
                        <div>
                          <Text>เลขที่บัญชี: 123-4-56789-0</Text>
                        </div>
                        <div>
                          <Text>ชื่อบัญชี: KR .place Hotel</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" style={{ backgroundColor: "#e6f7ff" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <MobileOutlined
                            style={{ marginRight: "8px", color: "#1890ff" }}
                          />
                          <Text strong>พร้อมเพย์</Text>
                        </div>
                        <div>
                          <Text>เบอร์โทร: 081-979-7986</Text>
                        </div>
                        <div>
                          <Text>ชื่อบัญชี: KR .place Hotel</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Card>

            {/* Payment Form */}
            <Card title="ส่งหลักฐานการชำระเงิน">
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePaymentSubmit}
              >
                <Form.Item
                  name="payment_method"
                  label="วิธีการชำระเงิน"
                  rules={[
                    { required: true, message: "กรุณาเลือกวิธีการชำระเงิน" },
                  ]}
                >
                  <Select placeholder="เลือกวิธีการชำระเงิน">
                    <Option value="bank_transfer">โอนเงินผ่านธนาคาร</Option>
                    <Option value="promptpay">พร้อมเพย์</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="reference_number"
                  label="หมายเลขอ้างอิง (ถ้ามี)"
                >
                  <Input placeholder="กรอกหมายเลขอ้างอิงจากการโอนเงิน" />
                </Form.Item>

                <Form.Item label="สลิปการโอนเงิน" required>
                  <div style={{ marginBottom: "16px" }}>
                    {slipPreview ? (
                      <div
                        style={{
                          position: "relative",
                          marginBottom: "16px",
                          width: "fit-content",
                        }}
                      >
                        <Image
                          src={slipPreview}
                          alt="Payment Slip"
                          width={250}
                          height={350}
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          style={{ position: "absolute", top: 8, right: 8 }}
                          onClick={() => {
                            setSlipPreview(null);
                            setSlipFile(null);
                          }}
                        />
                      </div>
                    ) : (
                      <Upload.Dragger {...slipUploadProps}>
                        <p className="ant-upload-drag-icon">
                          <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">
                          คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลดสลิป
                        </p>
                        <p className="ant-upload-hint">
                          รองรับไฟล์ .jpg, .jpeg, .png ขนาดไม่เกิน 5MB
                        </p>
                      </Upload.Dragger>
                    )}
                  </div>
                </Form.Item>

                <Form.Item name="notes" label="หมายเหตุเพิ่มเติม">
                  <Input.TextArea
                    rows={3}
                    placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                  />
                </Form.Item>

                <div style={{ textAlign: "right" }}>
                  <Space>
                    <Button onClick={() => navigate(-1)}>ย้อนกลับ</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={submitting}
                      disabled={!slipFile}
                    >
                      ส่งหลักฐานการชำระเงิน
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>
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
                    room?.main_image || "https://via.placeholder.com/400x200"
                  }
                  alt={room?.room_type?.name}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>

              {/* Booking Info */}
              <Descriptions column={1} size="small">
                <Descriptions.Item label="เลขที่การจอง">
                  <Text strong>{booking?.booking_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="ห้องพัก">
                  {room?.room_type?.name} (ห้อง {room?.room_number})
                </Descriptions.Item>
                <Descriptions.Item label="ลูกค้า">
                  {booking?.customer?.first_name} {booking?.customer?.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่เข้าพัก">
                  {booking?.check_in_date && formatDate(booking.check_in_date)}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่ออก">
                  {booking?.check_out_date &&
                    formatDate(booking.check_out_date)}
                </Descriptions.Item>
                <Descriptions.Item label="จำนวนคืน">
                  {priceInfo?.nights} คืน
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* Price Breakdown */}
              <div style={{ marginBottom: "16px" }}>
                <Title level={5}>รายละเอียดราคา</Title>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text>ราคาต่อคืน:</Text>
                  <Text>{priceInfo?.basePrice?.toLocaleString()} บาท</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text>จำนวนคืน:</Text>
                  <Text>{priceInfo?.nights} คืน</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text>รวม:</Text>
                  <Text>{priceInfo?.subtotal?.toLocaleString()} บาท</Text>
                </div>
                {priceInfo?.discount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Text>ส่วนลด:</Text>
                    <Text style={{ color: "#52c41a" }}>
                      -{priceInfo.discount.toLocaleString()} บาท
                    </Text>
                  </div>
                )}
              </div>

              <Divider />

              {/* Total Amount */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: "#e6f7ff",
                  borderRadius: "6px",
                }}
              >
                <Text strong style={{ fontSize: "18px" }}>
                  ยอดที่ต้องชำระ:
                </Text>
                <Text strong style={{ fontSize: "20px", color: "#1890ff" }}>
                  {priceInfo?.total?.toLocaleString()} บาท
                </Text>
              </div>

              {/* Important Notes */}
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fff7e6",
                  borderRadius: "6px",
                  border: "1px solid #ffd591",
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
                    style={{ color: "#fa8c16", marginRight: "8px" }}
                  />
                  <Text strong style={{ color: "#fa8c16" }}>
                    ข้อมูลสำคัญ
                  </Text>
                </div>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li>
                    <Text style={{ fontSize: "14px" }}>
                      กรุณาโอนเงินตามจำนวนที่ระบุ
                    </Text>
                  </li>
                  <li>
                    <Text style={{ fontSize: "14px" }}>
                      อัปโหลดสลิปการโอนเงินที่ชัดเจน
                    </Text>
                  </li>
                  <li>
                    <Text style={{ fontSize: "14px" }}>
                      ระบบจะตรวจสอบและยืนยันภายใน 24 ชั่วโมง
                    </Text>
                  </li>
                  <li>
                    <Text style={{ fontSize: "14px" }}>
                      หากมีข้อสงสัย โทร 081-979-7986
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

export default PaymentPage;
