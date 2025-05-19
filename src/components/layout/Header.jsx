import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Space,
  Typography,
  Dropdown,
  Row,
  Col,
} from "antd";
import {
  MenuOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  DownOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

const HeaderComponent = () => {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const menuItems = [
    {
      key: "/",
      label: "หน้าแรก",
    },
    {
      key: "/rooms",
      label: "ห้องพัก",
    },

    {
      key: "/contact",
      label: "ติดต่อเรา",
    },
  ];

  const userDropdownItems = {
    items: [
      {
        key: "login",
        label: "เข้าสู่ระบบ",
      },
      {
        key: "register",
        label: "สมัครสมาชิก",
      },
    ],
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      {/* Top Header with Contact Info */}
      <div
        style={{
          backgroundColor: "#222",
          color: "white",
          padding: "10px 0",
          fontSize: "14px",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
        >
          <Row justify="space-between" align="middle">
            <Col xs={24} md={16}>
              <Space size={20}>
                <span>
                  <PhoneOutlined style={{ marginRight: "8px" }} />
                  <Text style={{ color: "white" }}>+66 2 123 4567</Text>
                </span>
                <span>
                  <MailOutlined style={{ marginRight: "8px" }} />
                  <Text style={{ color: "white" }}>info@luxuryhotel.com</Text>
                </span>
                <span>
                  <EnvironmentOutlined style={{ marginRight: "8px" }} />
                  <Text style={{ color: "white" }}>สวนหลวง, กรุงเทพฯ</Text>
                </span>
              </Space>
            </Col>
            <Col xs={0} md={8} style={{ textAlign: "right" }}>
              <Space>
                <ClockCircleOutlined style={{ marginRight: "8px" }} />
                <Text style={{ color: "white" }}>
                  เช็คอิน: 14:00 | เช็คเอาท์: 12:00
                </Text>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Header with Navigation */}
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          height: "auto",
          padding: "15px 20px",
          backgroundColor: scrolled ? "white" : "transparent",
          boxShadow: scrolled ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div
            className="logo"
            style={{ display: "flex", alignItems: "center" }}
          >
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: scrolled ? "#AA8453" : "white",
                }}
              >
                LUXURY HOTEL
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <div
            className="desktop-menu"
            style={{ display: { xs: "none", md: "block" } }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: scrolled ? "#333" : "white",
              }}
              items={menuItems}
            />
          </div>

          {/* User Actions */}
          <div
            className="user-actions"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              className="desktop-actions"
              style={{ display: { xs: "none", md: "flex" } }}
            >
              <Space>
                <Dropdown menu={userDropdownItems} trigger={["click"]}>
                  <Button
                    style={{
                      color: scrolled ? "#333" : "white",
                      borderColor: scrolled ? "#333" : "white",
                      backgroundColor: "transparent",
                    }}
                  >
                    <UserOutlined /> บัญชีผู้ใช้ <DownOutlined />
                  </Button>
                </Dropdown>
                <Link to="/booking">
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "#AA8453",
                      borderColor: "#AA8453",
                    }}
                  >
                    จองห้องพัก
                  </Button>
                </Link>
              </Space>
            </div>

            {/* Mobile Menu Trigger */}
            <div
              className="mobile-menu-trigger"
              style={{ display: { md: "none" } }}
            >
              <Button
                type="text"
                icon={
                  <MenuOutlined
                    style={{
                      color: scrolled ? "#333" : "white",
                      fontSize: "18px",
                    }}
                  />
                }
                onClick={showDrawer}
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      </Header>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#AA8453" }}
          >
            LUXURY HOTEL
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          style={{ border: "none" }}
          items={menuItems}
          onClick={onClose}
        />
        <div style={{ padding: "20px 0" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              icon={<UserOutlined />}
              style={{ width: "100%", textAlign: "left" }}
            >
              เข้าสู่ระบบ
            </Button>
            <Button
              icon={<UserOutlined />}
              style={{ width: "100%", textAlign: "left" }}
            >
              สมัครสมาชิก
            </Button>
            <Button
              type="primary"
              style={{
                width: "100%",
                marginTop: "20px",
                backgroundColor: "#AA8453",
                borderColor: "#AA8453",
              }}
            >
              จองห้องพัก
            </Button>
          </Space>
        </div>
        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #f0f0f0",
            paddingTop: "20px",
          }}
        >
          <Space direction="vertical" size="middle">
            <div>
              <PhoneOutlined style={{ marginRight: "8px" }} />
              +66 2 123 4567
            </div>
            <div>
              <MailOutlined style={{ marginRight: "8px" }} />
              info@luxuryhotel.com
            </div>
            <div>
              <EnvironmentOutlined style={{ marginRight: "8px" }} />
              สวนหลวง, กรุงเทพฯ
            </div>
            <div>
              <ClockCircleOutlined style={{ marginRight: "8px" }} />
              เช็คอิน: 14:00 | เช็คเอาท์: 12:00
            </div>
          </Space>
        </div>
      </Drawer>

      {/* CSS Styles */}
      <style jsx="true">{`
        @media (max-width: 768px) {
          .desktop-menu,
          .desktop-actions {
            display: none !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-trigger {
            display: none !important;
          }
        }

        .ant-menu-horizontal > .ant-menu-item::after,
        .ant-menu-horizontal > .ant-menu-submenu::after {
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected a {
          color: #aa8453 !important;
        }

        .ant-menu-horizontal > .ant-menu-item:hover,
        .ant-menu-horizontal > .ant-menu-submenu:hover,
        .ant-menu-horizontal > .ant-menu-item-active,
        .ant-menu-horizontal > .ant-menu-submenu-active,
        .ant-menu-horizontal > .ant-menu-item-open,
        .ant-menu-horizontal > .ant-menu-submenu-open,
        .ant-menu-horizontal > .ant-menu-item-selected,
        .ant-menu-horizontal > .ant-menu-submenu-selected {
          color: #aa8453 !important;
          border-bottom: 2px solid #aa8453 !important;
        }
      `}</style>
    </>
  );
};

export default HeaderComponent;
