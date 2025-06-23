// src/services/bookingService.js - ปรับปรุงแล้ว
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

      // เพิ่มสถานะการชำระเงินและ key สำหรับ Table
      const bookingsWithPaymentStatus = data.map((booking, index) => {
        const payment =
          booking.payments && booking.payments.length > 0
            ? booking.payments.find((p) => p.status === "confirmed") ||
              booking.payments[0]
            : null;

        return {
          key: booking.id,
          ...booking,
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

      return data;
    } catch (error) {
      console.error("Error fetching booking:", error);
      throw error;
    }
  }

  // สร้างการจองใหม่ - ปรับปรุงแล้ว
  async createBooking(bookingData) {
    try {
      console.log("Creating booking with data:", bookingData);

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!bookingData.customer_id) {
        throw new Error("ไม่พบข้อมูลลูกค้า");
      }

      if (!bookingData.room_id) {
        throw new Error("ไม่พบข้อมูลห้องพัก");
      }

      if (!bookingData.check_in_date || !bookingData.check_out_date) {
        throw new Error("กรุณาระบุวันที่เข้าพักและออก");
      }

      if (!bookingData.total_price) {
        throw new Error("ไม่พบข้อมูลราคา");
      }

      // ตรวจสอบว่าห้องว่างหรือไม่
      const isAvailable = await this.checkRoomAvailability(
        bookingData.room_id,
        bookingData.check_in_date,
        bookingData.check_out_date
      );

      if (!isAvailable) {
        throw new Error("ห้องพักไม่ว่างในช่วงวันที่ที่เลือก");
      }

      // สร้างเลขที่การจอง
      const bookingNumber = await this.generateBookingNumber();

      // เตรียมข้อมูลการจอง
      const booking = {
        booking_number: bookingNumber,
        customer_id: bookingData.customer_id,
        room_id: bookingData.room_id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        total_price: parseFloat(bookingData.total_price),
        special_requests: bookingData.special_requests || "",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Inserting booking:", booking);

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
      return data;
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
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
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

      return data;
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
      await this.updateRoomStatus(booking.room.id, "available");

      return true;
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw error;
    }
  }

  // ตรวจสอบความพร้อมของห้อง - ปรับปรุงแล้ว
  async checkRoomAvailability(roomId, checkInDate, checkOutDate) {
    try {
      console.log("Checking availability for:", {
        roomId,
        checkInDate,
        checkOutDate,
      });

      // แปลงวันที่ให้เป็นรูปแบบที่ถูกต้อง
      const formatDate = (date) => {
        if (!date) return null;

        if (typeof date === "string") {
          return date;
        } else if (date && typeof date.format === "function") {
          return date.format("YYYY-MM-DD");
        } else if (date instanceof Date) {
          return date.toISOString().split("T")[0];
        }
        return null;
      };

      const formattedCheckIn = formatDate(checkInDate);
      const formattedCheckOut = formatDate(checkOutDate);

      if (!formattedCheckIn || !formattedCheckOut) {
        console.error("Invalid date format");
        return false;
      }

      console.log("Formatted dates:", { formattedCheckIn, formattedCheckOut });

      const { data, error } = await supabase
        .from("bookings")
        .select("id, check_in_date, check_out_date, status")
        .eq("room_id", roomId)
        .in("status", ["pending", "confirmed"])
        .or(
          `and(check_in_date.lte.${formattedCheckOut},check_out_date.gte.${formattedCheckIn})`
        );

      if (error) {
        console.error("Error checking availability:", error);
        throw error;
      }

      console.log("Conflicting bookings:", data);
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
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating room status:", error);
      throw error;
    }
  }

  // สร้างเลขที่การจอง - ปรับปรุงแล้ว
  async generateBookingNumber() {
    try {
      // ดึงการจองล่าสุด
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_number")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const currentYear = new Date().getFullYear();
      let nextNumber = 1;

      if (data && data.length > 0 && data[0].booking_number) {
        const lastBookingNumber = data[0].booking_number;
        // รูปแบบ: B-YYYY001
        const match = lastBookingNumber.match(/B-(\d{4})(\d{3})/);

        if (match && parseInt(match[1]) === currentYear) {
          nextNumber = parseInt(match[2]) + 1;
        }
      }

      const bookingNumber = `B-${currentYear}${nextNumber
        .toString()
        .padStart(3, "0")}`;
      console.log("Generated booking number:", bookingNumber);
      return bookingNumber;
    } catch (error) {
      console.error("Error generating booking number:", error);
      // ถ้าเกิดข้อผิดพลาด ให้สร้างเลขที่ด้วยการ random
      const currentYear = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 1000);
      return `B-${currentYear}${randomNum.toString().padStart(3, "0")}`;
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
          .reduce((sum, booking) => sum + (booking.total_price || 0), 0),
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

  // ดึงรายการห้องที่ว่าง - ปรับปรุงแล้ว
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

      console.log(`Found ${availableRooms.length} available rooms`);
      return availableRooms;
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      throw error;
    }
  }

  // ตรวจสอบการจองที่ซ้ำซ้อน
  async checkConflictingBookings(
    roomId,
    checkInDate,
    checkOutDate,
    excludeBookingId = null
  ) {
    try {
      let query = supabase
        .from("bookings")
        .select("id, check_in_date, check_out_date, status, booking_number")
        .eq("room_id", roomId)
        .in("status", ["pending", "confirmed", "completed"])
        .or(
          `and(check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate})`
        );

      if (excludeBookingId) {
        query = query.neq("id", excludeBookingId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error checking conflicting bookings:", error);
      throw error;
    }
  }

  // ค้นหาการจองด้วยหมายเลขการจอง
  async findBookingByNumber(bookingNumber) {
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
              base_price
            )
          )
        `
        )
        .eq("booking_number", bookingNumber)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error finding booking by number:", error);
      throw error;
    }
  }
}

export default new BookingService();
