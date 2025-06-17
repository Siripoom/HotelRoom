// src/services/dashboardService.js
import { supabase } from "../lib/supabase";

class DashboardService {
  // ดึงสถิติรวมของระบบ
  async getOverviewStats() {
    try {
      // ดึงข้อมูลห้องพัก
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("id, status");

      if (roomsError) throw roomsError;

      // ดึงข้อมูลการจองในวันนี้
      const today = new Date().toISOString().split("T")[0];
      const { data: todayBookings, error: todayBookingsError } = await supabase
        .from("bookings")
        .select("id, status")
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`);

      if (todayBookingsError) throw todayBookingsError;

      // ดึงข้อมูลการจองที่รอดำเนินการ
      const { data: pendingBookings, error: pendingBookingsError } =
        await supabase.from("bookings").select("id").eq("status", "pending");

      if (pendingBookingsError) throw pendingBookingsError;

      // ดึงข้อมูลการชำระเงินที่รอยืนยัน
      const { data: pendingPayments, error: pendingPaymentsError } =
        await supabase
          .from("payments")
          .select("id, amount")
          .eq("status", "pending");

      if (pendingPaymentsError) throw pendingPaymentsError;

      // ดึงรายได้ในเดือนนี้
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyRevenue, error: monthlyRevenueError } =
        await supabase
          .from("payments")
          .select("amount")
          .eq("status", "confirmed")
          .gte("payment_date", startOfMonth.toISOString());

      if (monthlyRevenueError) throw monthlyRevenueError;

      // คำนวณสถิติ
      const totalRooms = roomsData.length;
      const availableRooms = roomsData.filter(
        (room) => room.status === "available"
      ).length;
      const occupiedRooms = roomsData.filter(
        (room) => room.status === "occupied"
      ).length;
      const maintenanceRooms = roomsData.filter(
        (room) => room.status === "maintenance"
      ).length;

      const occupancyRate =
        totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      const totalRevenue = monthlyRevenue.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const pendingAmount = pendingPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      return {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          maintenance: maintenanceRooms,
          occupancyRate,
        },
        bookings: {
          today: todayBookings.length,
          pending: pendingBookings.length,
          todayPending: todayBookings.filter((b) => b.status === "pending")
            .length,
          todayConfirmed: todayBookings.filter((b) => b.status === "confirmed")
            .length,
        },
        payments: {
          pending: pendingPayments.length,
          pendingAmount,
        },
        revenue: {
          monthly: totalRevenue,
        },
      };
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      throw error;
    }
  }

  // ดึงข้อมูลการจองล่าสุด
  async getRecentBookings(limit = 5) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          booking_number,
          check_in_date,
          check_out_date,
          status,
          created_at,
          customer:customer_id (
            first_name,
            last_name
          ),
          room:room_id (
            room_number,
            room_type:room_type_id (name)
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((booking, index) => ({
        key: index,
        id: booking.booking_number,
        customer: booking.customer
          ? `${booking.customer.first_name} ${booking.customer.last_name}`
          : "ไม่ระบุ",
        room: booking.room
          ? `${booking.room.room_number} (${booking.room.room_type?.name})`
          : "ไม่ระบุ",
        checkIn: new Date(booking.check_in_date).toLocaleDateString("th-TH"),
        checkOut: new Date(booking.check_out_date).toLocaleDateString("th-TH"),
        status: booking.status,
        createdAt: booking.created_at,
      }));
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      throw error;
    }
  }

  // ดึงข้อมูลรายได้รายวัน (7 วันล่าสุด)
  async getDailyRevenue(days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);

      const { data, error } = await supabase
        .from("payments")
        .select("payment_date, amount")
        .eq("status", "confirmed")
        .gte("payment_date", startDate.toISOString())
        .lte("payment_date", endDate.toISOString())
        .order("payment_date", { ascending: true });

      if (error) throw error;

      // สร้างข้อมูลรายวัน
      const dailyData = [];
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        const dayRevenue = data
          .filter((payment) => payment.payment_date.startsWith(dateStr))
          .reduce((sum, payment) => sum + payment.amount, 0);

        dailyData.push({
          date: currentDate.toLocaleDateString("th-TH", {
            month: "short",
            day: "numeric",
          }),
          revenue: dayRevenue,
          fullDate: dateStr,
        });
      }

      return dailyData;
    } catch (error) {
      console.error("Error fetching daily revenue:", error);
      throw error;
    }
  }

  // ดึงข้อมูลการจองรายวัน (7 วันล่าสุด)
  async getDailyBookings(days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);

      const { data, error } = await supabase
        .from("bookings")
        .select("created_at, status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // สร้างข้อมูลรายวัน
      const dailyData = [];
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        const dayBookings = data.filter((booking) =>
          booking.created_at.startsWith(dateStr)
        );

        dailyData.push({
          date: currentDate.toLocaleDateString("th-TH", {
            month: "short",
            day: "numeric",
          }),
          bookings: dayBookings.length,
          confirmed: dayBookings.filter((b) => b.status === "confirmed").length,
          pending: dayBookings.filter((b) => b.status === "pending").length,
          fullDate: dateStr,
        });
      }

      return dailyData;
    } catch (error) {
      console.error("Error fetching daily bookings:", error);
      throw error;
    }
  }

  // ดึงข้อมูลการใช้งานห้องตามประเภท
  async getRoomTypeUsage() {
    try {
      const { data, error } = await supabase.from("room_types").select(`
          id,
          name,
          rooms:rooms(
            id,
            status,
            bookings:bookings(
              id,
              status,
              created_at
            )
          )
        `);

      if (error) throw error;

      return data.map((roomType) => {
        const totalRooms = roomType.rooms.length;
        const occupiedRooms = roomType.rooms.filter(
          (room) => room.status === "occupied"
        ).length;
        const totalBookings = roomType.rooms.reduce(
          (sum, room) => sum + (room.bookings ? room.bookings.length : 0),
          0
        );

        return {
          name: roomType.name,
          totalRooms,
          occupiedRooms,
          availableRooms: totalRooms - occupiedRooms,
          totalBookings,
          occupancyRate:
            totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        };
      });
    } catch (error) {
      console.error("Error fetching room type usage:", error);
      throw error;
    }
  }

  // ดึงการแจ้งเตือน
  async getNotifications() {
    try {
      const notifications = [];

      // ตรวจสอบการจองที่รอดำเนินการ
      const { data: pendingBookings, error: pendingError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          booking_number,
          created_at,
          customer:customer_id (first_name, last_name)
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (pendingError) throw pendingError;

      pendingBookings.forEach((booking) => {
        const createdTime = new Date(booking.created_at);
        const now = new Date();
        const hoursDiff = (now - createdTime) / (1000 * 60 * 60);

        notifications.push({
          id: `booking-${booking.id}`,
          type: hoursDiff > 24 ? "warning" : "info",
          title: "การจองใหม่",
          message: `${booking.booking_number} - ${booking.customer?.first_name} ${booking.customer?.last_name}`,
          time: createdTime,
          link: `/admin/bookings`,
        });
      });

      // ตรวจสอบการชำระเงินที่รอยืนยัน
      const { data: pendingPayments, error: paymentError } = await supabase
        .from("payments")
        .select(
          `
          id,
          amount,
          created_at,
          booking:booking_id (
            booking_number,
            customer:customer_id (first_name, last_name)
          )
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (paymentError) throw paymentError;

      pendingPayments.forEach((payment) => {
        const createdTime = new Date(payment.created_at);
        const now = new Date();
        const hoursDiff = (now - createdTime) / (1000 * 60 * 60);

        notifications.push({
          id: `payment-${payment.id}`,
          type: hoursDiff > 24 ? "warning" : "info",
          title: "การชำระเงินใหม่",
          message: `${
            payment.booking?.booking_number
          } - ${payment.amount.toLocaleString()} บาท`,
          time: createdTime,
          link: `/admin/payments`,
        });
      });

      // เรียงลำดับตามเวลา
      return notifications
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // ดึงข้อมูลห้องที่เช็คอิน/เช็คเอาท์วันนี้
  async getTodayCheckInOut() {
    try {
      const today = new Date().toISOString().split("T")[0];

      // เช็คอินวันนี้
      const { data: checkIns, error: checkInError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          booking_number,
          customer:customer_id (first_name, last_name),
          room:room_id (room_number, room_type:room_type_id (name))
        `
        )
        .eq("check_in_date", today)
        .eq("status", "confirmed");

      if (checkInError) throw checkInError;

      // เช็คเอาท์วันนี้
      const { data: checkOuts, error: checkOutError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          booking_number,
          customer:customer_id (first_name, last_name),
          room:room_id (room_number, room_type:room_type_id (name))
        `
        )
        .eq("check_out_date", today)
        .in("status", ["confirmed", "completed"]);

      if (checkOutError) throw checkOutError;

      return {
        checkIns: checkIns.map((booking) => ({
          id: booking.id,
          bookingNumber: booking.booking_number,
          customerName: booking.customer
            ? `${booking.customer.first_name} ${booking.customer.last_name}`
            : "ไม่ระบุ",
          room: booking.room
            ? `${booking.room.room_number} (${booking.room.room_type?.name})`
            : "ไม่ระบุ",
        })),
        checkOuts: checkOuts.map((booking) => ({
          id: booking.id,
          bookingNumber: booking.booking_number,
          customerName: booking.customer
            ? `${booking.customer.first_name} ${booking.customer.last_name}`
            : "ไม่ระบุ",
          room: booking.room
            ? `${booking.room.room_number} (${booking.room.room_type?.name})`
            : "ไม่ระบุ",
        })),
      };
    } catch (error) {
      console.error("Error fetching today check in/out:", error);
      throw error;
    }
  }
}

export default new DashboardService();
