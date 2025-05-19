import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Tag, 
  Tooltip, 
  Typography, 
  Row, 
  Col, 
  Popconfirm,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  QuestionCircleOutlined, 
  PlusCircleOutlined 
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

const { Title, Text } = Typography;

function AdminRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [currentRoomType, setCurrentRoomType] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [amenityInputVisible, setAmenityInputVisible] = useState(false);
  const [amenityInputValue, setAmenityInputValue] = useState('');
  const amenityInputRef = useRef(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    if (amenityInputVisible) {
      amenityInputRef.current?.focus();
    }
  }, [amenityInputVisible]);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      // Add key property for Table component
      const dataWithKeys = data?.map(item => ({
        ...item,
        key: item.id
      })) || [];
      
      setRoomTypes(dataWithKeys);
    } catch (error) {
      console.error('Error fetching room types:', error);
      message.error('ไม่สามารถโหลดข้อมูลประเภทห้องพักได้');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (roomType = null) => {
    setCurrentRoomType(roomType);
    if (roomType) {
      form.setFieldsValue({
        name: roomType.name,
        description: roomType.description || '',
        base_price: roomType.base_price,
        capacity: roomType.capacity || 1,
      });
      setAmenities(roomType.amenities || []);
    } else {
      form.resetFields();
      setAmenities([]);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentRoomType(null);
    setAmenities([]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // ข้อมูลที่จะบันทึกลงฐานข้อมูล
      const roomTypeData = {
        name: values.name,
        description: values.description || '',
        base_price: values.base_price,
        capacity: values.capacity,
        amenities: amenities
      };
      
      if (currentRoomType) {
        // อัปเดตข้อมูลประเภทห้องพัก
        const { data, error } = await supabase
          .from('room_types')
          .update(roomTypeData)
          .eq('id', currentRoomType.id)
          .select();
          
        if (error) throw error;
        
        // อัปเดตข้อมูลในสถานะ
        setRoomTypes(roomTypes.map(roomType => 
          roomType.id === currentRoomType.id ? { ...data[0], key: data[0].id } : roomType
        ));
        
        message.success('อัปเดตประเภทห้องพักสำเร็จ');
      } else {
        // เพิ่มข้อมูลประเภทห้องพักใหม่
        const { data, error } = await supabase
          .from('room_types')
          .insert(roomTypeData)
          .select();
          
        if (error) throw error;
        
        // เพิ่มข้อมูลในสถานะ
        setRoomTypes([...roomTypes, { ...data[0], key: data[0].id }]);
        
        message.success('เพิ่มประเภทห้องพักใหม่สำเร็จ');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setCurrentRoomType(null);
      setAmenities([]);
    } catch (error) {
      console.error('Error saving room type:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setConfirmLoading(false);
    }
  };
  
  const handleDelete = async (roomTypeId) => {
    try {
      setLoading(true);
      
      // ตรวจสอบว่ามีห้องพักที่ใช้ประเภทห้องนี้หรือไม่
      const { data: roomsUsingThisType, error: roomsCheckError } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_type_id', roomTypeId);
        
      if (roomsCheckError) throw roomsCheckError;
      
      if (roomsUsingThisType && roomsUsingThisType.length > 0) {
        message.error(`ไม่สามารถลบประเภทห้องพักนี้ได้ เนื่องจากมีห้องพัก ${roomsUsingThisType.length} ห้อง ที่ใช้ประเภทห้องนี้อยู่`);
        return;
      }
      
      // ลบข้อมูลจากฐานข้อมูล
      const { error } = await supabase
        .from('room_types')
        .delete()
        .eq('id', roomTypeId);
        
      if (error) throw error;
      
      // ลบข้อมูลจากสถานะ
      setRoomTypes(roomTypes.filter(roomType => roomType.id !== roomTypeId));
      
      message.success('ลบประเภทห้องพักสำเร็จ');
    } catch (error) {
      console.error('Error deleting room type:', error);
      message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // จัดการ Amenities Tags
  const handleCloseAmenity = (removedTag) => {
    const newAmenities = amenities.filter(tag => tag !== removedTag);
    setAmenities(newAmenities);
  };

  const showAmenityInput = () => {
    setAmenityInputVisible(true);
  };

  const handleAmenityInputChange = (e) => {
    setAmenityInputValue(e.target.value);
  };

  const handleAmenityInputConfirm = () => {
    if (amenityInputValue && !amenities.includes(amenityInputValue)) {
      setAmenities([...amenities, amenityInputValue]);
    }
    setAmenityInputVisible(false);
    setAmenityInputValue('');
  };

  // กำหนดคอลัมน์ของตาราง
  const columns = [
    {
      title: 'ชื่อประเภทห้อง',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'ราคาพื้นฐาน',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price) => `${price.toLocaleString()} บาท/คืน`,
      sorter: (a, b) => a.base_price - b.base_price,
    },
    {
      title: 'ความจุ',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => `${capacity || 1} คน`,
      sorter: (a, b) => (a.capacity || 1) - (b.capacity || 1),
    },
    {
      title: 'สิ่งอำนวยความสะดวก',
      dataIndex: 'amenities',
      key: 'amenities',
      render: (amenities) => (
        <>
          {amenities && amenities.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {amenities.slice(0, 3).map((amenity) => (
                <Tag key={amenity}>{amenity}</Tag>
              ))}
              {amenities.length > 3 && (
                <Tooltip title={amenities.slice(3).join(', ')}>
                  <Tag>+{amenities.length - 3}</Tag>
                </Tooltip>
              )}
            </div>
          ) : (
            '-'
          )}
        </>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณต้องการลบประเภทห้องพักนี้ใช่หรือไม่?"
            description="การดำเนินการนี้ไม่สามารถเรียกคืนได้"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button danger icon={<DeleteOutlined />}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>จัดการประเภทห้องพัก</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            เพิ่มประเภทห้อง
          </Button>
        </Col>
      </Row>
      
      <Card>
        <Table
          columns={columns}
          dataSource={roomTypes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* Modal สำหรับเพิ่ม/แก้ไข ประเภทห้องพัก */}
      <Modal
        title={currentRoomType ? 'แก้ไขประเภทห้องพัก' : 'เพิ่มประเภทห้องพักใหม่'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText={currentRoomType ? 'บันทึกการแก้ไข' : 'เพิ่มประเภทห้อง'}
        cancelText="ยกเลิก"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            capacity: 1,
          }}
        >
          <Form.Item
            name="name"
            label="ชื่อประเภทห้อง"
            rules={[
              { required: true, message: 'กรุณาระบุชื่อประเภทห้อง' }
            ]}
          >
            <Input placeholder="ระบุชื่อประเภทห้อง" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="รายละเอียด"
          >
            <Input.TextArea rows={3} placeholder="ระบุรายละเอียดของประเภทห้อง" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="base_price"
                label="ราคาพื้นฐาน (บาท/คืน)"
                rules={[
                  { required: true, message: 'กรุณาระบุราคาพื้นฐาน' },
                  { type: 'number', min: 0, message: 'ราคาต้องไม่ต่ำกว่า 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="ระบุราคาพื้นฐาน"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="ความจุ (จำนวนคน)"
                rules={[
                  { required: true, message: 'กรุณาระบุความจุ' },
                  { type: 'number', min: 1, max: 10, message: 'ความจุต้องอยู่ระหว่าง 1-10' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="ระบุจำนวนคน"
                  min={1}
                  max={10}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="สิ่งอำนวยความสะดวก">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {amenities.map((amenity, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleCloseAmenity(amenity)}
                >
                  {amenity}
                </Tag>
              ))}
              
              {amenityInputVisible ? (
                <Input
                  ref={amenityInputRef}
                  type="text"
                  size="small"
                  style={{ width: 100 }}
                  value={amenityInputValue}
                  onChange={handleAmenityInputChange}
                  onBlur={handleAmenityInputConfirm}
                  onPressEnter={handleAmenityInputConfirm}
                />
              ) : (
                <Tag onClick={showAmenityInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
                  <PlusOutlined /> เพิ่ม
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              คลิกที่ <Tag style={{ background: '#fff', borderStyle: 'dashed' }}><PlusOutlined /> เพิ่ม</Tag> เพื่อเพิ่มสิ่งอำนวยความสะดวก
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminRoomTypes;