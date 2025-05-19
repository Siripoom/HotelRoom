// src/pages/admin/Bookings.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // ในตอนนี้ใช้ข้อมูลตัวอย่าง (mock data)
    // ในโปรเจคจริงควรดึงข้อมูลจาก Supabase
    const mockBookings = [
      {
        id: '1',
        booking_number: 'B-2025001',
        customer: { first_name: 'สมชาย', last_name: 'ใจดี', email: 'somchai@example.com', phone: '081-234-5678' },
        room: { room_number: '101', room_type: { name: 'ห้องเตียงเดี่ยว' } },
        check_in_date: '2025-05-15',
        check_out_date: '2025-05-17',
        total_price: 2000,
        status: 'pending',
        created_at: '2025-05-10T10:30:00Z',
        payment_status: 'pending'
      },
      {
        id: '2',
        booking_number: 'B-2025002',
        customer: { first_name: 'วิชัย', last_name: 'รักสงบ', email: 'wichai@example.com', phone: '081-876-5432' },
        room: { room_number: '102', room_type: { name: 'ห้องเตียงเดี่ยว' } },
        check_in_date: '2025-05-20',
        check_out_date: '2025-05-25',
        total_price: 5000,
        status: 'confirmed',
        created_at: '2025-05-11T14:20:00Z',
        payment_status: 'confirmed'
      },
      {
        id: '3',
        booking_number: 'B-2025003',
        customer: { first_name: 'สุดา', last_name: 'แสนดี', email: 'suda@example.com', phone: '081-111-2222' },
        room: { room_number: '201', room_type: { name: 'ห้องเตียงคู่' } },
        check_in_date: '2025-05-14',
        check_out_date: '2025-05-16',
        total_price: 3000,
        status: 'completed',
        created_at: '2025-05-05T09:15:00Z',
        payment_status: 'confirmed'
      },
      {
        id: '4',
        booking_number: 'B-2025004',
        customer: { first_name: 'มานะ', last_name: 'ตั้งใจ', email: 'mana@example.com', phone: '081-333-4444' },
        room: { room_number: '301', room_type: { name: 'ห้องสวีท' } },
        check_in_date: '2025-05-18',
        check_out_date: '2025-05-20',
        total_price: 5000,
        status: 'cancelled',
        created_at: '2025-05-08T16:40:00Z',
        payment_status: 'refunded'
      },
      {
        id: '5',
        booking_number: 'B-2025005',
        customer: { first_name: 'พรรณี', last_name: 'สวยงาม', email: 'pannee@example.com', phone: '081-555-6666' },
        room: { room_number: '202', room_type: { name: 'ห้องเตียงคู่' } },
        check_in_date: '2025-05-22',
        check_out_date: '2025-05-24',
        total_price: 3000,
        status: 'pending',
        created_at: '2025-05-12T11:10:00Z',
        payment_status: 'pending'
      },
    ];
    
    setBookings(mockBookings);
    setFilteredBookings(mockBookings);
    
    // ตัวอย่างการดึงข้อมูลจาก Supabase (uncomment เมื่อมีข้อมูลจริง)
    /*
    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            customer:customer_id (*),
            room:room_id (
              room_number,
              room_type:room_type_id (name)
            ),
            payments (*)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // เพิ่มสถานะการชำระเงิน
        const bookingsWithPaymentStatus = data.map(booking => {
          const payment = booking.payments && booking.payments.length > 0 
            ? booking.payments[0] 
            : null;
            
          return {
            ...booking,
            payment_status: payment ? payment.status : 'pending'
          };
        });
        
        setBookings(bookingsWithPaymentStatus);
        setFilteredBookings(bookingsWithPaymentStatus);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    }
    
    fetchBookings();
    */
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === filter));
    }
  }, [filter, bookings]);

  const openModal = (booking) => {
    setCurrentBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBooking(null);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // ในโครงการจริง: อัปเดตข้อมูลใน Supabase
      /*
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
        
      if (error) throw error;
      */
      
      // อัปเดตข้อมูลในสถานะ (mock)
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      setBookings(updatedBookings);
      
      closeModal();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'รอการยืนยัน';
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'รอการยืนยัน';
      case 'confirmed':
        return 'ชำระแล้ว';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'refunded':
        return 'คืนเงินแล้ว';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">จัดการการจอง</h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            ทั้งหมด
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('pending')}
          >
            รอการยืนยัน
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'confirmed' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('confirmed')}
          >
            ยืนยันแล้ว
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'completed' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('completed')}
          >
            เสร็จสิ้น
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'cancelled' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('cancelled')}
          >
            ยกเลิก
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลขที่การจอง
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ห้อง
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่เข้าพัก
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การชำระเงิน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.booking_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.customer.first_name} {booking.customer.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.room.room_number} ({booking.room.room_type.name})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(booking.payment_status)}`}>
                      {getPaymentStatusText(booking.payment_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(booking)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      รายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal for viewing and managing booking details */}
      {isModalOpen && currentBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  รายละเอียดการจอง: {currentBooking.booking_number}
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-500">สถานะการจอง:</div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(currentBooking.status)}`}>
                      {getStatusText(currentBooking.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-500">สถานะการชำระเงิน:</div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(currentBooking.payment_status)}`}>
                      {getPaymentStatusText(currentBooking.payment_status)}
                    </span>
                  </div>
                </div>
                // src/pages/admin/Bookings.jsx (ต่อ)
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">ข้อมูลลูกค้า</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">ชื่อ-นามสกุล:</span>
                      <span className="ml-1">{currentBooking.customer.first_name} {currentBooking.customer.last_name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">อีเมล:</span>
                      <span className="ml-1">{currentBooking.customer.email}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">เบอร์โทร:</span>
                      <span className="ml-1">{currentBooking.customer.phone}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-md font-medium text-gray-700 mb-2">ข้อมูลการจอง</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">เลขห้อง:</span>
                      <span className="ml-1">{currentBooking.room.room_number}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">ประเภทห้อง:</span>
                      <span className="ml-1">{currentBooking.room.room_type.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">วันที่เช็คอิน:</span>
                      <span className="ml-1">{formatDate(currentBooking.check_in_date)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">วันที่เช็คเอาท์:</span>
                      <span className="ml-1">{formatDate(currentBooking.check_out_date)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">ราคารวม:</span>
                      <span className="ml-1">{currentBooking.total_price.toLocaleString()} บาท</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">วันที่จอง:</span>
                      <span className="ml-1">{new Date(currentBooking.created_at).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {currentBooking.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleStatusChange(currentBooking.id, 'confirmed')}
                    >
                      ยืนยันการจอง
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleStatusChange(currentBooking.id, 'cancelled')}
                    >
                      ยกเลิกการจอง
                    </button>
                  </>
                )}
                
                {currentBooking.status === 'confirmed' && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleStatusChange(currentBooking.id, 'completed')}
                  >
                    เสร็จสิ้นการจอง
                  </button>
                )}
                
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;