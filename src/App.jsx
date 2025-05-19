// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import RoomListPage from "./pages/RoomListPage";
// import RoomDetailPage from "./pages/RoomDetailPage";
// import BookingPage from "./pages/BookingPage";
// import PaymentPage from "./pages/PaymentPage";
// import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRooms from "./pages/admin/Rooms";
import AdminBookings from "./pages/admin/Bookings";
import AdminPayments from "./pages/admin/Payments";
// import AdminPromotions from "./pages/admin/Promotions";
import AdminReports from "./pages/admin/Reports";
import AdminRoomTypes from './pages/admin/RoomTypes';
// import Header from "./components/layout/Header";
// import Footer from "./components/layout/Footer";

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า Frontend สำหรับลูกค้า */}
        {/* <Route
          path="/"
          element={
            <>
              <Header />
              <main className="flex-grow">
                <HomePage />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/rooms"
          element={
            <>
              <Header />
              <main className="flex-grow">
                <RoomListPage />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/rooms/:roomId"
          element={
            <>
              <Header />
              <main className="flex-grow">
                <RoomDetailPage />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/booking"
          element={
            <>
              <Header />
              <main className="flex-grow">
                <BookingPage />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <>
              <Header />
              <main className="flex-grow">
                <PaymentPage />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/confirmation/:bookingId"
          element={
            <>
              <Header />
              <main className="flex-grow">
                <BookingConfirmationPage />
              </main>
              <Footer />
            </>
          }
        /> */}

        {/* หน้า Backend สำหรับแอดมิน */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
           <Route path="room-types" element={<AdminRoomTypes />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          {/* <Route path="promotions" element={<AdminPromotions />} /> */}
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
