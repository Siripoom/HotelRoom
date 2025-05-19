import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography } from 'antd';
import { HomeOutlined, CalendarOutlined, DollarOutlined, BarChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const { Title } = Typography;

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    pendingBookings: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // สมมติว่ามีข้อมูลในระบบแล้ว (ในโปรเจคจริงต้องดึงข้อมูลจาก Supabase)
      setStats({
        totalRooms: 50,
        availableRooms: 35,
        pendingBookings: 12,
        pendingPayments: 8,
        totalRevenue: 75000
      });

      // ข้อมูลการจองล่าสุด (mock data)
      const mockRecentBookings = Array.from({ length: 5 }, (_, i) => ({
        key: i + 1,
        id: `BK-${2025000 + i + 1}`,
        customer: `ลูกค้าตัวอย่าง ${i + 1}`,
        room: `${100 + i + 1}`,
        checkIn: '15/05/2025',
        checkOut: '17/05/2025',
        status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'confirmed' : 'checked-in'
      }));
      
      setRecentBookings(mockRecentBookings);

      // ในกรณีมีข้อมูลจริง
      /*
      // ดึงจำนวนห้องทั้งหมด
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*', { count: 'exact' });
        
      if (roomsError) throw roomsError;
      
      // ดึงจำนวนห้องว่าง
      const { data: availableRoomsData, error: availableRoomsError } = await supabase
        .from('rooms')
        .select('*', { count: 'exact' })
        .eq('status', 'available');
        
      if (availableRoomsError) throw availableRoomsError;
      
      // ดึงจำนวนการจองที่รอดำเนินการ
      const { data: pendingBookingsData, error: pendingBookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');
        
      if (pendingBookingsError) throw pendingBookingsError;
      
      // ดึงจำนวนการชำระเงินที่รอยืนยัน
      const { data: pendingPaymentsData, error: pendingPaymentsError } = await supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');
        
      if (pendingPaymentsError) throw pendingPaymentsError;
      
      // ดึงรายได้ทั้งหมด (จากการชำระเงินที่ยืนยันแล้ว)
      const { data: revenueData, error: revenueError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'confirmed');
        
      if (revenueError) throw revenueError;
      
      const totalRevenue = revenueData.reduce((sum, payment) => sum + payment.amount, 0);
      
      setStats({
        totalRooms: roomsData.length,
        availableRooms: availableRoomsData.length,
        pendingBookings: pendingBookingsData.length,
        pendingPayments: pendingPaymentsData.length,
        totalRevenue
      });

      // ดึงการจองล่าสุด
      const { data: recentBookingsData, error: recentBookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          customer:customer_id (first_name, last_name),
          room:room_id (room_number),
          check_in_date,
          check_out_date,
          status
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentBookingsError) throw recentBookingsError;

      const formattedBookings = recentBookingsData.map((booking, index) => ({
        key: index,
        id: booking.booking_number,
        customer: `${booking.customer.first_name} ${booking.customer.last_name}`,
        room: booking.room.room_number,
        checkIn: new Date(booking.check_in_date).toLocaleDateString('th-TH'),
        checkOut: new Date(booking.check_out_date).toLocaleDateString('th-TH'),
        status: booking.status
      }));

      setRecentBookings(formattedBookings);
      */
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'รหัสการจอง',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'ห้อง',
      dataIndex: 'room',
      key: 'room',
    },
    {
      title: 'วันที่เช็คอิน',
      dataIndex: 'checkIn',
      key: 'checkIn',
    },
    {
      title: 'วันที่เช็คเอาท์',
      dataIndex: 'checkOut',
      key: 'checkOut',
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = '';

        switch (status) {
          case 'pending':
            color = 'gold';
            text = 'รอการชำระเงิน';
            break;
          case 'confirmed':
            color = 'green';
            text = 'ยืนยันแล้ว';
            break;
          case 'checked-in':
            color = 'blue';
            text = 'เช็คอินแล้ว';
            break;
          case 'completed':
            color = 'cyan';
            text = 'เสร็จสิ้น';
            break;
          case 'cancelled':
            color = 'red';
            text = 'ยกเลิก';
            break;
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>ภาพรวมระบบ</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ห้องพักทั้งหมด"
              value={stats.totalRooms}
              prefix={<HomeOutlined />}
              suffix={<span style={{ fontSize: '14px', marginLeft: '8px' }}>{`ว่าง: ${stats.availableRooms}`}</span>}
            />
            <div style={{ marginTop: 8 }}>
              <div style={{ background: '#f0f0f0', height: 8, borderRadius: 4 }}>
                <div 
                  style={{ 
                    background: '#1890ff', 
                    height: 8, 
                    borderRadius: 4, 
                    width: `${(stats.availableRooms / stats.totalRooms) * 100}%` 
                  }} 
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การจองที่รอดำเนินการ"
              value={stats.pendingBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: stats.pendingBookings > 0 ? '#faad14' : '' }}
            />
            <div style={{ marginTop: 8 }}>
              <Link to="/admin/bookings">
                <Button type="link" size="small" style={{ padding: 0 }}>
                  ดูรายการที่รอดำเนินการ →
                </Button>
              </Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การชำระเงินที่รอยืนยัน"
              value={stats.pendingPayments}
              prefix={<DollarOutlined />}
              valueStyle={{ color: stats.pendingPayments > 0 ? '#52c41a' : '' }}
            />
            <div style={{ marginTop: 8 }}>
              <Link to="/admin/payments">
                <Button type="link" size="small" style={{ padding: 0 }}>
                  ตรวจสอบการชำระเงิน →
                </Button>
              </Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รายได้ทั้งหมด"
              value={stats.totalRevenue}
              prefix={<BarChartOutlined />}
              suffix="บาท"
              precision={2}
            />
            <div style={{ marginTop: 8 }}>
              <Link to="/admin/reports">
                <Button type="link" size="small" style={{ padding: 0 }}>
                  ดูรายงานรายได้ →
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="การจองล่าสุด" style={{ marginTop: 24 }} extra={<Link to="/admin/bookings">ดูทั้งหมด</Link>}>
        <Table
          columns={columns}
          dataSource={recentBookings}
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}

export default AdminDashboard;