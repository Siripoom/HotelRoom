// src/pages/admin/Payments.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);

  useEffect(() => {
    // ในตอนนี้ใช้ข้อมูลตัวอย่าง (mock data)
    // ในโปรเจคจริงควรดึงข้อมูลจาก Supabase
    const mockPayments = [
      {
        id: '1',
        booking: { 
          id: '1', 
          booking_number: 'B-2025001',
          customer: { first_name: 'สมชาย', last_name: 'ใจดี' },
          check_in_date: '2025-05-15',
          check_out_date: '2025-05-17',
          total_price: 2000
        },
        amount: 2000,
        payment_date: '2025-05-10T12:30:00Z',
        payment_method: 'bank_transfer',
        slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
        status: 'pending',
        created_at: '2025-05-10T12:30:00Z'
      },
      {
        id: '2',
        booking: { 
          id: '2', 
          booking_number: 'B-2025002',
          customer: { first_name: 'วิชัย', last_name: 'รักสงบ' },
          check_in_date: '2025-05-20',
          check_out_date: '2025-05-25',
          total_price: 5000
        },
        amount: 5000,
        payment_date: '2025-05-11T15:45:00Z',
        payment_method: 'bank_transfer',
        slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
        status: 'confirmed',
        created_at: '2025-05-11T15:45:00Z'
      },
      {
        id: '3',
        booking: { 
          id: '3', 
          booking_number: 'B-2025003',
          customer: { first_name: 'สุดา', last_name: 'แสนดี' },
          check_in_date: '2025-05-14',
          check_out_date: '2025-05-16',
          total_price: 3000
        },
        amount: 3000,
        payment_date: '2025-05-05T10:20:00Z',
        payment_method: 'bank_transfer',
        slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
        status: 'confirmed',
        created_at: '2025-05-05T10:20:00Z'
      },
      {
        id: '4',
        booking: { 
          id: '4', 
          booking_number: 'B-2025004',
          customer: { first_name: 'มานะ', last_name: 'ตั้งใจ' },
          check_in_date: '2025-05-18',
          check_out_date: '2025-05-20',
          total_price: 5000
        },
        amount: 5000,
        payment_date: '2025-05-08T17:10:00Z',
        payment_method: 'bank_transfer',
        slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
        status: 'rejected',
        created_at: '2025-05-08T17:10:00Z'
      },
      {
        id: '5',
        booking: { 
          id: '5', 
          booking_number: 'B-2025005',
          customer: { first_name: 'พรรณี', last_name: 'สวยงาม' },
          check_in_date: '2025-05-22',
          check_out_date: '2025-05-24',
          total_price: 3000
        },
        amount: 3000,
        payment_date: '2025-05-12T14:25:00Z',
        payment_method: 'bank_transfer',
        slip_image_url: 'https://via.placeholder.com/300x400?text=Payment+Slip',
        status: 'pending',
        created_at: '2025-05-12T14:25:00Z'
      },
    ];
    
    setPayments(mockPayments);
    setFilteredPayments(mockPayments);
    
    // ตัวอย่างการดึงข้อมูลจาก Supabase (uncomment เมื่อมีข้อมูลจริง)
    /*
    async function fetchPayments() {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            booking:booking_id (
              id,
              booking_number,
              check_in_date,
              check_out_date,
              total_price,
              customer:customer_id (
                first_name,
                last_name
              )
            )
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPayments(data);
        setFilteredPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    }
    
    fetchPayments();
    */
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(payment => payment.status === filter));
    }
  }, [filter, payments]);

  const openModal = (payment) => {
    setCurrentPayment(payment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPayment(null);
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      // ในโครงการจริง: อัปเดตข้อมูลใน Supabase
      /*
      // อัปเดตสถานะการชำระเงิน
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', paymentId);
        
      if (paymentError) throw paymentError;
      
      // หากยืนยันการชำระเงิน ให้อัปเดตสถานะการจองเป็น confirmed
      if (newStatus === 'confirmed') {
        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', payment.booking.id);
            
          if (bookingError) throw bookingError;
        }
      }
      
      // หากปฏิเสธการชำระเงิน ให้คงสถานะการจองเป็น pending
      // (หรืออาจยกเลิกการจองโดยอัตโนมัติ ขึ้นอยู่กับความต้องการ)
      */
      
      // อัปเดตข้อมูลในสถานะ (mock)
      const updatedPayments = payments.map(payment => {
        if (payment.id === paymentId) {
          return { ...payment, status: newStatus };
        }
        return payment;
      });
      setPayments(updatedPayments);
      
      closeModal();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
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
      case 'rejected':
        return 'ปฏิเสธ';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH');
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">จัดการการชำระเงิน</h2>
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
            className={`px-3 py-1 rounded-md ${filter === 'rejected' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('rejected')}
          >
            ปฏิเสธ
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
                  จำนวนเงิน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่ชำระเงิน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วิธีการชำระเงิน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.booking.booking_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.booking.customer.first_name} {payment.booking.customer.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.amount.toLocaleString()} บาท
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(payment.payment_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.payment_method === 'bank_transfer' ? 'โอนเงิน' : payment.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(payment)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      ตรวจสอบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal for viewing and managing payment */}
      {isModalOpen && currentPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  ตรวจสอบการชำระเงิน: {currentPayment.booking.booking_number}
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-500">สถานะการชำระเงิน:</div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(currentPayment.status)}`}>
                      {getStatusText(currentPayment.status)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">ข้อมูลการชำระเงิน</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">ลูกค้า:</span>
                      <span className="ml-1">{currentPayment.booking.customer.first_name} {currentPayment.booking.customer.last_name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">จำนวนเงิน:</span>
                      <span className="ml-1">{currentPayment.amount.toLocaleString()} บาท</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">วันที่ชำระเงิน:</span>
                      <span className="ml-1">{formatDateTime(currentPayment.payment_date)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">วิธีการชำระเงิน:</span>
                      <span className="ml-1">{currentPayment.payment_method === 'bank_transfer' ? 'โอนเงิน' : currentPayment.payment_method}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-md font-medium text-gray-700 mb-2">ข้อมูลการจอง</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">วันที่เช็คอิน:</span>
                      <span className="ml-1">{formatDate(currentPayment.booking.check_in_date)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">วันที่เช็คเอาท์:</span>
                      <span className="ml-1">{formatDate(currentPayment.booking.check_out_date)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">ราคารวม:</span>
                      <span className="ml-1">{currentPayment.booking.total_price.toLocaleString()} บาท</span>
                    </div>
                  </div>
                  
                  <h4 className="text-md font-medium text-gray-700 mb-2">สลิปการโอนเงิน</h4>
                  <div className="flex justify-center mb-4">
                    <img 
                      src={currentPayment.slip_image_url} 
                      alt="หลักฐานการชำระเงิน" 
                      className="max-w-full h-auto max-h-64 border border-gray-200 rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {currentPayment.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleStatusChange(currentPayment.id, 'confirmed')}
                    >
                      ยืนยันการชำระเงิน
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleStatusChange(currentPayment.id, 'rejected')}
                    >
                      ปฏิเสธการชำระเงิน
                    </button>
                  </>
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

export default AdminPayments;