
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";

import Overview from "./pages/Overview";
import Revenue from "./pages/Revenue";
import Retention from "./pages/Retention";
import Growth from "./pages/Growth";
import Customers from "./pages/Customers";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/retention" element={<Retention />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/customers" element={<Customers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
