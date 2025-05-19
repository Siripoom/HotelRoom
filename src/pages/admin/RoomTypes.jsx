// src/pages/admin/RoomTypes.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function AdminRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoomType, setCurrentRoomType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    capacity: 1,
    amenities: [],
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      setRoomTypes(data || []);
    } catch (error) {
      console.error('Error fetching room types:', error);
      alert('ไม่สามารถโหลดข้อมูลประเภทห้องพักได้');
    }
  };

  const openModal = (roomType = null) => {
    if (roomType) {
      setCurrentRoomType(roomType);
      setFormData({
        name: roomType.name,
        description: roomType.description || '',
        base_price: roomType.base_price,
        capacity: roomType.capacity || 1,
        amenities: roomType.amenities || [],
      });
    } else {
      setCurrentRoomType(null);
      setFormData({
        name: '',
        description: '',
        base_price: '',
        capacity: 1,
        amenities: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRoomType(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const handleAmenitiesChange = (e) => {
    const { value } = e.target;
    const amenity = value.trim();
    
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
      e.target.value = '';
    }
  };

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // ข้อมูลที่จะบันทึกลงฐานข้อมูล
      const roomTypeData = {
        name: formData.name,
        description: formData.description,
        base_price: Number(formData.base_price),
        capacity: Number(formData.capacity),
        amenities: formData.amenities
      };
      
      if (currentRoomType) {
        // อัปเดตข้อมูลประเภทห้องพัก
        const { data, error } = await supabase
          .from('room_types')
          .update(roomTypeData)
          .eq('id', currentRoomType.id)
          .select();
          
        if (error) throw error;
        
        // อัปเดตข้อมูลในสถานะ
        setRoomTypes(roomTypes.map(roomType => 
          roomType.id === currentRoomType.id ? data[0] : roomType
        ));
      } else {
        // เพิ่มข้อมูลประเภทห้องพักใหม่
        const { data, error } = await supabase
          .from('room_types')
          .insert(roomTypeData)
          .select();
          
        if (error) throw error;
        
        // เพิ่มข้อมูลในสถานะ
        setRoomTypes([...roomTypes, data[0]]);
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving room type:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (roomTypeId) => {
    // ตรวจสอบว่ามีห้องพักที่ใช้ประเภทห้องนี้หรือไม่
    try {
      const { data: roomsUsingThisType, error: roomsCheckError } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_type_id', roomTypeId);
        
      if (roomsCheckError) throw roomsCheckError;
      
      if (roomsUsingThisType && roomsUsingThisType.length > 0) {
        alert(`ไม่สามารถลบประเภทห้องพักนี้ได้ เนื่องจากมีห้องพัก ${roomsUsingThisType.length} ห้อง ที่ใช้ประเภทห้องนี้อยู่`);
        return;
      }
    } catch (error) {
      console.error('Error checking rooms using this room type:', error);
      alert('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลห้องพัก');
      return;
    }
    
    if (!confirm('คุณต้องการลบประเภทห้องพักนี้ใช่หรือไม่?')) return;
    
    try {
      setIsLoading(true);
      
      // ลบข้อมูลจากฐานข้อมูล
      const { error } = await supabase
        .from('room_types')
        .delete()
        .eq('id', roomTypeId);
        
      if (error) throw error;
      
      // ลบข้อมูลจากสถานะ
      setRoomTypes(roomTypes.filter(roomType => roomType.id !== roomTypeId));
    } catch (error) {
      console.error('Error deleting room type:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">จัดการประเภทห้องพัก</h2>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          onClick={() => openModal()}
        >
          เพิ่มประเภทห้อง
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อประเภทห้อง
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รายละเอียด
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคาพื้นฐาน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ความจุ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สิ่งอำนวยความสะดวก
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roomTypes.map((roomType) => (
                <tr key={roomType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {roomType.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {roomType.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {roomType.base_price.toLocaleString()} บาท/คืน
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {roomType.capacity || 1} คน
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {roomType.amenities && roomType.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {roomType.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                        {roomType.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                            +{roomType.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(roomType)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      disabled={isLoading}
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(roomType.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isLoading}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal for adding/editing room types */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {currentRoomType ? 'แก้ไขประเภทห้องพัก' : 'เพิ่มประเภทห้องพักใหม่'}
                  </h3>
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อประเภทห้อง
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      รายละเอียด
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                        ราคาพื้นฐาน (บาท/คืน)
                      </label>
                      <input
                        type="number"
                        id="base_price"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                        ความจุ (จำนวนคน)
                      </label>
                      <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-1">
                      สิ่งอำนวยความสะดวก
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="amenities"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAmenitiesChange(e))}
                        onBlur={handleAmenitiesChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="เพิ่มสิ่งอำนวยความสะดวก แล้วกด Enter"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleAmenitiesChange({ target: document.getElementById('amenities') })}
                        className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark"
                      >
                        เพิ่ม
                      </button>
                    </div>
                    
                    {formData.amenities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                            <span className="text-sm">{amenity}</span>
                            <button
                              type="button"
                              className="ml-2 text-gray-500 hover:text-red-500"
                              onClick={() => removeAmenity(index)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'กำลังบันทึก...' : currentRoomType ? 'บันทึกการแก้ไข' : 'เพิ่มประเภทห้อง'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeModal}
                    disabled={isLoading}
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoomTypes;