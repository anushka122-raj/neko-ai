import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Focus from "./pages/Focus";
import Alarm from "./pages/Alarm";
import AlarmRing from "./pages/AlarmRing";
import Habits from "./pages/Habits";
import Chat from "./pages/Chat/Chat";
import MemoryPage from "./pages/MemoryPage";
import PetWindow from "./pages/PetWindow";
import PetTest from "./pages/PetTest";

import JournalPage from "./pages/Journal/JournalPage";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Main application pages */}
      <Route element={<MainLayout />}>

        <Route index element={<Dashboard />} />

        <Route path="tasks" element={<Tasks />} />

        <Route path="focus" element={<Focus />} />

        <Route path="alarms" element={<Alarm />} />

        <Route path="habits" element={<Habits />} />

        <Route path="chat" element={<Chat />} />

        <Route path="memories" element={<MemoryPage />} />

        <Route path="journal" element={<JournalPage />} />

        <Route path="pet-test" element={<PetTest />} />

      </Route>

      {/* Separate pet window */}
      <Route
        path="pet"
        element={<PetWindow />}
      />

      {/* Alarm ringing screen */}
      <Route
        path="alarm-ring"
        element={<AlarmRing />}
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}