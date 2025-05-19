import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Radio, 
  Statistic, 
  Table, 
  Typography,
  Space,
  Progress
} from 'antd';
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import locale from 'antd/es/date-picker/locale/th_TH';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// Import Chart Components
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function AdminReports() {
  const [reportType, setReportType] = useState('bookings');
  const [timeRange, setTimeRange] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month')
  });
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    occupancy_rate: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [reportType, timeRange, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // โหลดข้อมูลตัวอย่าง (mock data)
      const mockMonthlyData = [
        { month: 'ม.ค.', bookings: 32, revenue: 64000, occupancy: 45 },
        { month: 'ก.พ.', bookings: 38, revenue: 76000, occupancy: 52 },
        { month: 'มี.ค.', bookings: 45, revenue: 90000, occupancy: 60 },
        { month: 'เม.ย.', bookings: 55, revenue: 110000, occupancy: 72 },
        { month: 'พ.ค.', bookings: 50, revenue: 100000, occupancy: 65 },
      ];
      
      setMonthlyData(mockMonthlyData);
      
      // ข้อมูลสถิติการจอง (mock)
      setBookingStats({
        total: 120,
        completed: 85,
        cancelled: 15,
        revenue: 240000,
        occupancy_rate: 62
      });
      
      // ในโครงการจริง: ดึงข้อมูลจาก Supabase
      /*
      // ตัวอย่าง: ดึงข้อมูลการจองตามช่วงเวลา
      async function fetchBookingStats() {
        try {
          const start = dateRange.startDate.format('YYYY-MM-DD');
          const end = dateRange.endDate.format('YYYY-MM-DD');
          
          // ดึงจำนวนการจองทั้งหมด
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, status, total_price')
            .gte('check_in_date', start)
            .lte('check_out_date', end);
            
          if (bookingsError) throw bookingsError;
          
          // คำนวณสถิติต่างๆ
          const total = bookingsData.length;
          const completed = bookingsData.filter(b => b.status === 'completed').length;
          const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;
          const revenue = bookingsData
            .filter(b => b.status !== 'cancelled')
            .reduce((sum, booking) => sum + booking.total_price, 0);
            
          // ดึงข้อมูลห้องพักทั้งหมด
          const { data: roomsData, error: roomsError } = await supabase
            .from('rooms')
            .select('id');
            
          if (roomsError) throw roomsError;
          
          // คำนวณอัตราการเข้าพัก
          const totalRooms = roomsData.length;
          const totalDays = Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1;
          const totalPossibleRoomNights = totalRooms * totalDays;
          
          const occupancyRate = (completed / totalPossibleRoomNights) * 100;
          
          setBookingStats({
            total,
            completed,
            cancelled,
            revenue,
            occupancy_rate: parseFloat(occupancyRate.toFixed(2)) || 0
          });
        } catch (error) {
          console.error('Error fetching booking stats:', error);
        }
      }
      
      // ตัวอย่าง: ดึงข้อมูลการจองรายเดือน
      async function fetchMonthlyData() {
        try {
          const year = new Date().getFullYear();
          const startOfYear = `${year}-01-01`;
          const endOfYear = `${year}-12-31`;
          
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, check_in_date, total_price, status')
            .gte('check_in_date', startOfYear)
            .lte('check_in_date', endOfYear);
            
          if (bookingsError) throw bookingsError;
          
          // จัดกลุ่มข้อมูลตามเดือน
          const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
          const monthlyStats = months.map((month, index) => {
            const monthBookings = bookingsData.filter(booking => {
              const bookingDate = new Date(booking.check_in_date);
              return bookingDate.getMonth() === index;
            });
            
            const completedBookings = monthBookings.filter(b => b.status !== 'cancelled');
            const revenue = completedBookings.reduce((sum, booking) => sum + booking.total_price, 0);
            
            // คำนวณอัตราการเข้าพัก (ต้องดึงข้อมูลห้องทั้งหมดและคำนวณตามวันที่)
            // นี่เป็นตัวอย่างอย่างง่าย
            const occupancy = monthBookings.length > 0 ? 
              (completedBookings.length / monthBookings.length) * 100 : 0;
            
            return {
              month,
              bookings: monthBookings.length,
              revenue,
              occupancy: parseFloat(occupancy.toFixed(2))
            };
          });
          
          setMonthlyData(monthlyStats);
        } catch (error) {
          console.error('Error fetching monthly data:', error);
        }
      }
      
      fetchBookingStats();
      fetchMonthlyData();
      */
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (value) => {
    setReportType(value);
  };

  const handleTimeRangeChange = (e) => {
    const value = e.target.value;
    setTimeRange(value);
    
    let startDate, endDate;
    const today = dayjs();
    
    switch (value) {
      case 'week':
        startDate = today.startOf('week');
        endDate = today.endOf('week');
        break;
      case 'month':
        startDate = today.startOf('month');
        endDate = today.endOf('month');
        break;
      case 'quarter':
        startDate = today.startOf('quarter');
        endDate = today.endOf('quarter');
        break;
      case 'year':
        startDate = today.startOf('year');
        endDate = today.endOf('year');
        break;
      default:
        startDate = today.startOf('month');
        endDate = today.endOf('month');
    }
    
    setDateRange({ startDate, endDate });
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange({
        startDate: dates[0],
        endDate: dates[1]
      });
    }
  };

  const columns = [
    {
      title: 'เดือน',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'จำนวนการจอง',
      dataIndex: 'bookings',
      key: 'bookings',
      sorter: (a, b) => a.bookings - b.bookings,
    },
    {
      title: 'รายได้',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => `${value.toLocaleString()} บาท`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'อัตราการเข้าพัก',
      dataIndex: 'occupancy',
      key: 'occupancy',
      render: (value) => `${value}%`,
      sorter: (a, b) => a.occupancy - b.occupancy,
    }
  ];

  const getChartData = () => {
    return monthlyData.map(item => {
      const dataValue = reportType === 'bookings' 
        ? item.bookings 
        : reportType === 'revenue' 
          ? item.revenue / 1000 // แสดงเป็นพันบาท
          : item.occupancy;
      
      return {
        name: item.month,
        value: dataValue,
        fill: reportType === 'bookings' 
          ? '#1890ff' 
          : reportType === 'revenue' 
            ? '#52c41a' 
            : '#faad14'
      };
    });
  };

  const getYAxisLabel = () => {
    return reportType === 'bookings' 
      ? 'จำนวนการจอง' 
      : reportType === 'revenue' 
        ? 'รายได้ (พันบาท)' 
        : 'อัตราการเข้าพัก (%)';
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>รายงานและสถิติ</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ marginRight: 8 }}>ประเภทรายงาน:</label>
              </div>
              <Select
                style={{ width: '100%' }}
                value={reportType}
                onChange={handleReportTypeChange}
              >
                <Option value="bookings">การจอง</Option>
                <Option value="revenue">รายได้</Option>
                <Option value="occupancy">อัตราการเข้าพัก</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={16} md={10}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ marginRight: 8 }}>ช่วงเวลา:</label>
              </div>
              <Radio.Group 
                value={timeRange} 
                onChange={handleTimeRangeChange}
                options={[
                  { label: 'รายสัปดาห์', value: 'week' },
                  { label: 'รายเดือน', value: 'month' },
                  { label: 'รายไตรมาส', value: 'quarter' },
                  { label: 'รายปี', value: 'year' },
                  { label: 'กำหนดเอง', value: 'custom' }
                ]}
              />
            </Col>
            
            {timeRange === 'custom' && (
              <Col xs={24} sm={24} md={8}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ marginRight: 8 }}>เลือกช่วงวันที่:</label>
                </div>
                <RangePicker
                  style={{ width: '100%' }}
                  locale={locale}
                  value={[dateRange.startDate, dateRange.endDate]}
                  onChange={handleDateRangeChange}
                />
              </Col>
            )}
          </Row>
        </Space>
      </Card>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="การจองทั้งหมด"
              value={bookingStats.total}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="การจองที่สำเร็จ"
              value={bookingStats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="การจองที่ยกเลิก"
              value={bookingStats.cancelled}
              prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="รายได้รวม"
              value={bookingStats.revenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="บาท"
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card 
            title={
              reportType === 'bookings' 
                ? 'จำนวนการจองรายเดือน' 
                : reportType === 'revenue' 
                  ? 'รายได้รายเดือน' 
                  : 'อัตราการเข้าพักรายเดือน'
            }
            loading={loading}
          >
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => {
                      if (reportType === 'revenue') {
                        return [`${(value * 1000).toLocaleString()} บาท`, 'รายได้'];
                      } else if (reportType === 'occupancy') {
                        return [`${value}%`, 'อัตราการเข้าพัก'];
                      } else {
                        return [value, 'จำนวนการจอง'];
                      }
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name={
                      reportType === 'bookings' 
                        ? 'จำนวนการจอง' 
                        : reportType === 'revenue' 
                          ? 'รายได้ (พันบาท)' 
                          : 'อัตราการเข้าพัก (%)'
                    } 
                    fill={
                      reportType === 'bookings' 
                        ? '#1890ff' 
                        : reportType === 'revenue' 
                          ? '#52c41a' 
                          : '#faad14'
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="ข้อมูลรายเดือน" loading={loading}>
            <Table
              columns={columns}
              dataSource={monthlyData}
              rowKey="month"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="อัตราการเข้าพักโดยรวม" style={{ marginTop: 16 }} loading={loading}>
        <Progress 
          percent={bookingStats.occupancy_rate} 
          status="active" 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          format={percent => `${percent}%`}
        />
      </Card>
    </div>
  );
}

export default AdminReports;