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
  message, 
  Image 
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

const { Title, Text } = Typography;
const { confirm } = Modal;

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(payment => payment.status === activeTab));
    }
  }, [activeTab, payments]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // ในตอนนี้ใช้ข้อมูลตัวอย่าง (mock data)
      // ในโปรเจคจริงควรดึงข้อมูลจาก Supabase
      const mockPayments = [
        {
          key: '1',
          id: '1',
          booking: { 
            id: '1', 
            booking_number: 'B-2025001',
            customer: { first_name: 'สมชาย', last_name: 'ใจดี' },
            check_in_date: '2025-05-15',
            check_out_date: '2025-05-17',
            total_price: 2000
          },
          amount: 2000,
          payment_date: '2025-05-10T12:30:00Z',
          payment_method: 'bank_transfer',
          slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
          status: 'pending',
          created_at: '2025-05-10T12:30:00Z'
        },
        {
          key: '2',
          id: '2',
          booking: { 
            id: '2', 
            booking_number: 'B-2025002',
            customer: { first_name: 'วิชัย', last_name: 'รักสงบ' },
            check_in_date: '2025-05-20',
            check_out_date: '2025-05-25',
            total_price: 5000
          },
          amount: 5000,
          payment_date: '2025-05-11T15:45:00Z',
          payment_method: 'bank_transfer',
          slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
          status: 'confirmed',
          created_at: '2025-05-11T15:45:00Z'
        },
        {
          key: '3',
          id: '3',
          booking: { 
            id: '3', 
            booking_number: 'B-2025003',
            customer: { first_name: 'สุดา', last_name: 'แสนดี' },
            check_in_date: '2025-05-14',
            check_out_date: '2025-05-16',
            total_price: 3000
          },
          amount: 3000,
          payment_date: '2025-05-05T10:20:00Z',
          payment_method: 'bank_transfer',
          slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
          status: 'confirmed',
          created_at: '2025-05-05T10:20:00Z'
        },
        {
          key: '4',
          id: '4',
          booking: { 
            id: '4', 
            booking_number: 'B-2025004',
            customer: { first_name: 'มานะ', last_name: 'ตั้งใจ' },
            check_in_date: '2025-05-18',
            check_out_date: '2025-05-20',
            total_price: 5000
          },
          amount: 5000,
          payment_date: '2025-05-08T17:10:00Z',
          payment_method: 'bank_transfer',
          slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
          status: 'rejected',
          created_at: '2025-05-08T17:10:00Z'
        },
        {
          key: '5',
          id: '5',
          booking: { 
            id: '5', 
            booking_number: 'B-2025005',
            customer: { first_name: 'พรรณี', last_name: 'สวยงาม' },
            check_in_date: '2025-05-22',
            check_out_date: '2025-05-24',
            total_price: 3000
          },
          amount: 3000,
          payment_date: '2025-05-12T14:25:00Z',
          payment_method: 'bank_transfer',
          slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
          status: 'pending',
          created_at: '2025-05-12T14:25:00Z'
        },
      ];
      
      setPayments(mockPayments);
      setFilteredPayments(mockPayments);
      
      // ตัวอย่างการดึงข้อมูลจาก Supabase (uncomment เมื่อมีข้อมูลจริง)
      /*
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:booking_id (
            id,
            booking_number,
            check_in_date,
            check_out_date,
            total_price,
            customer:customer_id (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPayments(data.map((item, index) => ({ key: index.toString(), ...item })));
      setFilteredPayments(data.map((item, index) => ({ key: index.toString(), ...item })));
      */
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('ไม่สามารถโหลดข้อมูลการชำระเงินได้');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (payment) => {
    setCurrentPayment(payment);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentPayment(null);
  };

  const showConfirmation = (paymentId, action) => {
    const { type, title, content, statusValue } = 
      action === 'confirm' 
        ? {
            type: 'success',
            title: 'ยืนยันการชำระเงิน',
            content: 'คุณต้องการยืนยันการชำระเงินนี้ใช่หรือไม่?',
            statusValue: 'confirmed'
          }
        : {
            type: 'danger',
            title: 'ปฏิเสธการชำระเงิน',
            content: 'คุณต้องการปฏิเสธการชำระเงินนี้ใช่หรือไม่?',
            statusValue: 'rejected'
          };

    confirm({
      title,
      icon: action === 'confirm' ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
      content,
      okText: 'ยืนยัน',
      okType: action === 'confirm' ? 'primary' : 'danger',
      cancelText: 'ยกเลิก',
      onOk() {
        handleStatusChange(paymentId, statusValue);
      }
    });
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      setLoading(true);
      // ในโครงการจริง: อัปเดตข้อมูลใน Supabase
      /*
      // อัปเดตสถานะการชำระเงิน
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', paymentId)
        .select();
        
      if (paymentError) throw paymentError;
      
      // หากยืนยันการชำระเงิน ให้อัปเดตสถานะการจองเป็น confirmed
      if (newStatus === 'confirmed') {
        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', payment.booking.id)
            .select();
            
          if (bookingError) throw bookingError;
        }
      }
      */
      
      // อัปเดตข้อมูลในสถานะ (mock)
      const updatedPayments = payments.map(payment => {
        if (payment.id === paymentId) {
          return { ...payment, status: newStatus };
        }
        return payment;
      });
      setPayments(updatedPayments);
      
      message.success(`อัปเดตสถานะการชำระเงินเป็น "${getStatusText(newStatus)}" สำเร็จ`);
      handleCancel();
    } catch (error) {
      console.error('Error updating payment status:', error);
      message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอการยืนยัน';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'rejected': return 'ปฏิเสธ';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH');
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'bank_transfer': return 'โอนเงิน';
      case 'credit_card': return 'บัตรเครดิต';
      case 'promptpay': return 'พร้อมเพย์';
      default: return method;
    }
  };

  const columns = [
    {
      title: 'เลขที่การจอง',
      dataIndex: ['booking', 'booking_number'],
      key: 'booking_number',
    },
    {
      title: 'ลูกค้า',
      key: 'customer',
      render: (_, record) => `${record.booking.customer.first_name} ${record.booking.customer.last_name}`
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString()} บาท`
    },
    {
      title: 'วันที่ชำระเงิน',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date) => formatDateTime(date)
    },
    {
      title: 'วิธีการชำระเงิน',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => getPaymentMethodText(method)
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          pending: 'gold',
          confirmed: 'green',
          rejected: 'red'
        };
        
        return <Tag color={statusColors[status] || 'default'}>{getStatusText(status)}</Tag>;
      },
      filters: [
        { text: 'รอการยืนยัน', value: 'pending' },
        { text: 'ยืนยันแล้ว', value: 'confirmed' },
        { text: 'ปฏิเสธ', value: 'rejected' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={() => showModal(record)}
        >
          ตรวจสอบ
        </Button>
      ),
    }
  ];

  const tabItems = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'pending', label: 'รอการยืนยัน' },
    { key: 'confirmed', label: 'ยืนยันแล้ว' },
    { key: 'rejected', label: 'ปฏิเสธ' }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>จัดการการชำระเงิน</Title>
      
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
        />
      </Card>
      
      {/* Modal แสดงรายละเอียดการชำระเงิน */}
      {currentPayment && (
        <Modal
          title={`ตรวจสอบการชำระเงิน: ${currentPayment.booking.booking_number}`}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card size="small" title="สถานะการชำระเงิน">
                <Tag color={
                  currentPayment.status === 'pending' ? 'gold' :
                  currentPayment.status === 'confirmed' ? 'green' :
                  currentPayment.status === 'rejected' ? 'red' : 'default'
                } style={{ fontSize: '14px', padding: '4px 8px' }}>
                  {getStatusText(currentPayment.status)}
                </Tag>
              </Card>
            </Col>
            
            <Col span={24}>
              <Card size="small" title="ข้อมูลการชำระเงิน">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="ลูกค้า">
                    {currentPayment.booking.customer.first_name} {currentPayment.booking.customer.last_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="จำนวนเงิน">
                    {currentPayment.amount.toLocaleString()} บาท
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่ชำระเงิน">
                    {formatDateTime(currentPayment.payment_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="วิธีการชำระเงิน">
                    {getPaymentMethodText(currentPayment.payment_method)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            
            <Col span={24}>
              <Card size="small" title="ข้อมูลการจอง">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="วันที่เช็คอิน">
                    {formatDate(currentPayment.booking.check_in_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="วันที่เช็คเอาท์">
                    {formatDate(currentPayment.booking.check_out_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="ราคารวม">
                    {currentPayment.booking.total_price.toLocaleString()} บาท
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            
            <Col span={24}>
              <Card size="small" title="สลิปการโอนเงิน">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <Image
                    src={currentPayment.slip_image_url}
                    alt="หลักฐานการชำระเงิน"
                    style={{ maxHeight: 300 }}
                  />
                </div>
              </Card>
            </Col>
            
            <Col span={24}>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {currentPayment.status === 'pending' && (
                  <>
                    <Button
                      type="primary"
                      onClick={() => showConfirmation(currentPayment.id, 'confirm')}
                      loading={loading}
                      icon={<CheckCircleOutlined />}
                    >
                      ยืนยันการชำระเงิน
                    </Button>
                    <Button
                      danger
                      onClick={() => showConfirmation(currentPayment.id, 'reject')}
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