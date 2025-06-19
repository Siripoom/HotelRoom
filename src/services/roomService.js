// src/services/roomService.js
import { supabase } from "../lib/supabase";

class RoomService {
  // ดึงรายการห้องพักทั้งหมด
  async getRooms(filters = {}) {
    try {
      let query = supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price,
            capacity,
            amenities,
            description
          )
        `
        )
        .order("room_number", { ascending: true });

      // ถ้ามี filter สถานะ
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // ถ้ามี filter ประเภทห้อง
      if (filters.roomTypeId && filters.roomTypeId !== "all") {
        query = query.eq("room_type_id", filters.roomTypeId);
      }

      // ถ้ามี filter ราคา
      if (filters.minPrice || filters.maxPrice) {
        if (filters.minPrice) {
          query = query.gte("room_type.base_price", filters.minPrice);
        }
        if (filters.maxPrice) {
          query = query.lte("room_type.base_price", filters.maxPrice);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  }

  // ดึงข้อมูลห้องพักตาม ID
  async getRoomById(roomId) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price,
            capacity,
            amenities,
            description
          )
        `
        )
        .eq("id", roomId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching room:", error);
      throw error;
    }
  }

  // ดึงห้องพักที่แนะนำ (3 ห้องแรก)
  async getFeaturedRooms(limit = 3) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price,
            capacity,
            amenities,
            description
          )
        `
        )
        .eq("status", "available")
        .order("room_number", { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching featured rooms:", error);
      throw error;
    }
  }

  // ดึงประเภทห้องพักทั้งหมด
  async getRoomTypes() {
    try {
      const { data, error } = await supabase
        .from("room_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching room types:", error);
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

  // ค้นหาห้องพักที่ว่าง
  async searchAvailableRooms(searchParams) {
    try {
      const { checkInDate, checkOutDate, guests, roomType } = searchParams;

      // ดึงรายการห้องทั้งหมด
      let query = supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price,
            capacity,
            amenities,
            description
          )
        `
        )
        .eq("status", "available");

      // ถ้าระบุประเภทห้อง
      if (roomType && roomType !== "all") {
        query = query.eq("room_type_id", roomType);
      }

      // ถ้าระบุจำนวนผู้เข้าพัก
      if (guests) {
        query = query.gte("room_type.capacity", guests);
      }

      const { data: allRooms, error } = await query;

      if (error) throw error;

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
      console.error("Error searching available rooms:", error);
      throw error;
    }
  }

  // ดึงห้องพักที่เกี่ยวข้อง (ประเภทเดียวกัน)
  async getRelatedRooms(roomId, limit = 3) {
    try {
      // ดึงข้อมูลห้องปัจจุบันก่อน
      const currentRoom = await this.getRoomById(roomId);

      if (!currentRoom) return [];

      // ดึงห้องที่มีประเภทเดียวกัน แต่ไม่ใช่ห้องเดิม
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          room_type:room_type_id (
            id,
            name,
            base_price,
            capacity,
            amenities,
            description
          )
        `
        )
        .eq("room_type_id", currentRoom.room_type_id)
        .neq("id", roomId)
        .eq("status", "available")
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching related rooms:", error);
      throw error;
    }
  }

  // คำนวณราคาห้องพัก
  calculateRoomPrice(
    basePrice,
    checkInDate,
    checkOutDate,
    discountPercent = 0
  ) {
    if (!checkInDate || !checkOutDate) return basePrice;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const totalPrice = basePrice * nights;
    const discount = (totalPrice * discountPercent) / 100;

    return {
      basePrice,
      nights,
      subtotal: totalPrice,
      discount,
      total: totalPrice - discount,
    };
  }

  // ดึงรีวิวห้องพัก (mock data สำหรับตอนนี้)
  async getRoomReviews(roomId) {
    try {
      // ในอนาคตอาจมีตาราง reviews
      // const { data, error } = await supabase
      //   .from("reviews")
      //   .select("*")
      //   .eq("room_id", roomId);

      // Mock data สำหรับตอนนี้
      const mockReviews = [
        {
          id: 1,
          customer_name: "คุณสมชาย ใจดี",
          rating: 5,
          comment: "ห้องพักสะอาด บริการดีมาก วิวสวยงาม",
          created_at: "2025-05-15",
        },
        {
          id: 2,
          customer_name: "คุณวาสนา มีสุข",
          rating: 4,
          comment: "ห้องกว้างขวาง เตียงนอนสบาย",
          created_at: "2025-05-10",
        },
      ];

      return mockReviews;
    } catch (error) {
      console.error("Error fetching room reviews:", error);
      throw error;
    }
  }
}

export default new RoomService();
