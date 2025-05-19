import { Layout, Typography, Row, Col, Space, Button, Divider, BackTop } from "antd";
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
  ArrowUpOutlined
} from "@ant-design/icons";

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer style={{ padding: 0, backgroundColor: "#222", color: "#fff" }}>
      {/* Main Footer Content */}
      <div style={{ padding: "60px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <Row gutter={[40, 40]}>
            {/* Hotel Info */}
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: "20px" }}>
                <Title level={3} style={{ color: "#fff", marginBottom: "16px" }}>LUXURY HOTEL</Title>
                <Paragraph style={{ color: "#aaa", marginBottom: "20px" }}>
                  โรงแรมหรูใจกลางกรุงเทพมหานคร ให้บริการด้วยมาตรฐานระดับสากล พร้อมสิ่งอำนวยความสะดวกครบครัน
                </Paragraph>
              </div>
              <Space direction="vertical" size="middle" style={{ marginBottom: "20px" }}>
                <div>
                  <EnvironmentOutlined style={{ marginRight: "8px", color: "#AA8453" }} />
                  <Text style={{ color: "#aaa" }}>123 ถนนสุขุมวิท, สวนหลวง, กรุงเทพฯ 10250</Text>
                </div>
                <div>
                  <PhoneOutlined style={{ marginRight: "8px", color: "#AA8453" }} />
                  <Text style={{ color: "#aaa" }}>+66 2 123 4567</Text>
                </div>
                <div>
                  <MailOutlined style={{ marginRight: "8px", color: "#AA8453" }} />
                  <Text style={{ color: "#aaa" }}>info@luxuryhotel.com</Text>
                </div>
                <div>
                  <ClockCircleOutlined style={{ marginRight: "8px", color: "#AA8453" }} />
                  <Text style={{ color: "#aaa" }}>เช็คอิน: 14:00 | เช็คเอาท์: 12:00</Text>
                </div>
              </Space>
              <Space size="middle">
                <Button
                  shape="circle"
                  icon={<FacebookOutlined />}
                  style={{ backgroundColor: "#AA8453", borderColor: "#AA8453", color: "#fff" }}
                />
                <Button
                  shape="circle"
                  icon={<InstagramOutlined />}
                  style={{ backgroundColor: "#AA8453", borderColor: "#AA8453", color: "#fff" }}
                />
                <Button
                  shape="circle"
                  icon={<TwitterOutlined />}
                  style={{ backgroundColor: "#AA8453", borderColor: "#AA8453", color: "#fff" }}
                />
                <Button
                  shape="circle"
                  icon={<YoutubeOutlined />}
                  style={{ backgroundColor: "#AA8453", borderColor: "#AA8453", color: "#fff" }}
                />
              </Space>
            </Col>

            {/* Quick Links */}
            <Col xs={24} sm={12} md={5}>
              <Title level={4} style={{ color: "#fff", marginBottom: "20px" }}>ลิงก์ด่วน</Title>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    หน้าแรก
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/rooms" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    ห้องพัก
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/promotions" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    โปรโมชั่น
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/about" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    เกี่ยวกับเรา
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/contact" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    ติดต่อเรา
                  </Link>
                </li>
              </ul>
            </Col>

            {/* Services */}
            <Col xs={24} sm={12} md={5}>
              <Title level={4} style={{ color: "#fff", marginBottom: "20px" }}>บริการ</Title>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/services/restaurant" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    ห้องอาหาร
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/services/spa" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    สปา & เวลเนส
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/services/fitness" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    ฟิตเนส
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/services/swimming-pool" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    สระว่ายน้ำ
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/services/events" style={{ color: "#aaa", transition: "color 0.3s ease" }}>
                    ห้องจัดเลี้ยง
                  </Link>
                </li>
              </ul>
            </Col>

            {/* Newsletter */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: "#fff", marginBottom: "20px" }}>ติดตามข่าวสาร</Title>
              <Paragraph style={{ color: "#aaa", marginBottom: "20px" }}>
                ลงทะเบียนเพื่อรับข้อเสนอพิเศษและโปรโมชั่นล่าสุดจากเรา
              </Paragraph>
              <div style={{ display: "flex", marginBottom: "20px" }}>
                <input
                  type="email"
                  placeholder="อีเมลของคุณ"
                  style={{
                    flex: 1,
                    height: "40px",
                    padding: "0 10px",
                    borderRadius: "4px 0 0 4px",
                    border: "none",
                    backgroundColor: "#333",
                    color: "#fff"
                  }}
                />
                <Button
                  type="primary"
                  style={{
                    height: "40px",
                    borderRadius: "0 4px 4px 0",
                    backgroundColor: "#AA8453",
                    borderColor: "#AA8453"
                  }}
                >
                  ติดตาม
                </Button>
              </div>
              <Text style={{ color: "#aaa", fontSize: "12px" }}>
                เราจะไม่เปิดเผยข้อมูลของคุณแก่บุคคลอื่น โปรดอ่าน
                <Link to="/privacy" style={{ color: "#AA8453", marginLeft: "5px" }}>
                  นโยบายความเป็นส่วนตัว
                </Link>
              </Text>
            </Col>
          </Row>
        </div>
      </div>

      {/* Bottom Footer with Copyright */}
      <Divider style={{ background: "#333", margin: 0 }} />
      <div style={{ backgroundColor: "#1a1a1a", padding: "20px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <Row justify="space-between" align="middle">
            <Col xs={24} md={12} style={{ textAlign: { xs: "center", md: "left" } }}>
              <Text style={{ color: "#aaa" }}>
                &copy; {currentYear} Luxury Hotel. สงวนลิขสิทธิ์.
              </Text>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: { xs: "center", md: "right" }, marginTop: { xs: "10px", md: 0 } }}>
              <Space split={<Divider type="vertical" style={{ background: "#444" }} />}>
                <Link to="/terms" style={{ color: "#aaa", fontSize: "14px" }}>
                  ข้อกำหนดการใช้งาน
                </Link>
                <Link to="/privacy" style={{ color: "#aaa", fontSize: "14px" }}>
                  นโยบายความเป็นส่วนตัว
                </Link>
                <Link to="/faq" style={{ color: "#aaa", fontSize: "14px" }}>
                  คำถามที่พบบ่อย
                </Link>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Back to Top Button */}
      <BackTop>
        <div style={{
          height: 40,
          width: 40,
          lineHeight: "40px",
          borderRadius: 4,
          backgroundColor: "#AA8453",
          color: "#fff",
          textAlign: "center",
          fontSize: 14,
        }}>
          <ArrowUpOutlined />
        </div>
      </BackTop>

      {/* CSS Styles */}
      <style jsx="true">{`
        .ant-typography a:hover,
        ul li a:hover {
          color: #AA8453 !important;
        }
      `}</style>
    </Footer>
  );
};

export default FooterComponent;