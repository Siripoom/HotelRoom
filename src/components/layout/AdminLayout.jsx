import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  theme,
  Typography,
  Dropdown,
  Space,
  Avatar,
} from "antd";
import {
  DashboardOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
  BarChartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "แดชบอร์ด",
    },
    {
      key: "/admin/rooms",
      icon: <HomeOutlined />,
      label: "จัดการห้องพัก",
    },
    {
      key: "/admin/room-types",
      icon: <UnorderedListOutlined />,
      label: "จัดการประเภทห้อง",
    },
    {
      key: "/admin/bookings",
      icon: <CalendarOutlined />,
      label: "จัดการการจอง",
    },
    // {
    //   key: "/admin/payments",
    //   icon: <DollarOutlined />,
    //   label: "จัดการการชำระเงิน",
    // },
  ];

  const getPageTitle = () => {
    const item = menuItems.find((item) => item.key === location.pathname);
    return item ? item.label : "แดชบอร์ด";
  };

  const userDropdownItems = {
    items: [
      {
        key: "1",
        label: "โปรไฟล์",
        icon: <UserOutlined />,
      },
      {
        key: "2",
        label: "ออกจากระบบ",
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === "2") {
      // ออกจากระบบ - ในที่นี้จะเป็นเพียงการแสดง alert
      alert("ออกจากระบบแล้ว");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            height: 64,
            padding: collapsed ? 0 : "0 16px",
            backgroundColor: token.colorPrimary,
            color: "white",
          }}
        >
          {!collapsed && (
            <Title level={4} style={{ color: "white", margin: 0 }}>
              ระบบจัดการโรงแรม
            </Title>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "10px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Button type="primary" danger icon={<LogoutOutlined />} block>
            {!collapsed && "ออกจากระบบ"}
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {getPageTitle()}
            </Title>
          </div>
          <div style={{ marginRight: 16 }}>
            <Dropdown
              menu={userDropdownItems}
              trigger={["click"]}
              onClick={handleUserMenuClick}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span style={{ marginLeft: 8 }}>ผู้ดูแลระบบ</span>
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "16px",
            padding: "16px",
            background: "#f5f5f5",
            minHeight: 280,
            borderRadius: 4,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
