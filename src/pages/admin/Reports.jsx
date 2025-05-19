// src/pages/admin/Reports.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function AdminReports() {
  const [reportType, setReportType] = useState('bookings');
  const [timeRange, setTimeRange] = useState('month');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    occupancy_rate: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    // ตั้งค่า date range เริ่มต้น
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setDateRange({
      start_date: firstDayOfMonth.toISOString().split('T')[0],
      end_date: lastDayOfMonth.toISOString().split('T')[0]
    });

    // โหลดข้อมูลตัวอย่าง (mock data)
    loadMockData();
  }, []);

  const loadMockData = () => {
    // ข้อมูลการจองรายเดือน (mock)
    const mockMonthlyData = [
      { month: 'ม.ค.', bookings: 32, revenue: 64000, occupancy: 45 },
      { month: 'ก.พ.', bookings: 38, revenue: 76000, occupancy: 52 },
      { month: 'มี.ค.', bookings: 45, revenue: 90000, occupancy: 60 },
      { month: 'เม.ย.', bookings: 55, revenue: 110000, occupancy: 72 },
      { month: 'พ.ค.', bookings: 50, revenue: 100000, occupancy: 65 },
    ];
    
    setMonthlyData(mockMonthlyData);
    
    // ข้อมูลสถิติการจอง (mock)
    setBookingStats({
      total: 120,
      completed: 85,
      cancelled: 15,
      revenue: 240000,
      occupancy_rate: 62
    });
    
    // ในโครงการจริง: ดึงข้อมูลจาก Supabase
    /*
    // ตัวอย่าง: ดึงข้อมูลการจองตามช่วงเวลา
    async function fetchBookingStats() {
      try {
        // ดึงจำนวนการจองทั้งหมด
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, status, total_price')
          .gte('check_in_date', dateRange.start_date)
          .lte('check_out_date', dateRange.end_date);
          
        if (bookingsError) throw bookingsError;
        
        // คำนวณสถิติต่างๆ
        const total = bookingsData.length;
        const completed = bookingsData.filter(b => b.status === 'completed').length;
        const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;
        const revenue = bookingsData
          .filter(b => b.status !== 'cancelled')
          .reduce((sum, booking) => sum + booking.total_price, 0);
          
        // ดึงข้อมูลห้องพักทั้งหมด
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('id');
          
        if (roomsError) throw roomsError;
        
        // คำนวณอัตราการเข้าพัก
        const totalRooms = roomsData.length;
        const totalDays = Math.floor((new Date(dateRange.end_date) - new Date(dateRange.start_date)) / (1000 * 60 * 60 * 24)) + 1;
        const totalPossibleRoomNights = totalRooms * totalDays;
        
        const occupancyRate = (completed / totalPossibleRoomNights) * 100;
        
        setBookingStats({
          total,
          completed,
          cancelled,
          revenue,
          occupancy_rate: parseFloat(occupancyRate.toFixed(2)) || 0
        });
      } catch (error) {
        console.error('Error fetching booking stats:', error);
      }
    }
    
    // ตัวอย่าง: ดึงข้อมูลการจองรายเดือน
    async function fetchMonthlyData() {
      try {
        // ดึงข้อมูลการจองทั้งปี
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        const endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, check_in_date, total_price, status')
          .gte('check_in_date', startOfYear)
          .lte('check_in_date', endOfYear);
          
        if (bookingsError) throw bookingsError;
        
        // จัดกลุ่มข้อมูลตามเดือน
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const monthlyStats = months.map((month, index) => {
          const monthBookings = bookingsData.filter(booking => {
            const bookingDate = new Date(booking.check_in_date);
            return bookingDate.getMonth() === index;
          });
          
          const completedBookings = monthBookings.filter(b => b.status !== 'cancelled');
          const revenue = completedBookings.reduce((sum, booking) => sum + booking.total_price, 0);
          
          // คำนวณอัตราการเข้าพัก (ต้องดึงข้อมูลห้องทั้งหมดและคำนวณตามวันที่)
          // นี่เป็นตัวอย่างอย่างง่าย
          const occupancy = monthBookings.length > 0 ? 
            (completedBookings.length / monthBookings.length) * 100 : 0;
          
          return {
            month,
            bookings: monthBookings.length,
            revenue,
            occupancy: parseFloat(occupancy.toFixed(2))
          };
        });
        
        setMonthlyData(monthlyStats);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      }
    }
    
    fetchBookingStats();
    fetchMonthlyData();
    */
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  const handleTimeRangeChange = (e) => {
    const value = e.target.value;
    setTimeRange(value);
    
    const today = new Date();
    let start_date, end_date;
    
    switch (value) {
      case 'week':
        // หาวันอาทิตย์ที่ผ่านมา (เริ่มสัปดาห์)
        start_date = new Date(today);
        start_date.setDate(today.getDate() - today.getDay());
        end_date = new Date(today);
        break;
        
      case 'month':
        start_date = new Date(today.getFullYear(), today.getMonth(), 1);
        end_date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
        
      case 'quarter':
        { const quarter = Math.floor(today.getMonth() / 3);
        start_date = new Date(today.getFullYear(), quarter * 3, 1);
        end_date = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
        break; }
        
      case 'year':
        start_date = new Date(today.getFullYear(), 0, 1);
        end_date = new Date(today.getFullYear(), 11, 31);
        break;
        
      default:
        start_date = new Date();
        end_date = new Date();
    }
    
    setDateRange({
      start_date: start_date.toISOString().split('T')[0],
      end_date: end_date.toISOString().split('T')[0]
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">รายงานและสถิติ</h2>
        
       // src/pages/admin/Reports.jsx (ต่อ)
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-700">ประเภทรายงาน:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="bookings">การจอง</option>
              <option value="revenue">รายได้</option>
              <option value="occupancy">อัตราการเข้าพัก</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-700">ช่วงเวลา:</label>
            <select
              value={timeRange}
              onChange={handleTimeRangeChange}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="week">รายสัปดาห์</option>
              <option value="month">รายเดือน</option>
              <option value="quarter">รายไตรมาส</option>
              <option value="year">รายปี</option>
              <option value="custom">กำหนดเอง</option>
            </select>
          </div>
          
          {timeRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">จาก:</label>
                <input
                  type="date"
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateRangeChange}
                  className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">ถึง:</label>
                <input
                  type="date"
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateRangeChange}
                  className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* แสดงข้อมูลสรุป */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">การจองทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{bookingStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">การจองที่สำเร็จ</p>
              <p className="text-2xl font-semibold text-gray-900">{bookingStats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">การจองที่ยกเลิก</p>
              <p className="text-2xl font-semibold text-gray-900">{bookingStats.cancelled}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">รายได้รวม</p>
              <p className="text-2xl font-semibold text-gray-900">{bookingStats.revenue.toLocaleString()} บาท</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* แสดงกราฟและตาราง */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* กราฟแท่ง */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {reportType === 'bookings' ? 'จำนวนการจองรายเดือน' : 
             reportType === 'revenue' ? 'รายได้รายเดือน' : 'อัตราการเข้าพักรายเดือน'}
          </h3>
          <div className="h-64 flex items-end space-x-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-primary rounded-t" 
                  style={{ 
                    height: `${reportType === 'bookings' 
                      ? (data.bookings / Math.max(...monthlyData.map(d => d.bookings)) * 100) 
                      : reportType === 'revenue' 
                        ? (data.revenue / Math.max(...monthlyData.map(d => d.revenue)) * 100) 
                        : data.occupancy
                    }%`,
                    minHeight: '10px'
                  }}
                ></div>
                <div className="text-xs font-medium text-gray-500 mt-2">{data.month}</div>
                <div className="text-sm font-semibold mt-1">
                  {reportType === 'bookings' ? data.bookings : 
                   reportType === 'revenue' ? `${(data.revenue / 1000).toFixed(1)}K` : `${data.occupancy}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* ตารางข้อมูล */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลรายเดือน</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เดือน
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนการจอง
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รายได้
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อัตราการเข้าพัก
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.map((data, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.revenue.toLocaleString()} บาท
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.occupancy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* อัตราการเข้าพัก */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">อัตราการเข้าพักโดยรวม</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
              className="bg-primary h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${bookingStats.occupancy_rate}%` }}
            >
              {bookingStats.occupancy_rate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;