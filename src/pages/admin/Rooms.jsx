// src/pages/admin/Rooms.jsx
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "../../lib/supabase";
import { uploadImage, deleteImage } from "../../utils/storageUtils";

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    room_type_id: "",
    description: "",
    status: "available",
    main_image: "",
    images: [],
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);

  // โหลดข้อมูลห้องพักและประเภทห้อง
  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("room_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setRoomTypes(data || []);
    } catch (error) {
      console.error("Error fetching room types:", error);
      alert("ไม่สามารถโหลดข้อมูลประเภทห้องพักได้");
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price
          )
        `
        )
        .order("room_number", { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("ไม่สามารถโหลดข้อมูลห้องพักได้");
    }
  };

  // ฟังก์ชันเปิด/ปิด Modal
  const openModal = (room = null) => {
    if (room) {
      setCurrentRoom(room);
      setFormData({
        room_number: room.room_number,
        room_type_id: room.room_type_id,
        description: room.description || "",
        status: room.status,
        main_image: room.main_image || "",
        images: room.images || [],
      });
      setUploadedImages(room.images || []);
    } else {
      setCurrentRoom(null);
      setFormData({
        room_number: "",
        room_type_id: "",
        description: "",
        status: "available",
        main_image: "",
        images: [],
      });
      setUploadedImages([]);
      setMainImageFile(null);
      setAdditionalImageFiles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRoom(null);
    setMainImageFile(null);
    setAdditionalImageFiles([]);
  };

  // จัดการการเปลี่ยนแปลงในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // จัดการอัปโหลดรูปภาพหลัก
  const onMainImageDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setMainImageFile(file);
      // แสดงภาพตัวอย่าง
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, main_image: previewUrl }));
    }
  }, []);

  const {
    getRootProps: getMainImageRootProps,
    getInputProps: getMainImageInputProps,
  } = useDropzone({
    onDrop: onMainImageDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  // จัดการอัปโหลดรูปภาพเพิ่มเติม
  const onAdditionalImagesDrop = useCallback((acceptedFiles) => {
    setAdditionalImageFiles((prev) => [...prev, ...acceptedFiles]);

    // สร้าง preview URLs สำหรับการแสดงผล
    const newPreviewUrls = acceptedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setUploadedImages((prev) => [...prev, ...newPreviewUrls]);
  }, []);

  const {
    getRootProps: getAdditionalImagesRootProps,
    getInputProps: getAdditionalImagesInputProps,
  } = useDropzone({
    onDrop: onAdditionalImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
  });

  // ลบรูปภาพเพิ่มเติม
  const removeImage = (index) => {
    // ถ้าเป็นรูปภาพที่มีอยู่แล้ว จะต้องลบจาก array
    // ถ้าเป็นรูปภาพที่เพิ่งอัปโหลด จะต้องลบจาก array ของไฟล์ด้วย
    const isNewImage = index >= formData.images.length;

    if (isNewImage) {
      const newIndex = index - formData.images.length;
      setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== newIndex));
    }

    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // บันทึกข้อมูลห้องพัก
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let mainImageUrl = formData.main_image;
      let additionalImageUrls = [...formData.images];

      // อัปโหลดรูปภาพหลัก (ถ้ามี)
      if (mainImageFile) {
        mainImageUrl = await uploadImage(mainImageFile);
      }

      // อัปโหลดรูปภาพเพิ่มเติม (ถ้ามี)
      if (additionalImageFiles.length > 0) {
        const newUrls = await Promise.all(
          additionalImageFiles.map((file) => uploadImage(file))
        );
        additionalImageUrls = [...additionalImageUrls, ...newUrls];
      }

      // ข้อมูลที่จะบันทึกลงฐานข้อมูล
      const roomData = {
        room_number: formData.room_number,
        room_type_id: formData.room_type_id,
        description: formData.description,
        status: formData.status,
        main_image: mainImageUrl,
        images: additionalImageUrls,
      };

      if (currentRoom) {
        // อัปเดตข้อมูลห้องพัก
        const { data, error } = await supabase
          .from("rooms")
          .update(roomData)
          .eq("id", currentRoom.id)
          .select();

        if (error) throw error;

        // อัปเดตข้อมูลในสถานะ
        setRooms(
          rooms.map((room) =>
            room.id === currentRoom.id
              ? {
                  ...data[0],
                  room_type: roomTypes.find(
                    (rt) => rt.id === roomData.room_type_id
                  ),
                }
              : room
          )
        );
      } else {
        // เพิ่มข้อมูลห้องพักใหม่
        const { data, error } = await supabase
          .from("rooms")
          .insert(roomData)
          .select();

        if (error) throw error;

        // เพิ่มข้อมูลในสถานะ
        setRooms([
          ...rooms,
          {
            ...data[0],
            room_type: roomTypes.find((rt) => rt.id === roomData.room_type_id),
          },
        ]);
      }

      closeModal();
      // เรียกดึงข้อมูลใหม่อีกครั้งเพื่อให้แน่ใจว่าข้อมูลเป็นปัจจุบัน
      fetchRooms();
    } catch (error) {
      console.error("Error saving room:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ลบห้องพัก
  const handleDelete = async (roomId) => {
    if (!confirm("คุณต้องการลบห้องพักนี้ใช่หรือไม่?")) return;

    try {
      setIsLoading(true);

      // ดึงข้อมูลห้องพักที่จะลบ
      const roomToDelete = rooms.find((room) => room.id === roomId);

      // ลบรูปภาพจาก Storage (ถ้ามี)
      if (roomToDelete.main_image) {
        await deleteImage(roomToDelete.main_image);
      }

      if (roomToDelete.images && roomToDelete.images.length > 0) {
        await Promise.all(roomToDelete.images.map((url) => deleteImage(url)));
      }

      // ลบข้อมูลจากฐานข้อมูล
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);

      if (error) throw error;

      // ลบข้อมูลจากสถานะ
      setRooms(rooms.filter((room) => room.id !== roomId));
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันช่วยสำหรับแสดงสถานะห้องพัก
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "ว่าง";
      case "occupied":
        return "ไม่ว่าง";
      case "maintenance":
        return "กำลังปรับปรุง";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">จัดการห้องพัก</h2>
        {/* ปรับปุ่มให้เด่นชัดขึ้นและใหญ่ขึ้น */}
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-lg shadow-md"
          onClick={() => openModal()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          เพิ่มห้องพัก
        </button>
      </div>

      {/* เพิ่มส่วนนี้เพื่อแสดงข้อความเมื่อไม่มีข้อมูล */}
      {rooms.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-6 text-lg">ยังไม่มีข้อมูลห้องพัก</p>
          <button
            className="px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center text-lg shadow-md"
            onClick={() => openModal()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            เพิ่มห้องพักใหม่
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* เพิ่มปุ่มในส่วนหัวของตาราง */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-medium text-gray-700">
              รายการห้องพักทั้งหมด ({rooms.length})
            </h3>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 inline-flex items-center shadow-sm"
              onClick={() => openModal()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              เพิ่มห้องพักใหม่
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    รูปภาพ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    หมายเลขห้อง
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ประเภทห้อง
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    รายละเอียด
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สถานะ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {room.main_image ? (
                        <img
                          src={room.main_image}
                          alt={`ห้อง ${room.room_number}`}
                          className="h-16 w-24 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                          ไม่มีรูปภาพ
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.room_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.room_type?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {room.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          room.status
                        )}`}
                      >
                        {getStatusText(room.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(room)}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-md mr-2"
                        disabled={isLoading}
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md"
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
      )}

      {/* Modal for adding/editing rooms */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* พื้นหลังทึบ - ลบ onClick={closeModal} ออก */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* ส่วนเนื้อหา Modal - ลบ onClick={(e) => e.stopPropagation()} ออก */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* เพิ่มปุ่มปิด X ที่มุมบนขวา */}
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={closeModal}
              >
                <span className="sr-only">ปิด</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b">
                    {currentRoom ? "แก้ไขข้อมูลห้องพัก" : "เพิ่มห้องพักใหม่"}
                  </h3>

                  <div className="mb-4">
                    <label
                      htmlFor="room_number"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      หมายเลขห้อง
                    </label>
                    <input
                      type="text"
                      id="room_number"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="room_type_id"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ประเภทห้อง
                    </label>
                    <select
                      id="room_type_id"
                      name="room_type_id"
                      value={formData.room_type_id || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- เลือกประเภทห้อง --</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - {type.base_price} บาท/คืน
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      รายละเอียด
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      สถานะ
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="available">ว่าง</option>
                      <option value="occupied">ไม่ว่าง</option>
                      <option value="maintenance">กำลังปรับปรุง</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รูปภาพหลัก
                    </label>
                    <div
                      {...getMainImageRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                    >
                      <input {...getMainImageInputProps()} />
                      {formData.main_image ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={formData.main_image}
                            alt="รูปภาพหลัก"
                            className="w-full max-h-48 object-contain mb-2"
                          />
                          <p className="text-sm text-gray-500">
                            คลิกเพื่อเปลี่ยนรูปภาพ
                          </p>
                        </div>
                      ) : (
                        <div className="py-4">
                          <p className="text-sm text-gray-500">
                            คลิกเพื่ออัปโหลดรูปภาพหลัก
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รูปภาพเพิ่มเติม
                    </label>
                    <div
                      {...getAdditionalImagesRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 mb-2"
                    >
                      <input {...getAdditionalImagesInputProps()} />
                      <p className="text-sm text-gray-500">
                        คลิกเพื่ออัปโหลดรูปภาพเพิ่มเติม
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์
                      </p>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {uploadedImages.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`รูปภาพ ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              onClick={() => removeImage(index)}
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
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        กำลังบันทึก...
                      </>
                    ) : currentRoom ? (
                      "บันทึกการแก้ไข"
                    ) : (
                      "เพิ่มห้องพัก"
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

      {/* แสดง Loading Overlay เมื่อกำลังโหลดข้อมูล */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <svg
              className="animate-spin h-6 w-6 text-blue-600 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-800">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      )}

      {/* แสดงปุ่ม Floating เพิ่มห้องพัก */}
      <div className="fixed bottom-8 right-8 z-10">
        <button
          onClick={() => openModal()}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AdminRooms;
