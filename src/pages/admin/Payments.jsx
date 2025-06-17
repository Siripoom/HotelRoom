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
  Upload,
  Image,
  Statistic,
  Popconfirm,
  Badge,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import paymentService from "../../services/paymentService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  useEffect(() => {
    fetchPayments();
    fetchUnpaidBookings();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(
        payments.filter((payment) => payment.status === activeTab)
      );
    }
  }, [activeTab, payments]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPayments();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      message.error("ไม่สามารถโหลดข้อมูลการชำระเงินได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidBookings = async () => {
    try {
      const data = await paymentService.getUnpaidBookings();
      setUnpaidBookings(data);
    } catch (error) {
      console.error("Error fetching unpaid bookings:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await paymentService.getPaymentStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const showCreateModal = () => {
    createForm.resetFields();
    setSlipFile(null);
    setSlipPreview(null);
    setIsCreateModalVisible(true);
  };

  const showDetailModal = async (payment) => {
    try {
      setLoading(true);
      const detailData = await paymentService.getPaymentById(payment.id);
      setCurrentPayment(detailData);
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดการชำระเงินได้");
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (payment) => {
    setCurrentPayment(payment);
    form.setFieldsValue({
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: dayjs(payment.payment_date),
      reference_number: payment.reference_number || "",
      notes: payment.notes || "",
    });
    setSlipPreview(payment.slip_image_url);
    setSlipFile(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDetailModalVisible(false);
    setIsCreateModalVisible(false);
    setCurrentPayment(null);
    form.resetFields();
    createForm.resetFields();
    setSlipFile(null);
    setSlipPreview(null);
  };

  const handleSlipUpload = (info, isCreate = false) => {
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

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      setConfirmLoading(true);

      const paymentData = {
        booking_id: values.booking_id,
        amount: values.amount,
        payment_method: values.payment_method,
        payment_date: values.payment_date.toISOString(),
        reference_number: values.reference_number || "",
        notes: values.notes || "",
      };

      await paymentService.createPayment(paymentData, slipFile);

      message.success("บันทึกการชำระเงินสำเร็จ");
      setIsCreateModalVisible(false);
      createForm.resetFields();
      setSlipFile(null);
      setSlipPreview(null);

      // รีเฟรชข้อมูล
      await fetchPayments();
      await fetchUnpaidBookings();
      await fetchStats();
    } catch (error) {
      console.error("Error creating payment:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกการชำระเงิน: " + error.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const updateData = {
        amount: values.amount,
        payment_method: values.payment_method,
        payment_date: values.payment_date.toISOString(),
        reference_number: values.reference_number || "",
        notes: values.notes || "",
      };

      await paymentService.updatePayment(
        currentPayment.id,
        updateData,
        slipFile
      );

      message.success("อัปเดตการชำระเงินสำเร็จ");
      setIsModalVisible(false);
      setCurrentPayment(null);
      form.resetFields();
      setSlipFile(null);
      setSlipPreview(null);

      // รีเฟรชข้อมูล
      await fetchPayments();
      await fetchStats();
    } catch (error) {
      console.error("Error updating payment:", error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตการชำระเงิน");
    } finally {
      setConfirmLoading(false);
    }
  };

  const showConfirmation = (paymentId, action, notes = "") => {
    const { type, title, content, statusValue } =
      action === "confirm"
        ? {
            type: "success",
            title: "ยืนยันการชำระเงิน",
            content: "คุณต้องการยืนยันการชำระเงินนี้ใช่หรือไม่?",
            statusValue: "confirmed",
          }
        : {
            type: "danger",
            title: "ปฏิเสธการชำระเงิน",
            content: "คุณต้องการปฏิเสธการชำระเงินนี้ใช่หรือไม่?",
            statusValue: "rejected",
          };

    confirm({
      title,
      icon:
        action === "confirm" ? (
          <CheckCircleOutlined />
        ) : (
          <CloseCircleOutlined />
        ),
      content,
      okText: "ยืนยัน",
      okType: action === "confirm" ? "primary" : "danger",
      cancelText: "ยกเลิก",
      onOk() {
        handleStatusChange(paymentId, statusValue, notes);
      },
    });
  };

  const handleStatusChange = async (paymentId, newStatus, notes = "") => {
    try {
      setLoading(true);
      await paymentService.updatePaymentStatus(paymentId, newStatus, notes);

      message.success(
        `อัปเดตสถานะการชำระเงินเป็น "${getStatusText(newStatus)}" สำเร็จ`
      );
      setIsDetailModalVisible(false);

      // รีเฟรชข้อมูล
      await fetchPayments();
      await fetchStats();
    } catch (error) {
      console.error("Error updating payment status:", error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId) => {
    try {
      setLoading(true);
      await paymentService.deletePayment(paymentId);

      message.success("ลบการชำระเงินสำเร็จ");

      // รีเฟรชข้อมูล
      await fetchPayments();
      await fetchUnpaidBookings();
      await fetchStats();
    } catch (error) {
      console.error("Error deleting payment:", error);
      message.error("เกิดข้อผิดพลาดในการลบการชำระเงิน");
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
      case "rejected":
        return "ปฏิเสธ";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "bank_transfer":
        return "โอนเงิน";
      case "credit_card":
        return "บัตรเครดิต";
      case "promptpay":
        return "พร้อมเพย์";
      case "cash":
        return "เงินสด";
      default:
        return method;
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH");
  };

  const columns = [
    {
      title: "เลขที่การจอง",
      dataIndex: ["booking", "booking_number"],
      key: "booking_number",
      width: 140,
    },
    {
      title: "ลูกค้า",
      key: "customer",
      width: 150,
      render: (_, record) =>
        record.booking?.customer
          ? `${record.booking.customer.first_name} ${record.booking.customer.last_name}`
          : "-",
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount) => `${amount?.toLocaleString()} บาท`,
    },
    {
      title: "วันที่ชำระเงิน",
      dataIndex: "payment_date",
      key: "payment_date",
      width: 140,
      render: (date) => formatDateTime(date),
    },
    {
      title: "วิธีการชำระเงิน",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 130,
      render: (method) => getPaymentMethodText(method),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusColors = {
          pending: "gold",
          confirmed: "green",
          rejected: "red",
        };

        return (
          <Tag color={statusColors[status] || "default"}>
            {getStatusText(status)}
          </Tag>
        );
      },
      filters: [
        { text: "รอการยืนยัน", value: "pending" },
        { text: "ยืนยันแล้ว", value: "confirmed" },
        { text: "ปฏิเสธ", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "จัดการ",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            onClick={() => showDetailModal(record)}
          >
            ตรวจสอบ
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณต้องการลบการชำระเงินนี้ใช่หรือไม่?"
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
    { key: "rejected", label: `ปฏิเสธ (${stats.rejected})` },
  ];

  const slipUploadProps = {
    name: "slip",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    beforeUpload: () => false, // ป้องกันการอัปโหลดอัตโนมัติ
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            จัดการการชำระเงิน
          </Title>
        </Col>
        <Col>
          <Space>
            <Badge count={unpaidBookings.length} offset={[10, 0]}>
              <Button icon={<PlusOutlined />} onClick={showCreateModal}>
                บันทึกการชำระเงิน
              </Button>
            </Badge>
          </Space>
        </Col>
      </Row>

      {/* สถิติ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="การชำระเงินทั้งหมด"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="รอการยืนยัน"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ยอดเงินที่ยืนยันแล้ว"
              value={stats.totalAmount}
              precision={0}
              valueStyle={{ color: "#52c41a" }}
              prefix={<DollarOutlined />}
              suffix="บาท"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ยอดเงินรอยืนยัน"
              value={stats.pendingAmount}
              precision={0}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
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
          dataSource={filteredPayments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal สร้างการชำระเงินใหม่ */}
      <Modal
        title="บันทึกการชำระเงินใหม่"
        open={isCreateModalVisible}
        onOk={handleCreateSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText="บันทึกการชำระเงิน"
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="booking_id"
            label="การจอง"
            rules={[{ required: true, message: "กรุณาเลือกการจอง" }]}
          >
            <Select placeholder="เลือกการจองที่ต้องการบันทึกการชำระเงิน">
              {unpaidBookings.map((booking) => (
                <Option key={booking.id} value={booking.id}>
                  {booking.booking_number} - {booking.customer.first_name}{" "}
                  {booking.customer.last_name}(
                  {booking.total_price.toLocaleString()} บาท)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="จำนวนเงิน (บาท)"
                rules={[{ required: true, message: "กรุณาระบุจำนวนเงิน" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="จำนวนเงิน"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payment_method"
                label="วิธีการชำระเงิน"
                rules={[
                  { required: true, message: "กรุณาเลือกวิธีการชำระเงิน" },
                ]}
              >
                <Select placeholder="เลือกวิธีการชำระเงิน">
                  <Option value="bank_transfer">โอนเงิน</Option>
                  <Option value="credit_card">บัตรเครดิต</Option>
                  <Option value="promptpay">พร้อมเพย์</Option>
                  <Option value="cash">เงินสด</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="payment_date"
                label="วันที่ชำระเงิน"
                rules={[
                  { required: true, message: "กรุณาเลือกวันที่ชำระเงิน" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="เลือกวันที่และเวลา"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reference_number" label="หมายเลขอ้างอิง">
                <Input placeholder="หมายเลขอ้างอิง (ถ้ามี)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="สลิปการโอนเงิน">
            <div style={{ marginBottom: 16 }}>
              {slipPreview ? (
                <div
                  style={{
                    position: "relative",
                    marginBottom: 16,
                    width: "fit-content",
                  }}
                >
                  <Image
                    src={slipPreview}
                    alt="Payment Slip"
                    width={200}
                    height={250}
                    style={{ objectFit: "cover" }}
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ position: "absolute", top: 5, right: 5 }}
                    onClick={() => {
                      setSlipPreview(null);
                      setSlipFile(null);
                    }}
                  />
                </div>
              ) : (
                <Upload
                  {...slipUploadProps}
                  onChange={(info) => handleSlipUpload(info, true)}
                >
                  <Button icon={<UploadOutlined />}>
                    อัปโหลดสลิปการโอนเงิน
                  </Button>
                </Upload>
              )}
            </div>
          </Form.Item>

          <Form.Item name="notes" label="หมายเหตุ">
            <TextArea rows={3} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal แก้ไขการชำระเงิน */}
      <Modal
        title="แก้ไขการชำระเงิน"
        open={isModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText="บันทึกการแก้ไข"
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="จำนวนเงิน (บาท)"
                rules={[{ required: true, message: "กรุณาระบุจำนวนเงิน" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="จำนวนเงิน"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payment_method"
                label="วิธีการชำระเงิน"
                rules={[
                  { required: true, message: "กรุณาเลือกวิธีการชำระเงิน" },
                ]}
              >
                <Select placeholder="เลือกวิธีการชำระเงิน">
                  <Option value="bank_transfer">โอนเงิน</Option>
                  <Option value="credit_card">บัตรเครดิต</Option>
                  <Option value="promptpay">พร้อมเพย์</Option>
                  <Option value="cash">เงินสด</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="payment_date"
                label="วันที่ชำระเงิน"
                rules={[
                  { required: true, message: "กรุณาเลือกวันที่ชำระเงิน" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="เลือกวันที่และเวลา"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reference_number" label="หมายเลขอ้างอิง">
                <Input placeholder="หมายเลขอ้างอิง (ถ้ามี)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="สลิปการโอนเงิน">
            <div style={{ marginBottom: 16 }}>
              {slipPreview ? (
                <div
                  style={{
                    position: "relative",
                    marginBottom: 16,
                    width: "fit-content",
                  }}
                >
                  <Image
                    src={slipPreview}
                    alt="Payment Slip"
                    width={200}
                    height={250}
                    style={{ objectFit: "cover" }}
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ position: "absolute", top: 5, right: 5 }}
                    onClick={() => {
                      setSlipPreview(null);
                      setSlipFile(null);
                    }}
                  />
                </div>
              ) : (
                <Upload {...slipUploadProps} onChange={handleSlipUpload}>
                  <Button icon={<UploadOutlined />}>
                    อัปโหลดสลิปการโอนเงิน
                  </Button>
                </Upload>
              )}
            </div>
          </Form.Item>

          <Form.Item name="notes" label="หมายเหตุ">
            <TextArea rows={3} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal แสดงรายละเอียดการชำระเงิน */}
      {currentPayment && (
        <Modal
          title={`ตรวจสอบการชำระเงิน: ${currentPayment.booking?.booking_number}`}
          open={isDetailModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card size="small" title="สถานะการชำระเงิน">
                <Tag
                  color={
                    currentPayment.status === "pending"
                      ? "gold"
                      : currentPayment.status === "confirmed"
                      ? "green"
                      : currentPayment.status === "rejected"
                      ? "red"
                      : "default"
                  }
                  style={{ fontSize: "14px", padding: "4px 8px" }}
                >
                  {getStatusText(currentPayment.status)}
                </Tag>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="ข้อมูลการชำระเงิน">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="ลูกค้า">
                    {currentPayment.booking?.customer?.first_name}{" "}
                    {currentPayment.booking?.customer?.last_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="จำนวนเงิน">
                    {currentPayment.amount?.toLocaleString()} บาท
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่ชำระเงิน">
                    {formatDateTime(currentPayment.payment_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="วิธีการชำระเงิน">
                    {getPaymentMethodText(currentPayment.payment_method)}
                  </Descriptions.Item>
                  {currentPayment.reference_number && (
                    <Descriptions.Item label="หมายเลขอ้างอิง">
                      {currentPayment.reference_number}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="ข้อมูลการจอง">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="วันที่เช็คอิน">
                    {formatDate(currentPayment.booking?.check_in_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่เช็คเอาท์">
                    {formatDate(currentPayment.booking?.check_out_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="ห้องพัก">
                    {currentPayment.booking?.room?.room_number} (
                    {currentPayment.booking?.room?.room_type?.name})
                  </Descriptions.Item>
                  <Descriptions.Item label="ราคารวม">
                    {currentPayment.booking?.total_price?.toLocaleString()} บาท
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {currentPayment.slip_image_url && (
              <Col span={24}>
                <Card size="small" title="สลิปการโอนเงิน">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Image
                      src={currentPayment.slip_image_url}
                      alt="หลักฐานการชำระเงิน"
                      style={{ maxHeight: 400 }}
                    />
                  </div>
                </Card>
              </Col>
            )}

            {currentPayment.notes && (
              <Col span={24}>
                <Card size="small" title="หมายเหตุ">
                  <div
                    style={{
                      padding: 8,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 4,
                    }}
                  >
                    {currentPayment.notes}
                  </div>
                </Card>
              </Col>
            )}

            <Col span={24}>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                {currentPayment.status === "pending" && (
                  <>
                    <Button
                      type="primary"
                      onClick={() =>
                        showConfirmation(currentPayment.id, "confirm")
                      }
                      loading={loading}
                      icon={<CheckCircleOutlined />}
                    >
                      ยืนยันการชำระเงิน
                    </Button>
                    <Button
                      danger
                      onClick={() =>
                        showConfirmation(currentPayment.id, "reject")
                      }
                      loading={loading}
                      icon={<CloseCircleOutlined />}
                    >
                      ปฏิเสธการชำระเงิน
                    </Button>
                  </>
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

export default AdminPayments;
