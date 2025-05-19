// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    pendingBookings: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // สมมติว่ามีข้อมูลในระบบแล้ว (ในโปรเจคจริงต้องดึงข้อมูลจาก Supabase)
        setStats({
          totalRooms: 50,
          availableRooms: 35,
          pendingBookings: 12,
          pendingPayments: 8,
          totalRevenue: 75000
        });
        
        // ตัวอย่างการดึงข้อมูลจาก Supabase (uncomment เมื่อมีข้อมูลจริง)
        /*
        // ดึงจำนวนห้องทั้งหมด
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*', { count: 'exact' });
          
        if (roomsError) throw roomsError;
        
        // ดึงจำนวนห้องว่าง
        const { data: availableRoomsData, error: availableRoomsError } = await supabase
          .from('rooms')
          .select('*', { count: 'exact' })
          .eq('status', 'available');
          
        if (availableRoomsError) throw availableRoomsError;
        
        // ดึงจำนวนการจองที่รอดำเนินการ
        const { data: pendingBookingsData, error: pendingBookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .eq('status', 'pending');
          
        if (pendingBookingsError) throw pendingBookingsError;
        
        // ดึงจำนวนการชำระเงินที่รอยืนยัน
        const { data: pendingPaymentsData, error: pendingPaymentsError } = await supabase
          .from('payments')
          .select('*', { count: 'exact' })
          .eq('status', 'pending');
          
        if (pendingPaymentsError) throw pendingPaymentsError;
        
        // ดึงรายได้ทั้งหมด (จากการชำระเงินที่ยืนยันแล้ว)
        const { data: revenueData, error: revenueError } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'confirmed');
          
        if (revenueError) throw revenueError;
        
        const totalRevenue = revenueData.reduce((sum, payment) => sum + payment.amount, 0);
        
        setStats({
          totalRooms: roomsData.length,
          availableRooms: availableRoomsData.length,
          pendingBookings: pendingBookingsData.length,
          pendingPayments: pendingPaymentsData.length,
          totalRevenue
        });
        */
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">ห้องพักทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRooms}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">ห้องว่าง: {stats.availableRooms}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(stats.availableRooms / stats.totalRooms) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">การจองที่รอดำเนินการ</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
              ดูรายการที่รอดำเนินการ →
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">การชำระเงินที่รอยืนยัน</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <button className="text-sm font-medium text-green-600 hover:text-green-700">
              ตรวจสอบการชำระเงิน →
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">รายได้ทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRevenue.toLocaleString()} บาท</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ดูรายงานรายได้ →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">การจองล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสการจอง
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ห้อง
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่เช็คอิน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่เช็คเอาท์
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((booking) => (
                <tr key={booking} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    BK-{2025000 + booking}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ลูกค้าตัวอย่าง {booking}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {100 + booking}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    15/05/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    17/05/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking % 3 === 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : booking % 3 === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking % 3 === 0 
                        ? 'รอการชำระเงิน' 
                        : booking % 3 === 1 
                          ? 'ยืนยันแล้ว' 
                          : 'เช็คอินแล้ว'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            ดูการจองทั้งหมด →
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;