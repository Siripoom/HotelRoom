// src/utils/bookingStorageUtils.js

export const bookingStorageUtils = {
  // เก็บข้อมูลการจอง
  saveBookingInfo: (bookingData) => {
    try {
      const dataToSave = {
        ...bookingData,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("bookingInfo", JSON.stringify(dataToSave));
      console.log("Saved booking info:", dataToSave);
      return true;
    } catch (error) {
      console.error("Error saving booking info:", error);
      return false;
    }
  },

  // ดึงข้อมูลการจอง
  getBookingInfo: () => {
    try {
      const savedData = localStorage.getItem("bookingInfo");
      if (!savedData) return null;

      const bookingData = JSON.parse(savedData);

      // ตรวจสอบว่าข้อมูลไม่เก่าเกินไป (24 ชั่วโมง)
      const now = new Date().getTime();
      const dataAge = now - (bookingData.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

      if (dataAge > maxAge) {
        console.log("Booking data expired, removing from localStorage");
        localStorage.removeItem("bookingInfo");
        return null;
      }

      return bookingData;
    } catch (error) {
      console.error("Error getting booking info:", error);
      localStorage.removeItem("bookingInfo");
      return null;
    }
  },

  // ล้างข้อมูลการจอง
  clearBookingInfo: () => {
    try {
      localStorage.removeItem("bookingInfo");
      console.log("Cleared booking info from localStorage");
      return true;
    } catch (error) {
      console.error("Error clearing booking info:", error);
      return false;
    }
  },

  // ตรวจสอบว่ามีข้อมูลการจองหรือไม่
  hasBookingInfo: () => {
    const bookingData = bookingStorageUtils.getBookingInfo();
    return bookingData !== null;
  },

  // อัปเดตข้อมูลการจอง
  updateBookingInfo: (updates) => {
    try {
      const currentData = bookingStorageUtils.getBookingInfo();
      if (!currentData) return false;

      const updatedData = {
        ...currentData,
        ...updates,
        timestamp: new Date().getTime(),
      };

      return bookingStorageUtils.saveBookingInfo(updatedData);
    } catch (error) {
      console.error("Error updating booking info:", error);
      return false;
    }
  },
};
