import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Image,
  Typography,
  Row,
  Col,
  Tag,
  Popconfirm,
  Empty,
  Divider,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { supabase } from "../../lib/supabase";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);
  const handleAfterClose = () => {
    setCurrentRoom(null);
    form.resetFields();
    setMainImageFile(null);
    setMainImagePreview(null);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
  }; // src/pages/admin/Rooms.jsx
  const fetchRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("room_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setRoomTypes(data || []);
    } catch (error) {
      console.error("Error fetching room types:", error);
      message.error("ไม่สามารถโหลดข้อมูลประเภทห้องพักได้");
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price
          )
        `
        )
        .order("room_number", { ascending: true });

      if (error) throw error;

      // Add key property for Table component
      const dataWithKeys =
        data?.map((item) => ({
          ...item,
          key: item.id,
        })) || [];

      setRooms(dataWithKeys);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      message.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (room = null) => {
    console.log("Opening modal with room:", room);
    setCurrentRoom(room);

    if (room) {
      form.setFieldsValue({
        room_number: room.room_number,
        room_type_id: room.room_type_id,
        description: room.description || "",
        status: room.status,
      });

      // ตั้งค่ารูปภาพที่มีอยู่แล้ว
      setMainImagePreview(room.main_image || null);
      setAdditionalImagePreviews(room.images || []);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "available" });

      // ล้างข้อมูลรูปภาพ
      setMainImagePreview(null);
      setAdditionalImagePreviews([]);
    }

    // รีเซ็ตไฟล์ที่อัปโหลด
    setMainImageFile(null);
    setAdditionalImageFiles([]);

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    // ปิด Modal โดยไม่แสดง confirm dialog
    setIsModalVisible(false);
    setCurrentRoom(null);
    form.resetFields();

    // ล้างข้อมูลรูปภาพ
    setMainImageFile(null);
    setMainImagePreview(null);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
  };

  // จัดการอัปโหลดรูปภาพหลัก
  const handleMainImageChange = (info) => {
    console.log("Main image change event:", info);

    // กรณีที่มีการอัปโหลดไฟล์
    if (info.file && info.file.originFileObj) {
      const file = info.file.originFileObj;
      console.log("Main image selected:", file.name, file.type, file.size);

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

      // เก็บไฟล์ในสถานะและสร้าง preview
      setMainImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
      console.log("Preview URL created:", previewUrl);
    }
  };

  const handleAdditionalImagesUpload = (info) => {
    const { fileList } = info;

    // Filter file objects
    const newFiles = fileList
      .filter((file) => file.originFileObj)
      .map((file) => file.originFileObj);

    setAdditionalImageFiles(newFiles);

    // Create preview URLs
    const newPreviews = fileList
      .filter((file) => file.originFileObj)
      .map((file) => {
        if (file.url) return file.url;
        return URL.createObjectURL(file.originFileObj);
      });

    setAdditionalImagePreviews((prevPreviews) => {
      // Combine existing image URLs from the database with new uploads
      if (currentRoom && currentRoom.images) {
        return [...currentRoom.images, ...newPreviews];
      }
      return newPreviews;
    });
  };

  const removeAdditionalImage = (index) => {
    // If removing an existing image from database
    if (
      currentRoom &&
      currentRoom.images &&
      index < currentRoom.images.length
    ) {
      const updatedImages = [...currentRoom.images];
      updatedImages.splice(index, 1);
      setAdditionalImagePreviews(updatedImages);
    } else {
      // If removing a newly uploaded image
      const newIndex = index - (currentRoom?.images?.length || 0);
      const updatedFiles = [...additionalImageFiles];
      updatedFiles.splice(newIndex, 1);
      setAdditionalImageFiles(updatedFiles);

      const updatedPreviews = [...additionalImagePreviews];
      updatedPreviews.splice(index, 1);
      setAdditionalImagePreviews(updatedPreviews);
    }
  };

  const uploadImage = async (file) => {
    try {
      if (!file) return null;

      // เพิ่ม console.log เพื่อตรวจสอบข้อมูลไฟล์
      console.log("Uploading file:", file.name, file.type, file.size);

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith("image/")) {
        throw new Error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
      }

      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;

      console.log("Generated filename:", fileName);

      // อัปโหลดไฟล์ไปที่ Supabase Storage
      const { data, error } = await supabase.storage
        .from("rooms")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }

      console.log("Upload successful, data:", data);

      // สร้าง URL สำหรับเข้าถึงรูปภาพ
      const { data: urlData } = supabase.storage
        .from("rooms")
        .getPublicUrl(fileName);

      console.log("Public URL:", urlData?.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("ไม่สามารถอัปโหลดรูปภาพได้: " + error.message);
      // ในกรณีที่มีข้อผิดพลาด ให้คืนค่า null แทนที่จะ throw error
      // เพื่อให้โค้ดสามารถทำงานต่อไปได้
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      let mainImageUrl = currentRoom?.main_image || null;
      let additionalImageUrls = [...(currentRoom?.images || [])];

      // ถ้ามีการเปลี่ยนรูปภาพหลัก
      if (mainImageFile) {
        // ลบรูปภาพเก่า (ถ้ามี)
        if (currentRoom?.main_image) {
          await deleteImage(currentRoom.main_image);
        }
        // อัปโหลดรูปภาพใหม่
        mainImageUrl = await uploadImage(mainImageFile);
      }

      // กรณีลบรูปภาพหลัก
      if (!mainImagePreview && currentRoom?.main_image) {
        await deleteImage(currentRoom.main_image);
        mainImageUrl = null;
      }

      // จัดการรูปภาพเพิ่มเติม
      // 1. ลบรูปภาพเก่าที่ไม่มีในรายการปัจจุบัน
      if (currentRoom?.images) {
        const currentImages = additionalImagePreviews.slice(
          0,
          currentRoom.images.length
        );
        const removedImages = currentRoom.images.filter(
          (url) => !currentImages.includes(url)
        );

        for (const imgUrl of removedImages) {
          await deleteImage(imgUrl);
        }

        // อัปเดตรายการรูปภาพที่เหลือ
        additionalImageUrls = currentImages;
      }

      // 2. อัปโหลดรูปภาพใหม่ที่เพิ่มเข้ามา
      if (additionalImageFiles.length > 0) {
        const newImageUrls = await Promise.all(
          additionalImageFiles.map((file) => uploadImage(file))
        );
        additionalImageUrls = [...additionalImageUrls, ...newImageUrls];
      }

      // ข้อมูลที่จะบันทึกลงฐานข้อมูล
      const roomData = {
        room_number: values.room_number,
        room_type_id: values.room_type_id,
        description: values.description,
        status: values.status,
        main_image: mainImageUrl,
        images: additionalImageUrls,
      };

      if (currentRoom) {
        // อัปเดตข้อมูลห้องพัก
        const { data, error } = await supabase
          .from("rooms")
          .update(roomData)
          .eq("id", currentRoom.id)
          .select();

        if (error) throw error;

        // อัปเดตข้อมูลในสถานะ
        setRooms(
          rooms.map((room) =>
            room.id === currentRoom.id
              ? {
                  ...data[0],
                  key: data[0].id,
                  room_type: roomTypes.find(
                    (rt) => rt.id === data[0].room_type_id
                  ),
                }
              : room
          )
        );

        message.success("อัปเดตข้อมูลห้องพักสำเร็จ");
      } else {
        // เพิ่มข้อมูลห้องพักใหม่
        const { data, error } = await supabase
          .from("rooms")
          .insert(roomData)
          .select();

        if (error) throw error;

        // เพิ่มข้อมูลในสถานะ
        setRooms([
          ...rooms,
          {
            ...data[0],
            key: data[0].id,
            room_type: roomTypes.find((rt) => rt.id === data[0].room_type_id),
          },
        ]);

        message.success("เพิ่มห้องพักใหม่สำเร็จ");
      }

      handleCancel();
    } catch (error) {
      console.error("Error saving room:", error);
      message.error(
        "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " +
          (error.message || "โปรดลองอีกครั้ง")
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const deleteImage = async (url) => {
    if (!url) return;

    try {
      // แยกชื่อไฟล์จาก URL
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      if (!fileName) return;

      // ลบไฟล์จาก Supabase Storage
      const { error } = await supabase.storage.from("rooms").remove([fileName]);

      if (error) {
        console.error("Storage delete error:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      message.error("ไม่สามารถลบรูปภาพได้: " + error.message);
    }
  };

  const handleDelete = async (roomId) => {
    try {
      setLoading(true);

      // ดึงข้อมูลห้องพักที่จะลบ
      const roomToDelete = rooms.find((room) => room.id === roomId);

      // ลบรูปภาพจาก Storage (ถ้ามี)
      if (roomToDelete.main_image) {
        await deleteImage(roomToDelete.main_image);
      }

      if (roomToDelete.images && roomToDelete.images.length > 0) {
        for (const imgUrl of roomToDelete.images) {
          await deleteImage(imgUrl);
        }
      }

      // ลบข้อมูลจากฐานข้อมูล
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);

      if (error) throw error;

      // ลบข้อมูลจากสถานะ
      setRooms(rooms.filter((room) => room.id !== roomId));

      message.success("ลบห้องพักสำเร็จ");
    } catch (error) {
      console.error("Error deleting room:", error);
      message.error(
        "เกิดข้อผิดพลาดในการลบข้อมูล: " + (error.message || "โปรดลองอีกครั้ง")
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    let color, text;
    switch (status) {
      case "available":
        color = "success";
        text = "ว่าง";
        break;
      case "occupied":
        color = "processing";
        text = "ไม่ว่าง";
        break;
      case "maintenance":
        color = "warning";
        text = "กำลังปรับปรุง";
        break;
      default:
        color = "default";
        text = status;
    }
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: "รูปภาพ",
      dataIndex: "main_image",
      key: "main_image",
      width: 120,
      render: (image) =>
        image ? (
          <Image
            src={image}
            alt="Room"
            width={100}
            height={70}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 100,
              height: 70,
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
          >
            <PictureOutlined style={{ fontSize: 24, color: "#d9d9d9" }} />
          </div>
        ),
    },
    {
      title: "หมายเลขห้อง",
      dataIndex: "room_number",
      key: "room_number",
      sorter: (a, b) => a.room_number.localeCompare(b.room_number),
    },
    {
      title: "ประเภทห้อง",
      key: "room_type",
      render: (_, record) => record.room_type?.name || "-",
      sorter: (a, b) =>
        (a.room_type?.name || "").localeCompare(b.room_type?.name || ""),
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "ว่าง", value: "available" },
        { text: "ไม่ว่าง", value: "occupied" },
        { text: "กำลังปรับปรุง", value: "maintenance" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "จัดการ",
      key: "action",
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
            title="คุณต้องการลบห้องพักนี้ใช่หรือไม่?"
            description="การดำเนินการนี้ไม่สามารถเรียกคืนได้"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button danger icon={<DeleteOutlined />}>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const mainImageUploadProps = {
    name: "main_image",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    onChange: handleMainImageChange,
    // ป้องกันการอัปโหลดอัตโนมัติ
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
  };

  const additionalImagesUploadProps = {
    name: "images",
    multiple: true,
    maxCount: 10,
    beforeUpload: (file) => {
      // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!");
        return Upload.LIST_IGNORE;
      }

      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("รูปภาพต้องมีขนาดไม่เกิน 5MB!");
        return Upload.LIST_IGNORE;
      }

      // เพิ่มไฟล์ไปยังรายการ
      setAdditionalImageFiles((prev) => [...prev, file]);

      // สร้าง preview URL
      const previewUrl = URL.createObjectURL(file);
      setAdditionalImagePreviews((prev) => [...prev, previewUrl]);

      // ป้องกันไม่ให้ Upload component ส่งไฟล์ไปยัง server โดยอัตโนมัติ
      return false;
    },
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            จัดการห้องพัก
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
          >
            เพิ่มห้องพัก
          </Button>
        </Col>
      </Row>

      {rooms.length === 0 && !loading ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ยังไม่มีข้อมูลห้องพัก"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              เพิ่มห้องพักใหม่
            </Button>
          </Empty>
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={rooms}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      {/* Modal for adding/editing rooms */}
      <Modal
        title={currentRoom ? "แก้ไขข้อมูลห้องพัก" : "เพิ่มห้องพักใหม่"}
        open={isModalVisible}
        onCancel={handleCancel}
        afterClose={handleAfterClose}
        footer={[
          <Button key="back" onClick={handleCancel}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={confirmLoading}
            onClick={handleSubmit}
            disabled={confirmLoading}
          >
            {currentRoom ? "บันทึกการแก้ไข" : "เพิ่มห้องพัก"}
          </Button>,
        ]}
        maskClosable={false}
        destroyOnClose={true}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "available",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="room_number"
                label="หมายเลขห้อง"
                rules={[{ required: true, message: "กรุณาระบุหมายเลขห้อง" }]}
              >
                <Input placeholder="ระบุหมายเลขห้อง" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="room_type_id"
                label="ประเภทห้อง"
                rules={[{ required: true, message: "กรุณาเลือกประเภทห้อง" }]}
              >
                <Select placeholder="เลือกประเภทห้อง">
                  {roomTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name} - {type.base_price?.toLocaleString()} บาท/คืน
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="รายละเอียด">
            <TextArea rows={3} placeholder="ระบุรายละเอียดของห้องพัก" />
          </Form.Item>

          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: "กรุณาเลือกสถานะห้องพัก" }]}
          >
            <Select placeholder="เลือกสถานะห้องพัก">
              <Option value="available">ว่าง</Option>
              <Option value="occupied">ไม่ว่าง</Option>
              <Option value="maintenance">กำลังปรับปรุง</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">รูปภาพ</Divider>

          <Form.Item label="รูปภาพหลัก">
            <div style={{ marginBottom: 16 }}>
              {mainImagePreview ? (
                <div
                  style={{
                    position: "relative",
                    marginBottom: 16,
                    width: "fit-content",
                  }}
                >
                  <Image
                    src={mainImagePreview}
                    alt="Main Room Image"
                    width={200}
                    height={150}
                    style={{ objectFit: "cover" }}
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ position: "absolute", top: 5, right: 5 }}
                    onClick={() => {
                      setMainImagePreview(null);
                      setMainImageFile(null);
                    }}
                  />
                </div>
              ) : (
                <Upload {...mainImageUploadProps}>
                  <Button icon={<UploadOutlined />}>อัปโหลดรูปภาพหลัก</Button>
                  <div style={{ marginTop: 8, color: "#888" }}>
                    รองรับไฟล์ภาพประเภท .jpg, .jpeg, .png, .webp (ขนาดไม่เกิน
                    5MB)
                  </div>
                </Upload>
              )}
            </div>
          </Form.Item>

          <Form.Item label="รูปภาพเพิ่มเติม">
            <div style={{ marginBottom: 16 }}>
              <Dragger {...additionalImagesUploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลดรูปภาพเพิ่มเติม
                </p>
                <p className="ant-upload-hint">
                  รองรับไฟล์ภาพประเภท .jpg, .jpeg, .png, .webp
                </p>
              </Dragger>
            </div>

            {additionalImagePreviews.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {additionalImagePreviews.map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <Image
                      src={url}
                      alt={`Room Image ${index + 1}`}
                      width={100}
                      height={75}
                      style={{ objectFit: "cover" }}
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{ position: "absolute", top: 0, right: 0 }}
                      onClick={() => removeAdditionalImage(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminRooms;
