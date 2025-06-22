// src/services/customerService.js
import { supabase } from "../lib/supabase";

class CustomerService {
  // ค้นหาลูกค้าด้วยอีเมล
  async findCustomerByEmail(email) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // ไม่พบข้อมูล
          throw new Error("Customer not found");
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error finding customer by email:", error);
      throw error;
    }
  }

  // สร้างลูกค้าใหม่
  async createCustomer(customerData) {
    try {
      // ตรวจสอบว่าอีเมลซ้ำหรือไม่
      try {
        const existingCustomer = await this.findCustomerByEmail(
          customerData.email
        );
        if (existingCustomer) {
          return existingCustomer; // ถ้ามีแล้วให้คืนค่าข้อมูลเดิม
        }
      } catch (error) {
        // ถ้าไม่พบให้สร้างใหม่
      }

      const customer = {
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone || "",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("customers")
        .insert(customer)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  // อัปเดตข้อมูลลูกค้า
  async updateCustomer(customerId, updateData) {
    try {
      const customerData = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", customerId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  // ดึงข้อมูลลูกค้าทั้งหมด
  async getCustomers(filters = {}) {
    try {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      // ถ้ามี filter การค้นหา
      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  // ดึงข้อมูลลูกค้าตาม ID
  async getCustomerById(customerId) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  }

  // ลบลูกค้า
  async deleteCustomer(customerId) {
    try {
      // ตรวจสอบว่ามีการจองหรือไม่
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("id")
        .eq("customer_id", customerId);

      if (bookingError) throw bookingError;

      if (bookings && bookings.length > 0) {
        throw new Error("ไม่สามารถลบลูกค้าที่มีประวัติการจองได้");
      }

      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  // ดึงประวัติการจองของลูกค้า
  async getCustomerBookings(customerId) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
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
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching customer bookings:", error);
      throw error;
    }
  }

  // สถิติลูกค้า
  async getCustomerStats() {
    try {
      // ดึงจำนวนลูกค้าทั้งหมด
      const { data: totalCustomers, error: totalError } = await supabase
        .from("customers")
        .select("id", { count: "exact" });

      if (totalError) throw totalError;

      // ดึงลูกค้าใหม่ในเดือนนี้
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: newCustomers, error: newError } = await supabase
        .from("customers")
        .select("id", { count: "exact" })
        .gte("created_at", startOfMonth.toISOString());

      if (newError) throw newError;

      // ดึงลูกค้าที่มีการจองในเดือนนี้
      const { data: activeCustomers, error: activeError } = await supabase
        .from("bookings")
        .select("customer_id", { count: "exact" })
        .gte("created_at", startOfMonth.toISOString())
        .not("customer_id", "is", null);

      if (activeError) throw activeError;

      return {
        total: totalCustomers.length,
        newThisMonth: newCustomers.length,
        activeThisMonth: activeCustomers.length,
      };
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      throw error;
    }
  }

  // ค้นหาลูกค้าด้วยเบอร์โทร
  async findCustomerByPhone(phone) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Customer not found");
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error finding customer by phone:", error);
      throw error;
    }
  }

  // ค้นหาลูกค้าด้วยชื่อ
  async searchCustomers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
        )
        .order("first_name", { ascending: true })
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error searching customers:", error);
      throw error;
    }
  }

  // อัปเดตข้อมูลติดต่อ
  async updateCustomerContact(customerId, contactData) {
    try {
      const updateData = {
        email: contactData.email,
        phone: contactData.phone,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("customers")
        .update(updateData)
        .eq("id", customerId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error updating customer contact:", error);
      throw error;
    }
  }

  // ตรวจสอบความถูกต้องของข้อมูลลูกค้า
  validateCustomerData(customerData) {
    const errors = [];

    if (!customerData.first_name || customerData.first_name.trim() === "") {
      errors.push("กรุณากรอกชื่อ");
    }

    if (!customerData.last_name || customerData.last_name.trim() === "") {
      errors.push("กรุณากรอกนามสกุล");
    }

    if (!customerData.email || customerData.email.trim() === "") {
      errors.push("กรุณากรอกอีเมล");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        errors.push("รูปแบบอีเมลไม่ถูกต้อง");
      }
    }

    if (customerData.phone && customerData.phone.trim() !== "") {
      const phoneRegex = /^[0-9-+().\s]+$/;
      if (!phoneRegex.test(customerData.phone)) {
        errors.push("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new CustomerService();
