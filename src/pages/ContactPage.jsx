// src/pages/ContactPage.jsx
import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Button,
  Form,
  Input,
  Select,
  message,
  Divider,
  Image,
  Tag,
  Breadcrumb,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  WhatsAppOutlined,
  LineOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function ContactPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // จำลองการส่งข้อความ
      console.log("Contact form data:", values);

      // ในโปรเจคจริงจะส่งข้อมูลไปยัง API หรือ email service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success("ส่งข้อความสำเร็จ! เราจะติดต่อกลับภายใน 24 ชั่วโมง");
      form.resetFields();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: <PhoneOutlined className="text-2xl text-blue-500" />,
      title: "โทรศัพท์",
      value: "081-979-7986",
      description: "พร้อมให้บริการตลอด 24 ชั่วโมง",
      action: "tel:0819797986",
      buttonText: "โทรเลย",
      buttonColor: "#52c41a",
    },
  ];

  return (
    <div className="contact-page">
      <div style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <Breadcrumb style={{ marginBottom: "24px" }}>
            <Breadcrumb.Item>
              <a href="/">หน้าแรก</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>ติดต่อเรา</Breadcrumb.Item>
          </Breadcrumb>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <Title level={1} style={{ marginBottom: "16px" }}>
              ติดต่อเรา
            </Title>
            <Paragraph
              style={{
                fontSize: "18px",
                color: "#666",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              พร้อมให้บริการและตอบข้อสงสัยของคุณตลอด 24 ชั่วโมง
              ติดต่อเราผ่านช่องทางที่สะดวกสำหรับคุณ
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {/* Left Column - Contact Information */}
            <Col xs={24} lg={12}>
              {/* Contact Methods */}
              <Card style={{ marginBottom: "24px" }}>
                <Title
                  level={3}
                  style={{ marginBottom: "24px", textAlign: "center" }}
                >
                  <MessageOutlined
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  ช่องทางติดต่อ
                </Title>

                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="large"
                >
                  {contactMethods.map((method, index) => (
                    <Card
                      key={index}
                      size="small"
                      style={{ backgroundColor: "#fafafa" }}
                    >
                      <Row align="middle" gutter={16}>
                        <Col flex="none">
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            {method.icon}
                          </div>
                        </Col>
                        <Col flex="auto">
                          <div>
                            <Text
                              strong
                              style={{ fontSize: "16px", display: "block" }}
                            >
                              {method.title}
                            </Text>
                            <Text
                              style={{
                                fontSize: "18px",
                                color: "#1890ff",
                                fontWeight: "600",
                                display: "block",
                              }}
                            >
                              {method.value}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                              {method.description}
                            </Text>
                          </div>
                        </Col>
                        <Col flex="none">
                          <Button
                            type="primary"
                            style={{
                              backgroundColor: method.buttonColor,
                              borderColor: method.buttonColor,
                            }}
                            onClick={() => window.open(method.action, "_blank")}
                          >
                            {method.buttonText}
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              </Card>

              {/* Hotel Information */}
              <Card style={{ marginBottom: "24px" }}>
                <Title level={4} style={{ marginBottom: "20px" }}>
                  <EnvironmentOutlined
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  ข้อมูลโรงแรม
                </Title>

                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  <div>
                    <Text strong>ชื่อโรงแรม:</Text>
                    <div style={{ marginTop: "4px" }}>
                      <Text style={{ fontSize: "16px" }}>KR .place Hotel</Text>
                    </div>
                  </div>

                  <div>
                    <Text strong>เวลาทำการ:</Text>
                    <div
                      style={{
                        marginTop: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <Tag icon={<ClockCircleOutlined />} color="blue">
                        เช็คอิน: 14:00 น.
                      </Tag>
                      <Tag icon={<ClockCircleOutlined />} color="orange">
                        เช็คเอาท์: 12:00 น.
                      </Tag>
                      <Tag icon={<PhoneOutlined />} color="green">
                        รับสายตลอด 24 ชั่วโมง
                      </Tag>
                    </div>
                  </div>
                </Space>
              </Card>

              {/* Social Media */}
            </Col>

            {/* Right Column - Contact Form and Map */}
            <Col xs={24} lg={12}>
              {/* Quick Info */}
              <Card>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  ข้อมูลสำคัญ
                </Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#e6f7ff",
                      borderRadius: "6px",
                    }}
                  >
                    <Text strong style={{ color: "#1890ff" }}>
                      📞 โทรด่วน: 081-979-7986
                    </Text>
                    <div style={{ marginTop: "4px" }}>
                      <Text type="secondary">
                        พร้อมให้บริการตลอด 24 ชั่วโมง
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#f6ffed",
                      borderRadius: "6px",
                    }}
                  >
                    <Text strong style={{ color: "#52c41a" }}>
                      ⏰ เวลาเช็คอิน/เช็คเอาท์
                    </Text>
                    <div style={{ marginTop: "4px" }}>
                      <Text type="secondary">
                        เช็คอิน: 14:00 น. | เช็คเอาท์: 12:00 น.
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#fff7e6",
                      borderRadius: "6px",
                    }}
                  >
                    <Text strong style={{ color: "#fa8c16" }}>
                      📍 ที่ตั้ง
                    </Text>
                    <div style={{ marginTop: "4px" }}>
                      <Text type="secondary">
                        ใจกลางเมือง เดินทางสะดวก ใกล้แหล่งท่องเที่ยว
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Call to Action */}
          <div
            style={{
              marginTop: "48px",
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#f0f2f5",
              borderRadius: "12px",
            }}
          >
            <Title level={3} style={{ marginBottom: "16px" }}>
              พร้อมให้บริการคุณแล้ว!
            </Title>
            <Paragraph style={{ fontSize: "16px", marginBottom: "24px" }}>
              ทีมงานของเราพร้อมตอบทุกคำถามและให้คำปรึกษาเกี่ยวกับการเข้าพัก
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<PhoneOutlined />}
                onClick={() => window.open("tel:0819797986")}
              >
                โทรเลย 081-979-7986
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
