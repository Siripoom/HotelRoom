import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Tabs,
  Typography,
  Descriptions,
  Row,
  Col,
  message,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Input,
  Statistic,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import bookingService from "../../services/bookingService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter((booking) => booking.status === activeTab)
      );
    }
  }, [activeTab, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
      setFilteredBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("ไม่สามารถโหลดข้อมูลการจองได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await bookingService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await bookingService.getBookingStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAvailableRooms = async (checkInDate, checkOutDate) => {
    try {
      const data = await bookingService.getAvailableRooms(
        checkInDate,
        checkOutDate
      );
      setAvailableRooms(data);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      message.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
    }
  };

  const showCreateModal = () => {
    setCurrentBooking(null);
    form.resetFields();
    setAvailableRooms([]);
    setIsModalVisible(true);
  };

  const showDetailModal = (booking) => {
    setCurrentBooking(booking);
    setIsDetailModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDetailModalVisible(false);
    setCurrentBooking(null);
    form.resetFields();
    setAvailableRooms([]);
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const checkInDate = dates[0].format("YYYY-MM-DD");
      const checkOutDate = dates[1].format("YYYY-MM-DD");
      fetchAvailableRooms(checkInDate, checkOutDate);
    } else {
      setAvailableRooms([]);
    }
  };

  const calculateTotalPrice = (roomId, dates) => {
    if (!roomId || !dates || dates.length !== 2) return 0;

    const room = availableRooms.find((r) => r.id === roomId);
    if (!room) return 0;

    const nights = dates[1].diff(dates[0], "day");
    return room.room_type.base_price * nights;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const bookingData = {
        customer_id: values.customer_id,
        room_id: values.room_id,
        check_in_date: values.dates[0].format("YYYY-MM-DD"),
        check_out_date: values.dates[1].format("YYYY-MM-DD"),
        total_price: values.total_price,
        special_requests: values.special_requests || "",
      };

      const newBooking = await bookingService.createBooking(bookingData);

      message.success("สร้างการจองใหม่สำเร็จ");
      setIsModalVisible(false);
      form.resetFields();

      // รีเฟรชข้อมูล
      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error("Error creating booking:", error);
      message.error("เกิดข้อผิดพลาดในการสร้างการจอง: " + error.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      await bookingService.updateBookingStatus(bookingId, newStatus);

      message.success(
        `อัปเดตสถานะการจองเป็น "${getStatusText(newStatus)}" สำเร็จ`
      );
      setIsDetailModalVisible(false);

      // รีเฟรชข้อมูล
      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error("Error updating booking status:", error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      setLoading(true);
      await bookingService.deleteBooking(bookingId);

      message.success("ลบการจองสำเร็จ");

      // รีเฟรชข้อมูล
      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error("Error deleting booking:", error);
      message.error("เกิดข้อผิดพลาดในการลบการจอง");
    } finally {
      setLoading(false);
    }
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

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "pending":
        return "รอการยืนยัน";
      case "confirmed":
        return "ชำระแล้ว";
      case "rejected":
        return "ปฏิเสธ";
      case "refunded":
        return "คืนเงินแล้ว";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const columns = [
    {
      title: "เลขที่การจอง",
      dataIndex: "booking_number",
      key: "booking_number",
      width: 150,
    },
    {
      title: "ลูกค้า",
      key: "customer",
      width: 150,
      render: (_, record) =>
        record.customer
          ? `${record.customer.first_name} ${record.customer.last_name}`
          : "-",
    },
    {
      title: "ห้อง",
      key: "room",
      width: 120,
      render: (_, record) =>
        record.room
          ? `${record.room.room_number} (${record.room.room_type?.name})`
          : "-",
    },
    {
      title: "วันที่เข้าพัก",
      key: "dates",
      width: 200,
      render: (_, record) =>
        `${formatDate(record.check_in_date)} - ${formatDate(
          record.check_out_date
        )}`,
    },
    {
      title: "ราคารวม",
      dataIndex: "total_price",
      key: "total_price",
      width: 120,
      render: (price) => `${price?.toLocaleString()} บาท`,
    },
    {
      title: "สถานะ",
      key: "status",
      width: 120,
      render: (_, record) => {
        const statusColors = {
          pending: "gold",
          confirmed: "green",
          completed: "blue",
          cancelled: "red",
        };

        return (
          <Tag color={statusColors[record.status] || "default"}>
            {getStatusText(record.status)}
          </Tag>
        );
      },
      filters: [
        { text: "รอการยืนยัน", value: "pending" },
        { text: "ยืนยันแล้ว", value: "confirmed" },
        { text: "เสร็จสิ้น", value: "completed" },
        { text: "ยกเลิก", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "การชำระเงิน",
      key: "payment_status",
      width: 120,
      render: (_, record) => {
        const paymentStatusColors = {
          pending: "gold",
          confirmed: "green",
          rejected: "red",
          refunded: "blue",
        };

        return (
          <Tag color={paymentStatusColors[record.payment_status] || "default"}>
            {getPaymentStatusText(record.payment_status)}
          </Tag>
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetailModal(record)}
          >
            ดู
          </Button>
          <Popconfirm
            title="คุณต้องการลบการจองนี้ใช่หรือไม่?"
            description="การดำเนินการนี้ไม่สามารถเรียกคืนได้"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "all", label: `ทั้งหมด (${stats.total})` },
    { key: "pending", label: `รอการยืนยัน (${stats.pending})` },
    { key: "confirmed", label: `ยืนยันแล้ว (${stats.confirmed})` },
    { key: "completed", label: `เสร็จสิ้น (${stats.completed})` },
    { key: "cancelled", label: `ยกเลิก (${stats.cancelled})` },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            จัดการการจอง
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
            size="large"
          >
            สร้างการจองใหม่
          </Button>
        </Col>
      </Row>

      {/* สถิติ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="การจองทั้งหมด"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="รอการยืนยัน"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ยืนยันแล้ว"
              value={stats.confirmed}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="รายได้รวม"
              value={stats.totalRevenue}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="บาท"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal สร้างการจองใหม่ */}
      <Modal
        title="สร้างการจองใหม่"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText="สร้างการจอง"
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer_id"
                label="ลูกค้า"
                rules={[{ required: true, message: "กรุณาเลือกลูกค้า" }]}
              >
                <Select placeholder="เลือกลูกค้า">
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} (
                      {customer.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dates"
                label="วันที่เข้าพัก - ออก"
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
              >
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["วันที่เช็คอิน", "วันที่เช็คเอาท์"]}
                  onChange={handleDateChange}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="room_id"
            label="ห้องพัก"
            rules={[{ required: true, message: "กรุณาเลือกห้องพัก" }]}
          >
            <Select
              placeholder="เลือกห้องพัก (กรุณาเลือกวันที่ก่อน)"
              disabled={availableRooms.length === 0}
              onChange={(roomId) => {
                const dates = form.getFieldValue("dates");
                if (dates && roomId) {
                  const totalPrice = calculateTotalPrice(roomId, dates);
                  form.setFieldsValue({ total_price: totalPrice });
                }
              }}
            >
              {availableRooms.map((room) => (
                <Option key={room.id} value={room.id}>
                  ห้อง {room.room_number} - {room.room_type.name}(
                  {room.room_type.base_price.toLocaleString()} บาท/คืน)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="total_price"
                label="ราคารวม (บาท)"
                rules={[{ required: true, message: "กรุณาระบุราคารวม" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="ราคารวม"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ marginTop: 30 }}>
                <Text type="secondary">
                  ราคาจะถูกคำนวณอัตโนมัติเมื่อเลือกห้องและวันที่
                </Text>
              </div>
            </Col>
          </Row>

          <Form.Item name="special_requests" label="คำขอพิเศษ">
            <TextArea rows={3} placeholder="ระบุคำขอพิเศษ (ถ้ามี)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal แสดงรายละเอียดการจอง */}
      {currentBooking && (
        <Modal
          title={`รายละเอียดการจอง: ${currentBooking.booking_number}`}
          open={isDetailModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card size="small" title="สถานะ">
                <Space size="large">
                  <div>
                    <Text type="secondary">สถานะการจอง:</Text>
                    <div>
                      <Tag
                        color={
                          currentBooking.status === "pending"
                            ? "gold"
                            : currentBooking.status === "confirmed"
                            ? "green"
                            : currentBooking.status === "completed"
                            ? "blue"
                            : currentBooking.status === "cancelled"
                            ? "red"
                            : "default"
                        }
                      >
                        {getStatusText(currentBooking.status)}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">สถานะการชำระเงิน:</Text>
                    <div>
                      <Tag
                        color={
                          currentBooking.payment_status === "pending"
                            ? "gold"
                            : currentBooking.payment_status === "confirmed"
                            ? "green"
                            : currentBooking.payment_status === "rejected"
                            ? "red"
                            : currentBooking.payment_status === "refunded"
                            ? "blue"
                            : "default"
                        }
                      >
                        {getPaymentStatusText(currentBooking.payment_status)}
                      </Tag>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="ข้อมูลลูกค้า">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="ชื่อ-นามสกุล">
                    {currentBooking.customer?.first_name}{" "}
                    {currentBooking.customer?.last_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="อีเมล">
                    {currentBooking.customer?.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="เบอร์โทร">
                    {currentBooking.customer?.phone}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="ข้อมูลการจอง">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="เลขห้อง">
                    {currentBooking.room?.room_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="ประเภทห้อง">
                    {currentBooking.room?.room_type?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่เช็คอิน">
                    {formatDate(currentBooking.check_in_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่เช็คเอาท์">
                    {formatDate(currentBooking.check_out_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="ราคารวม">
                    {currentBooking.total_price?.toLocaleString()} บาท
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่จอง">
                    {new Date(currentBooking.created_at).toLocaleString(
                      "th-TH"
                    )}
                  </Descriptions.Item>
                </Descriptions>

                {currentBooking.special_requests && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>คำขอพิเศษ:</Text>
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 4,
                      }}
                    >
                      {currentBooking.special_requests}
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            <Col span={24}>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                {currentBooking.status === "pending" && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() =>
                        handleStatusChange(currentBooking.id, "confirmed")
                      }
                      loading={loading}
                    >
                      ยืนยันการจอง
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() =>
                        handleStatusChange(currentBooking.id, "cancelled")
                      }
                      loading={loading}
                    >
                      ยกเลิกการจอง
                    </Button>
                  </>
                )}

                {currentBooking.status === "confirmed" && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() =>
                      handleStatusChange(currentBooking.id, "completed")
                    }
                    loading={loading}
                  >
                    เสร็จสิ้นการจอง
                  </Button>
                )}

                <Button onClick={handleCancel}>ปิด</Button>
              </div>
            </Col>
          </Row>
        </Modal>
      )}
    </div>
  );
}

export default AdminBookings;
