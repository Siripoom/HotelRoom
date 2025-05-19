// src/components/layout/AdminLayout.jsx
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  HomeIcon,
  HomeModernIcon, // เปลี่ยนจาก BedIcon เป็น HomeModernIcon
  CalendarIcon,
  CreditCardIcon,
  TagIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ListBulletIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const sidebarNavigation = [
  { name: "แดชบอร์ด", href: "/admin", icon: HomeIcon },
  { name: "จัดการห้องพัก", href: "/admin/rooms", icon: HomeModernIcon }, // เปลี่ยนเป็น HomeModernIcon
   { name: 'จัดการประเภทห้อง', href: '/admin/room-types', icon: ListBulletIcon }, 
  { name: "จัดการการจอง", href: "/admin/bookings", icon: CalendarIcon },
  { name: "จัดการการชำระเงิน", href: "/admin/payments", icon: CreditCardIcon },
  { name: "โปรโมชั่น", href: "/admin/promotions", icon: TagIcon },
  { name: "รายงานและสถิติ", href: "/admin/reports", icon: ChartBarIcon },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 flex max-w-full pt-5 pb-4 bg-white w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center px-4 justify-between">
              <div className="text-xl font-bold text-gray-900">
                ระบบจัดการโรงแรม
              </div>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {sidebarNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      location.pathname === item.href
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    } mr-4 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto px-4 pb-4">
              <button className="flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50 w-full">
                <ArrowRightOnRectangleIcon className="mr-4 flex-shrink-0 h-6 w-6 text-red-500" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary">
            <div className="text-xl font-bold text-white">ระบบจัดการโรงแรม</div>
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {sidebarNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      location.pathname === item.href
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="px-4 pb-4 border-t border-gray-200">
            <button className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 w-full">
              <ArrowRightOnRectangleIcon className="mr-3 flex-shrink-0 h-6 w-6 text-red-500" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 lg:hidden focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {sidebarNavigation.find(
                  (item) => item.href === location.pathname
                )?.name || "แอดมิน"}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm font-medium text-gray-700">
                ผู้ดูแลระบบ
              </span>
            </div>
          </div>
        </div>

        <main className="flex-1 pb-8">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
