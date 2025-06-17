import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Typography,
  List,
  Avatar,
  Progress,
  Space,
  Alert,
  Divider,
  Badge,
  Spin,
} from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import dashboardService from "../../services/dashboardService";

const { Title, Text } = Typography;

function AdminDashboard() {
  const [stats, setStats] = useState({
    rooms: {
      total: 0,
      available: 0,
      occupied: 0,
      maintenance: 0,
      occupancyRate: 0,
    },
    bookings: { today: 0, pending: 0, todayPending: 0, todayConfirmed: 0 },
    payments: { pending: 0, pendingAmount: 0 },
    revenue: { monthly: 0 },
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [dailyBookings, setDailyBookings] = useState([]);
  const [roomTypeUsage, setRoomTypeUsage] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [todayCheckInOut, setTodayCheckInOut] = useState({
    checkIns: [],
    checkOuts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // รีเฟรชข้อมูลทุก 5 นาที
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        overviewStats,
        recentBookingsData,
        dailyRevenueData,
        dailyBookingsData,
        roomTypeUsageData,
        notificationsData,
        todayCheckInOutData,
      ] = await Promise.all([
        dashboardService.getOverviewStats(),
        dashboardService.getRecentBookings(5),
        dashboardService.getDailyRevenue(7),
        dashboardService.getDailyBookings(7),
        dashboardService.getRoomTypeUsage(),
        dashboardService.getNotifications(),
        dashboardService.getTodayCheckInOut(),
      ]);

      setStats(overviewStats);
      setRecentBookings(recentBookingsData);
      setDailyRevenue(dailyRevenueData);
      setDailyBookings(dailyBookingsData);
      setRoomTypeUsage(roomTypeUsageData);
      setNotifications(notificationsData);
      setTodayCheckInOut(todayCheckInOutData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    let color, text;
    switch (status) {
      case "pending":
        color = "gold";
        text = "รอการยืนยัน";
        break;
      case "confirmed":
        color = "green";
        text = "ยืนยันแล้ว";
        break;
      case "completed":
        color = "blue";
        text = "เสร็จสิ้น";
        break;
      case "cancelled":
        color = "red";
        text = "ยกเลิก";
        break;
      default:
        color = "default";
        text = status;
    }
    return <Tag color={color}>{text}</Tag>;
  };

  const recentBookingsColumns = [
    {
      title: "รหัสการจอง",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "ลูกค้า",
      dataIndex: "customer",
      key: "customer",
      width: 150,
    },
    {
      title: "ห้อง",
      dataIndex: "room",
      key: "room",
      width: 120,
    },
    {
      title: "วันที่เข้าพัก",
      dataIndex: "checkIn",
      key: "checkIn",
      width: 100,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => getStatusTag(status),
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const roomStatusData = [
    { name: "ห้องว่าง", value: stats.rooms.available, color: "#52c41a" },
    { name: "ห้องไม่ว่าง", value: stats.rooms.occupied, color: "#1890ff" },
    { name: "ปรับปรุง", value: stats.rooms.maintenance, color: "#faad14" },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            ภาพรวมระบบ
          </Title>
          <Text type="secondary">
            ข้อมูล ณ วันที่ {new Date().toLocaleDateString("th-TH")}
          </Text>
        </Col>
        <Col>
          <Space>
            <Badge count={notifications.length} offset={[10, 0]}>
              <Button icon={<BellOutlined />}>การแจ้งเตือน</Button>
            </Badge>
            <Button onClick={fetchDashboardData} loading={loading}>
              รีเฟรช
            </Button>
          </Space>
        </Col>
      </Row>

      {/* สถิติหลัก */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ห้องพักทั้งหมด"
              value={stats.rooms.total}
              prefix={<HomeOutlined />}
              suffix={
                <div style={{ fontSize: "14px", marginTop: 8 }}>
                  <div>ว่าง: {stats.rooms.available}</div>
                  <div>ไม่ว่าง: {stats.rooms.occupied}</div>
                </div>
              }
            />
            <Progress
              percent={stats.rooms.occupancyRate}
              status="active"
              size="small"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              อัตราการเข้าพัก {stats.rooms.occupancyRate}%
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การจองวันนี้"
              value={stats.bookings.today}
              prefix={<CalendarOutlined />}
              suffix={
                <div style={{ fontSize: "14px", marginTop: 8 }}>
                  <div style={{ color: "#52c41a" }}>
                    ยืนยัน: {stats.bookings.todayConfirmed}
                  </div>
                  <div style={{ color: "#faad14" }}>
                    รอ: {stats.bookings.todayPending}
                  </div>
                </div>
              }
            />
            <Link to="/admin/bookings">
              <Button
                type="link"
                size="small"
                style={{ padding: 0, marginTop: 8 }}
              >
                ดูรายการการจอง →
              </Button>
            </Link>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การชำระเงินรอยืนยัน"
              value={stats.payments.pending}
              prefix={<DollarOutlined />}
              suffix={
                <div style={{ fontSize: "14px", marginTop: 8 }}>
                  <div>
                    ยอดเงิน: {stats.payments.pendingAmount.toLocaleString()} บาท
                  </div>
                </div>
              }
              valueStyle={{
                color: stats.payments.pending > 0 ? "#faad14" : "",
              }}
            />
            <Link to="/admin/payments">
              <Button
                type="link"
                size="small"
                style={{ padding: 0, marginTop: 8 }}
              >
                ตรวจสอบการชำระเงิน →
              </Button>
            </Link>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รายได้เดือนนี้"
              value={stats.revenue.monthly}
              precision={0}
              prefix={<BarChartOutlined />}
              suffix="บาท"
            />
            <Link to="/admin/reports">
              <Button
                type="link"
                size="small"
                style={{ padding: 0, marginTop: 8 }}
              >
                ดูรายงานรายได้ →
              </Button>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* แจ้งเตือนสำคัญ */}
      {(stats.bookings.pending > 5 || stats.payments.pending > 5) && (
        <Row style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Alert
              message="มีรายการที่ต้องดำเนินการ"
              description={
                <Space direction="vertical">
                  {stats.bookings.pending > 5 && (
                    <Text>
                      มีการจองรอดำเนินการ {stats.bookings.pending} รายการ
                    </Text>
                  )}
                  {stats.payments.pending > 5 && (
                    <Text>
                      มีการชำระเงินรอยืนยัน {stats.payments.pending} รายการ
                    </Text>
                  )}
                </Space>
              }
              type="warning"
              showIcon
              closable
            />
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* กราฟรายได้รายวัน */}
        <Col xs={24} lg={12}>
          <Card title="รายได้รายวัน (7 วันล่าสุด)" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${value.toLocaleString()} บาท`,
                    "รายได้",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* กราฟการจองรายวัน */}
        <Col xs={24} lg={12}>
          <Card title="การจองรายวัน (7 วันล่าสุด)" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
                <Bar dataKey="confirmed" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* สถานะห้องพัก */}
        <Col xs={24} lg={8}>
          <Card title="สถานะห้องพัก" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16 }}>
              {roomStatusData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: item.color }}>● {item.name}</span>
                  <span>{item.value} ห้อง</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* เช็คอิน/เช็คเอาท์วันนี้ */}
        <Col xs={24} lg={8}>
          <Card title="เช็คอิน/เช็คเอาท์วันนี้" style={{ height: 350 }}>
            <div style={{ height: 280, overflowY: "auto" }}>
              <div style={{ marginBottom: 16 }}>
                <Title level={5} style={{ color: "#52c41a", margin: 0 }}>
                  <LoginOutlined /> เช็คอิน ({todayCheckInOut.checkIns.length})
                </Title>
                <Divider style={{ margin: "8px 0" }} />
                {todayCheckInOut.checkIns.length > 0 ? (
                  todayCheckInOut.checkIns.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 8,
                        padding: 8,
                        backgroundColor: "#f6ffed",
                        borderRadius: 4,
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {item.bookingNumber}
                      </div>
                      <div style={{ fontSize: "11px" }}>
                        {item.customerName}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        {item.room}
                      </div>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">ไม่มีเช็คอินวันนี้</Text>
                )}
              </div>

              <div>
                <Title level={5} style={{ color: "#1890ff", margin: 0 }}>
                  <LogoutOutlined /> เช็คเอาท์ (
                  {todayCheckInOut.checkOuts.length})
                </Title>
                <Divider style={{ margin: "8px 0" }} />
                {todayCheckInOut.checkOuts.length > 0 ? (
                  todayCheckInOut.checkOuts.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 8,
                        padding: 8,
                        backgroundColor: "#e6f7ff",
                        borderRadius: 4,
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {item.bookingNumber}
                      </div>
                      <div style={{ fontSize: "11px" }}>
                        {item.customerName}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        {item.room}
                      </div>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">ไม่มีเช็คเอาท์วันนี้</Text>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* การแจ้งเตือน */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <BellOutlined />
                การแจ้งเตือนล่าสุด
                <Badge count={notifications.length} size="small" />
              </Space>
            }
            style={{ height: 350 }}
          >
            <div style={{ height: 280, overflowY: "auto" }}>
              <List
                size="small"
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item style={{ padding: "8px 0" }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size="small"
                          style={{
                            backgroundColor:
                              item.type === "warning" ? "#faad14" : "#1890ff",
                          }}
                          icon={
                            item.type === "warning" ? (
                              <ExclamationCircleOutlined />
                            ) : (
                              <CheckCircleOutlined />
                            )
                          }
                        />
                      }
                      title={
                        <div style={{ fontSize: "12px" }}>
                          <strong>{item.title}</strong>
                          <Text
                            type="secondary"
                            style={{ fontSize: "10px", marginLeft: 8 }}
                          >
                            {new Date(item.time).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </div>
                      }
                      description={
                        <Link to={item.link} style={{ fontSize: "11px" }}>
                          {item.message}
                        </Link>
                      }
                    />
                  </List.Item>
                )}
              />
              {notifications.length === 0 && (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <Text type="secondary">ไม่มีการแจ้งเตือนใหม่</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* การใช้งานตามประเภทห้อง */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="การใช้งานตามประเภทห้อง">
            <Row gutter={[16, 16]}>
              {roomTypeUsage.map((roomType, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card size="small" style={{ textAlign: "center" }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {roomType.name}
                    </Title>
                    <div style={{ margin: "16px 0" }}>
                      <Progress
                        type="circle"
                        percent={roomType.occupancyRate}
                        size={80}
                        status={
                          roomType.occupancyRate > 80 ? "success" : "normal"
                        }
                      />
                    </div>
                    <div style={{ fontSize: "12px" }}>
                      <div>ทั้งหมด: {roomType.totalRooms} ห้อง</div>
                      <div style={{ color: "#52c41a" }}>
                        ว่าง: {roomType.availableRooms}
                      </div>
                      <div style={{ color: "#1890ff" }}>
                        ไม่ว่าง: {roomType.occupiedRooms}
                      </div>
                      <div style={{ color: "#666" }}>
                        จอง: {roomType.totalBookings} ครั้ง
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* การจองล่าสุด */}
      <Card
        title="การจองล่าสุด"
        extra={<Link to="/admin/bookings">ดูทั้งหมด</Link>}
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={recentBookingsColumns}
          dataSource={recentBookings}
          pagination={false}
          size="small"
          scroll={{ x: 600 }}
        />
      </Card>

      {/* ข้อมูลสรุป */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="ลิงก์ด่วน" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Link to="/admin/rooms">
                <Button block icon={<HomeOutlined />}>
                  จัดการห้องพัก
                </Button>
              </Link>
              <Link to="/admin/bookings">
                <Button block icon={<CalendarOutlined />}>
                  จัดการการจอง
                </Button>
              </Link>
              <Link to="/admin/payments">
                <Button block icon={<DollarOutlined />}>
                  จัดการการชำระเงิน
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button block icon={<BarChartOutlined />}>
                  รายงานและสถิติ
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="ข้อมูลเพิ่มเติม" size="small">
            <div style={{ fontSize: "12px" }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>เวลาอัปเดตล่าสุด:</Text>
                <div>{new Date().toLocaleString("th-TH")}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>สถิติเดือนนี้:</Text>
                <div>• การจองทั้งหมด: {stats.bookings.today} รายการ</div>
                <div>
                  • รายได้: {stats.revenue.monthly.toLocaleString()} บาท
                </div>
                <div>• อัตราการเข้าพัก: {stats.rooms.occupancyRate}%</div>
              </div>
              <div>
                <Text strong>ระบบ:</Text>
                <div>• ห้องพักทั้งหมด: {stats.rooms.total} ห้อง</div>
                <div>• ประเภทห้อง: {roomTypeUsage.length} ประเภท</div>
                <div>• การแจ้งเตือน: {notifications.length} รายการ</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;
