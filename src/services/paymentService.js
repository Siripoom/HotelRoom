// src/services/paymentService.js
import { supabase } from "../lib/supabase";
import { uploadImage, deleteImage } from "../utils/storageUtils";

class PaymentService {
  async getUnpaidBookings() {
    try {
      // ดึงการจองที่ status = pending ก่อน
      const { data: pendingBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          total_price,
          check_in_date,
          check_out_date,
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
        .eq("status", "pending");

      if (bookingsError) throw bookingsError;

      // ดึงรายการ booking_id ที่มีการชำระเงินยืนยันแล้ว
      const { data: confirmedPayments, error: paymentsError } = await supabase
        .from("payments")
        .select("booking_id")
        .eq("status", "confirmed");

      if (paymentsError) throw paymentsError;

      // สร้าง Set ของ booking_id ที่ชำระเงินแล้ว
      const paidBookingIds = new Set(
        confirmedPayments.map((payment) => payment.booking_id)
      );

      // กรองเฉพาะการจองที่ยังไม่ชำระเงิน
      const unpaidBookings = pendingBookings.filter(
        (booking) => !paidBookingIds.has(booking.id)
      );

      // เพิ่ม booking_number สำหรับแสดงผล
      const bookingsWithNumbers = unpaidBookings.map((booking) => ({
        ...booking,
        booking_number: this.generateDisplayBookingNumber(
          booking.id,
          booking.created_at
        ),
      }));

      return bookingsWithNumbers;
    } catch (error) {
      console.error("Error fetching unpaid bookings:", error);
      throw error;
    }
  }

  // สร้างหมายเลขการจองสำหรับแสดงผล
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

  // ดึงข้อมูลการชำระเงินตาม ID
  async getPaymentById(paymentId) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          booking:booking_id (
            id,
            booking_number,
            check_in_date,
            check_out_date,
            total_price,
            status as booking_status,
            special_requests,
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
          )
        `
        )
        .eq("id", paymentId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  }

  // สร้างการชำระเงินใหม่
  async createPayment(paymentData, slipFile = null) {
    try {
      let slipImageUrl = null;

      // อัปโหลดสลิปการโอนเงิน (ถ้ามี)
      if (slipFile) {
        slipImageUrl = await uploadImage(slipFile, "payment-slips");
        if (!slipImageUrl) {
          throw new Error("ไม่สามารถอัปโหลดสลิปการโอนเงินได้");
        }
      }

      const payment = {
        booking_id: paymentData.booking_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date || new Date().toISOString(),
        slip_image_url: slipImageUrl,
        reference_number: paymentData.reference_number || "",
        notes: paymentData.notes || "",
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  // อัปเดตสถานะการชำระเงิน
  async updatePaymentStatus(paymentId, status, notes = "") {
    try {
      const { data, error } = await supabase
        .from("payments")
        .update({
          status,
          notes,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .select(
          `
          *,
          booking:booking_id (
            id,
            status as booking_status
          )
        `
        )
        .single();

      if (error) throw error;

      // ถ้ายืนยันการชำระเงิน ให้อัปเดตสถานะการจองเป็น confirmed
      if (status === "confirmed") {
        await this.updateBookingStatus(data.booking_id, "confirmed");
      }

      // ถ้าปฏิเสธการชำระเงิน และการจองยังเป็น pending ให้เปลี่ยนเป็น cancelled
      if (status === "rejected" && data.booking?.booking_status === "pending") {
        await this.updateBookingStatus(data.booking_id, "cancelled");
      }

      return data;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }

  // อัปเดตการชำระเงิน
  async updatePayment(paymentId, updateData, newSlipFile = null) {
    try {
      // ดึงข้อมูลการชำระเงินเดิม
      const existingPayment = await this.getPaymentById(paymentId);

      let slipImageUrl = existingPayment.slip_image_url;

      // ถ้ามีไฟล์สลิปใหม่
      if (newSlipFile) {
        // ลบไฟล์เก่า (ถ้ามี)
        if (existingPayment.slip_image_url) {
          await deleteImage(existingPayment.slip_image_url);
        }

        // อัปโหลดไฟล์ใหม่
        slipImageUrl = await uploadImage(newSlipFile, "payment-slips");
        if (!slipImageUrl) {
          throw new Error("ไม่สามารถอัปโหลดสลิปการโอนเงินได้");
        }
      }

      const paymentData = {
        ...updateData,
        slip_image_url: slipImageUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("payments")
        .update(paymentData)
        .eq("id", paymentId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  }

  // ลบการชำระเงิน
  async deletePayment(paymentId) {
    try {
      // ดึงข้อมูลการชำระเงินก่อนลบ
      const payment = await this.getPaymentById(paymentId);

      // ลบไฟล์สลิป (ถ้ามี)
      if (payment.slip_image_url) {
        await deleteImage(payment.slip_image_url);
      }

      // ลบการชำระเงิน
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  }

  // อัปเดตสถานะการจอง
  async updateBookingStatus(bookingId, status) {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }

  // ดึงรายการการจองที่ยังไม่มีการชำระเงิน
  // async getUnpaidBookings() {
  //   try {
  //     const { data, error } = await supabase
  //       .from("bookings")
  //       .select(
  //         `
  //         id,
  //         booking_number,
  //         total_price,
  //         check_in_date,
  //         check_out_date,
  //         customer:customer_id (
  //           first_name,
  //           last_name
  //         ),
  //         room:room_id (
  //           room_number,
  //           room_type:room_type_id (name)
  //         )
  //       `
  //       )
  //       .eq("status", "pending")
  //       .not(
  //         "id",
  //         "in",
  //         `(SELECT booking_id FROM payments WHERE status = 'confirmed')`
  //       );

  //     if (error) throw error;

  //     return data || [];
  //   } catch (error) {
  //     console.error("Error fetching unpaid bookings:", error);
  //     throw error;
  //   }
  // }

  // ดึงสถิติการชำระเงิน
  async getPaymentStats(startDate, endDate) {
    try {
      let query = supabase
        .from("payments")
        .select("status, amount, payment_method");

      if (startDate && endDate) {
        query = query
          .gte("payment_date", startDate)
          .lte("payment_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter((p) => p.status === "pending").length,
        confirmed: data.filter((p) => p.status === "confirmed").length,
        rejected: data.filter((p) => p.status === "rejected").length,
        totalAmount: data
          .filter((p) => p.status === "confirmed")
          .reduce((sum, payment) => sum + payment.amount, 0),
        pendingAmount: data
          .filter((p) => p.status === "pending")
          .reduce((sum, payment) => sum + payment.amount, 0),
        methodBreakdown: {
          bank_transfer: data.filter(
            (p) => p.payment_method === "bank_transfer"
          ).length,
          credit_card: data.filter((p) => p.payment_method === "credit_card")
            .length,
          promptpay: data.filter((p) => p.payment_method === "promptpay")
            .length,
          cash: data.filter((p) => p.payment_method === "cash").length,
        },
      };

      return stats;
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      throw error;
    }
  }

  // ส่งการแจ้งเตือน (mock function)
  async sendPaymentNotification(paymentId, type) {
    try {
      // ในโปรเจคจริงอาจจะส่งอีเมลหรือ SMS
      console.log(`Sending ${type} notification for payment ${paymentId}`);

      // จำลองการส่งการแจ้งเตือน
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  // ตรวจสอบการชำระเงินที่ค้างชำระ
  async getOverduePayments(days = 3) {
    try {
      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - days);

      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          booking:booking_id (
            booking_number,
            customer:customer_id (
              first_name,
              last_name,
              email
            )
          )
        `
        )
        .eq("status", "pending")
        .lt("created_at", overdueDate.toISOString());

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching overdue payments:", error);
      throw error;
    }
  }

  // สร้างรายงานการชำระเงิน
  async generatePaymentReport(startDate, endDate, groupBy = "day") {
    try {
      let query = supabase
        .from("payments")
        .select("payment_date, amount, status, payment_method")
        .eq("status", "confirmed");

      if (startDate && endDate) {
        query = query
          .gte("payment_date", startDate)
          .lte("payment_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // จัดกลุ่มข้อมูลตาม groupBy
      const groupedData = {};

      data.forEach((payment) => {
        const date = new Date(payment.payment_date);
        let key;

        switch (groupBy) {
          case "day":
            key = date.toISOString().split("T")[0];
            break;
          case "month":
            key = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            break;
          case "year":
            key = date.getFullYear().toString();
            break;
          default:
            key = date.toISOString().split("T")[0];
        }

        if (!groupedData[key]) {
          groupedData[key] = {
            date: key,
            amount: 0,
            count: 0,
            methods: {},
          };
        }

        groupedData[key].amount += payment.amount;
        groupedData[key].count += 1;

        if (!groupedData[key].methods[payment.payment_method]) {
          groupedData[key].methods[payment.payment_method] = 0;
        }
        groupedData[key].methods[payment.payment_method] += 1;
      });

      return Object.values(groupedData).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    } catch (error) {
      console.error("Error generating payment report:", error);
      throw error;
    }
  }
}

export default new PaymentService();
