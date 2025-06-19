import {
  Layout,
  Typography,
  Row,
  Col,
  Space,
  Button,
  Divider,
  BackTop,
} from "antd";
import { Link } from "react-router-dom";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer style={{ padding: 0, backgroundColor: "#222", color: "#fff" }}>
      {/* Main Footer Content */}
      <div style={{ padding: "60px 0" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
        >
          <Row gutter={[40, 40]}>
            {/* Hotel Info */}
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: "20px" }}>
                <Title
                  level={3}
                  style={{ color: "#fff", marginBottom: "16px" }}
                >
                  KR .place
                </Title>
              </div>
              <Space
                direction="vertical"
                size="middle"
                style={{ marginBottom: "20px" }}
              >
                <div>
                  <PhoneOutlined
                    style={{ marginRight: "8px", color: "#AA8453" }}
                  />
                  <Text style={{ color: "#aaa" }}>+66 819797986</Text>
                </div>
              </Space>
            </Col>

            {/* Quick Links */}
          </Row>
        </div>
      </div>

      {/* Bottom Footer with Copyright */}
      <Divider style={{ background: "#333", margin: 0 }} />
      <div style={{ backgroundColor: "#1a1a1a", padding: "20px 0" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
        >
          <Row justify="space-between" align="middle">
            <Col
              xs={24}
              md={12}
              style={{ textAlign: { xs: "center", md: "left" } }}
            >
              <Text style={{ color: "#aaa" }}>
                &copy; {currentYear} KR .place. สงวนลิขสิทธิ์.
              </Text>
            </Col>
            <Col
              xs={24}
              md={12}
              style={{
                textAlign: { xs: "center", md: "right" },
                marginTop: { xs: "10px", md: 0 },
              }}
            ></Col>
          </Row>
        </div>
      </div>

      {/* Back to Top Button */}
      <BackTop>
        <div
          style={{
            height: 40,
            width: 40,
            lineHeight: "40px",
            borderRadius: 4,
            backgroundColor: "#AA8453",
            color: "#fff",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          <ArrowUpOutlined />
        </div>
      </BackTop>

      {/* CSS Styles */}
      <style jsx="true">{`
        .ant-typography a:hover,
        ul li a:hover {
          color: #aa8453 !important;
        }
      `}</style>
    </Footer>
  );
};

export default FooterComponent;
