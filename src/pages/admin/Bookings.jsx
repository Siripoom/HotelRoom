import { useState, useEffect } from 'react';
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
  message 
} from 'antd';
import { supabase } from '../../lib/supabase';

const { Title, Text } = Typography;

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === activeTab));
    }
  }, [activeTab, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // ในตอนนี้ใช้ข้อมูลตัวอย่าง (mock data)
      // ในโปรเจคจริงควรดึงข้อมูลจาก Supabase
      const mockBookings = [
        {
          key: '1',
          id: '1',
          booking_number: 'B-2025001',
          customer: { first_name: 'สมชาย', last_name: 'ใจดี', email: 'somchai@example.com', phone: '081-234-5678' },
          room: { room_number: '101', room_type: { name: 'ห้องเตียงเดี่ยว' } },
          check_in_date: '2025-05-15',
          check_out_date: '2025-05-17',
          total_price: 2000,
          status: 'pending',
          created_at: '2025-05-10T10:30:00Z',
          payment_status: 'pending'
        },
        {
          key: '2',
          id: '2',
          booking_number: 'B-2025002',
          customer: { first_name: 'วิชัย', last_name: 'รักสงบ', email: 'wichai@example.com', phone: '081-876-5432' },
          room: { room_number: '102', room_type: { name: 'ห้องเตียงเดี่ยว' } },
          check_in_date: '2025-05-20',
          check_out_date: '2025-05-25',
          total_price: 5000,
          status: 'confirmed',
          created_at: '2025-05-11T14:20:00Z',
          payment_status: 'confirmed'
        },
        {
          key: '3',
          id: '3',
          booking_number: 'B-2025003',
          customer: { first_name: 'สุดา', last_name: 'แสนดี', email: 'suda@example.com', phone: '081-111-2222' },
          room: { room_number: '201', room_type: { name: 'ห้องเตียงคู่' } },
          check_in_date: '2025-05-14',
          check_out_date: '2025-05-16',
          total_price: 3000,
          status: 'completed',
          created_at: '2025-05-05T09:15:00Z',
          payment_status: 'confirmed'
        },
        {
          key: '4',
          id: '4',
          booking_number: 'B-2025004',
          customer: { first_name: 'มานะ', last_name: 'ตั้งใจ', email: 'mana@example.com', phone: '081-333-4444' },
          room: { room_number: '301', room_type: { name: 'ห้องสวีท' } },
          check_in_date: '2025-05-18',
          check_out_date: '2025-05-20',
          total_price: 5000,
          status: 'cancelled',
          created_at: '2025-05-08T16:40:00Z',
          payment_status: 'refunded'
        },
        {
          key: '5',
          id: '5',
          booking_number: 'B-2025005',
          customer: { first_name: 'พรรณี', last_name: 'สวยงาม', email: 'pannee@example.com', phone: '081-555-6666' },
          room: { room_number: '202', room_type: { name: 'ห้องเตียงคู่' } },
          check_in_date: '2025-05-22',
          check_out_date: '2025-05-24',
          total_price: 3000,
          status: 'pending',
          created_at: '2025-05-12T11:10:00Z',
          payment_status: 'pending'
        },
      ];
      
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      
      // ตัวอย่างการดึงข้อมูลจาก Supabase (uncomment เมื่อมีข้อมูลจริง)
      /*
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (*),
          room:room_id (
            room_number,
            room_type:room_type_id (name)
          ),
          payments (*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // เพิ่มสถานะการชำระเงิน
      const bookingsWithPaymentStatus = data.map((booking, index) => {
        const payment = booking.payments && booking.payments.length > 0 
          ? booking.payments[0] 
          : null;
          
        return {
          key: index.toString(),
          ...booking,
          payment_status: payment ? payment.status : 'pending'
        };
      });
      
      setBookings(bookingsWithPaymentStatus);
      setFilteredBookings(bookingsWithPaymentStatus);
      */
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (booking) => {
    setCurrentBooking(booking);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentBooking(null);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      // ในโครงการจริง: อัปเดตข้อมูลใน Supabase
      /*
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .select();
        
      if (error) throw error;
      */
      
      // อัปเดตข้อมูลในสถานะ (mock)
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      setBookings(updatedBookings);
      
      message.success(`อัปเดตสถานะการจองเป็น "${getStatusText(newStatus)}" สำเร็จ`);
      handleCancel();
    } catch (error) {
      console.error('Error updating booking status:', error);
      message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอการยืนยัน';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอการยืนยัน';
      case 'confirmed': return 'ชำระแล้ว';
      case 'rejected': return 'ปฏิเสธ';
      case 'refunded': return 'คืนเงินแล้ว';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const columns = [
    {
      title: 'เลขที่การจอง',
      dataIndex: 'booking_number',
      key: 'booking_number',
    },
    {
      title: 'ลูกค้า',
      key: 'customer',
      render: (_, record) => `${record.customer.first_name} ${record.customer.last_name}`
    },
    {
      title: 'ห้อง',
      key: 'room',
      render: (_, record) => `${record.room.room_number} (${record.room.room_type.name})`
    },
    {
      title: 'วันที่เข้าพัก',
      key: 'dates',
      render: (_, record) => `${formatDate(record.check_in_date)} - ${formatDate(record.check_out_date)}`
    },
    {
      title: 'สถานะ',
      key: 'status',
      render: (_, record) => {
        const statusColors = {
          pending: 'gold',
          confirmed: 'green',
          completed: 'blue',
          cancelled: 'red'
        };
        
        return <Tag color={statusColors[record.status] || 'default'}>{getStatusText(record.status)}</Tag>;
      },
      filters: [
        { text: 'รอการยืนยัน', value: 'pending' },
        { text: 'ยืนยันแล้ว', value: 'confirmed' },
        { text: 'เสร็จสิ้น', value: 'completed' },
        { text: 'ยกเลิก', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'การชำระเงิน',
      key: 'payment_status',
      render: (_, record) => {
        const paymentStatusColors = {
          pending: 'gold',
          confirmed: 'green',
          rejected: 'red',
          refunded: 'blue'
        };
        
        return <Tag color={paymentStatusColors[record.payment_status] || 'default'}>{getPaymentStatusText(record.payment_status)}</Tag>;
      }
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => showModal(record)}>
          รายละเอียด
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'pending', label: 'รอการยืนยัน' },
    { key: 'confirmed', label: 'ยืนยันแล้ว' },
    { key: 'completed', label: 'เสร็จสิ้น' },
    { key: 'cancelled', label: 'ยกเลิก' }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>จัดการการจอง</Title>
      
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
        />
      </Card>
      
      {/* Modal แสดงรายละเอียดการจอง */}
      {currentBooking && (
        <Modal
          title={`รายละเอียดการจอง: ${currentBooking.booking_number}`}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card size="small" title="สถานะ">
                <Space size="large">
                  <div>
                    <Text type="secondary">สถานะการจอง:</Text>
                    <div>
                      <Tag color={
                        currentBooking.status === 'pending' ? 'gold' :
                        currentBooking.status === 'confirmed' ? 'green' :
                        currentBooking.status === 'completed' ? 'blue' :
                        currentBooking.status === 'cancelled' ? 'red' : 'default'
                      }>
                        {getStatusText(currentBooking.status)}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">สถานะการชำระเงิน:</Text>
                    <div>
                      <Tag color={
                        currentBooking.payment_status === 'pending' ? 'gold' :
                        currentBooking.payment_status === 'confirmed' ? 'green' :
                        currentBooking.payment_status === 'rejected' ? 'red' :
                        currentBooking.payment_status === 'refunded' ? 'blue' : 'default'
                      }>
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
                    {currentBooking.customer.first_name} {currentBooking.customer.last_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="อีเมล">
                    {currentBooking.customer.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="เบอร์โทร">
                    {currentBooking.customer.phone}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            
            <Col span={24}>
              <Card size="small" title="ข้อมูลการจอง">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="เลขห้อง">
                    {currentBooking.room.room_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="ประเภทห้อง">
                    {currentBooking.room.room_type.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่เช็คอิน">
                    {formatDate(currentBooking.check_in_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่เช็คเอาท์">
                    {formatDate(currentBooking.check_out_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="ราคารวม">
                    {currentBooking.total_price.toLocaleString()} บาท
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่จอง">
                    {new Date(currentBooking.created_at).toLocaleString('th-TH')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            
            <Col span={24}>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {currentBooking.status === 'pending' && (
                  <>
                    <Button
                      type="primary"
                      onClick={() => handleStatusChange(currentBooking.id, 'confirmed')}
                      loading={loading}
                    >
                      ยืนยันการจอง
                    </Button>
                    <Button
                      danger
                      onClick={() => handleStatusChange(currentBooking.id, 'cancelled')}
                      loading={loading}
                    >
                      ยกเลิกการจอง
                    </Button>
                  </>
                )}
                
                {currentBooking.status === 'confirmed' && (
                  <Button
                    type="primary"
                    onClick={() => handleStatusChange(currentBooking.id, 'completed')}
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