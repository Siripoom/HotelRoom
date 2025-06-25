// src/services/bookingService.js - แก้ไขไม่ใช้ booking_number
import { supabase } from "../lib/supabase";

class BookingService {
  // ดึงข้อมูลการจองทั้งหมด
  async getBookings(filters = {}) {
    try {
      let query = supabase
        .from("bookings")
        .select(
          `
          *,
          customer:customer_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          room:room_id (
            id,
            room_number,
            room_type:room_type_id (
              id,
              name,
              base_price
            )
          ),
          payments (
            id,
            amount,
            status,
            payment_method,
            payment_date
          )
        `
        )
        .order("created_at", { ascending: false });

      // ถ้ามี filter status
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // ถ้ามี filter วันที่
      if (filters.startDate && filters.endDate) {
        query = query
          .gte("check_in_date", filters.startDate)
          .lte("check_out_date", filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // เพิ่มสถานะการชำระเงินและ key สำหรับ Table และ booking_number สำหรับแสดงผล
      const bookingsWithPaymentStatus = data.map((booking, index) => {
        const payment =
          booking.payments && booking.payments.length > 0
            ? booking.payments.find((p) => p.status === "confirmed") ||
              booking.payments[0]
            : null;

        return {
          key: booking.id,
          ...booking,
          // สร้าง booking_number จาก id และวันที่สำหรับแสดงผล
          booking_number: this.generateDisplayBookingNumber(
            booking.id,
            booking.created_at
          ),
          payment_status: payment ? payment.status : "pending",
        };
      });

      return bookingsWithPaymentStatus;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  }

  // ดึงข้อมูลการจองตาม ID
  async getBookingById(bookingId) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          customer:customer_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          room:room_id (
            id,
            room_number,
            room_type:room_type_id (
              id,
              name,
              base_price,
              amenities
            )
          ),
          payments (
            id,
            amount,
            status,
            payment_method,
            payment_date,
            slip_image_url
          )
        `
        )
        .eq("id", bookingId)
        .single();

      if (error) throw error;

      // เพิ่ม booking_number สำหรับแสดงผล
      return {
        ...data,
        booking_number: this.generateDisplayBookingNumber(
          data.id,
          data.created_at
        ),
      };
    } catch (error) {
      console.error("Error fetching booking:", error);
      throw error;
    }
  }

  // สร้างการจองใหม่
  async createBooking(bookingData) {
    try {
      // ตรวจสอบว่าห้องว่างหรือไม่
      const isAvailable = await this.checkRoomAvailability(
        bookingData.room_id,
        bookingData.check_in_date,
        bookingData.check_out_date
      );

      if (!isAvailable) {
        throw new Error("ห้องพักไม่ว่างในช่วงวันที่ที่เลือก");
      }

      const booking = {
        customer_id: bookingData.customer_id,
        room_id: bookingData.room_id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        total_price: bookingData.total_price,
        special_requests: bookingData.special_requests || "",
        status: "pending",
        created_at: new Date().toISOString(),
      };

      console.log("Creating booking with data:", booking);

      const { data, error } = await supabase
        .from("bookings")
        .insert(booking)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Booking created successfully:", data);

      // เพิ่ม booking_number สำหรับแสดงผล
      return {
        ...data,
        booking_number: this.generateDisplayBookingNumber(
          data.id,
          data.created_at
        ),
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  // อัปเดตสถานะการจอง
  async updateBookingStatus(bookingId, status) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;

      // ถ้ายืนยันการจอง ให้อัปเดตสถานะห้องเป็น occupied
      if (status === "confirmed") {
        await this.updateRoomStatus(data.room_id, "occupied");
      }

      // ถ้ายกเลิกการจอง ให้อัปเดตสถานะห้องเป็น available
      if (status === "cancelled") {
        await this.updateRoomStatus(data.room_id, "available");
      }

      return {
        ...data,
        booking_number: this.generateDisplayBookingNumber(
          data.id,
          data.created_at
        ),
      };
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }

  // ลบการจอง
  async deleteBooking(bookingId) {
    try {
      // ดึงข้อมูลการจองก่อนลบ
      const booking = await this.getBookingById(bookingId);

      // ลบการชำระเงินที่เกี่ยวข้อง
      await supabase.from("payments").delete().eq("booking_id", bookingId);

      // ลบการจอง
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      // อัปเดตสถานะห้องเป็น available
      if (booking.room && booking.room.id) {
        await this.updateRoomStatus(booking.room.id, "available");
      }

      return true;
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw error;
    }
  }

  // ตรวจสอบความพร้อมของห้อง
  async checkRoomAvailability(roomId, checkInDate, checkOutDate) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .in("status", ["pending", "confirmed"])
        .or(
          `and(check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate})`
        );

      if (error) throw error;

      return data.length === 0;
    } catch (error) {
      console.error("Error checking room availability:", error);
      return false;
    }
  }

  // อัปเดตสถานะห้อง
  async updateRoomStatus(roomId, status) {
    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status })
        .eq("id", roomId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating room status:", error);
      throw error;
    }
  }

  // สร้างหมายเลขการจองสำหรับแสดงผล (ไม่เก็บในฐานข้อมูล)
  generateDisplayBookingNumber(bookingId, createdAt) {
    try {
      const date = new Date(createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      // ใช้ส่วนสุดท้ายของ UUID เป็นหมายเลขอ้างอิง
      const idSuffix = bookingId.slice(-6).toUpperCase();

      return `BK${year}${month}${day}-${idSuffix}`;
    } catch (error) {
      console.error("Error generating display booking number:", error);
      return `BK-${bookingId.slice(-8)}`;
    }
  }

  // ดึงสถิติการจอง
  async getBookingStats(startDate, endDate) {
    try {
      let query = supabase.from("bookings").select("status, total_price");

      if (startDate && endDate) {
        query = query.gte("created_at", startDate).lte("created_at", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter((b) => b.status === "pending").length,
        confirmed: data.filter((b) => b.status === "confirmed").length,
        completed: data.filter((b) => b.status === "completed").length,
        cancelled: data.filter((b) => b.status === "cancelled").length,
        totalRevenue: data
          .filter((b) => b.status !== "cancelled")
          .reduce((sum, booking) => sum + booking.total_price, 0),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      throw error;
    }
  }

  // ดึงรายการลูกค้า
  async getCustomers() {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  // ดึงรายการห้องที่ว่าง
  async getAvailableRooms(checkInDate, checkOutDate) {
    try {
      // ดึงรายการห้องทั้งหมด
      const { data: allRooms, error: roomsError } = await supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price,
            capacity
          )
        `
        )
        .eq("status", "available");

      if (roomsError) throw roomsError;

      // ถ้าไม่มีวันที่ ให้คืนห้องทั้งหมดที่สถานะว่าง
      if (!checkInDate || !checkOutDate) {
        return allRooms;
      }

      // ตรวจสอบห้องที่ไม่มีการจองในช่วงวันที่ที่เลือก
      const availableRooms = [];

      for (const room of allRooms) {
        const isAvailable = await this.checkRoomAvailability(
          room.id,
          checkInDate,
          checkOutDate
        );

        if (isAvailable) {
          availableRooms.push(room);
        }
      }

      return availableRooms;
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      throw error;
    }
  }
}

export default new BookingService();
