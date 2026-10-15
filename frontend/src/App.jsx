import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import CaseReport from "./pages/CaseReport";
import Evidence from "./pages/Evidence";
import Suspects from "./pages/Suspects";
import Clues from "./pages/Clues";
import Investigations from "./pages/Investigations";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import GlobalSearch from "./pages/GlobalSearch";
import NotFound from "./pages/NotFound";
import Timeline from "./pages/Timeline";
import CrimeScene from "./pages/CrimeScene";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import EvidenceGraph from "./pages/EvidenceGraph";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/cases"
            element={
              <DashboardLayout>
                <Cases />
              </DashboardLayout>
            }
          />

          <Route
            path="/cases/:id"
            element={
              <DashboardLayout>
                <CaseDetails />
              </DashboardLayout>
            }
          />

          <Route
            path="/cases/:id/report"
            element={
              <DashboardLayout>
                <CaseReport />
              </DashboardLayout>
            }
          />

          <Route
            path="/evidence"
            element={
              <DashboardLayout>
                <Evidence />
              </DashboardLayout>
            }
          />

          <Route
            path="/evidence-graph"
            element={
              <DashboardLayout>
                <EvidenceGraph />
              </DashboardLayout>
            }
          />
          <Route
  path="/crime-scene"
  element={
    <DashboardLayout>
      <CrimeScene />
    </DashboardLayout>
  }
/>

          <Route
            path="/suspects"
            element={
              <DashboardLayout>
                <Suspects />
              </DashboardLayout>
            }
          />

          <Route
            path="/clues"
            element={
              <DashboardLayout>
                <Clues />
              </DashboardLayout>
            }
          />

          <Route
            path="/timeline"
            element={
              <DashboardLayout>
                <Timeline />
              </DashboardLayout>
            }
          />

          <Route
            path="/notes"
            element={
              <DashboardLayout>
                <Notes />
              </DashboardLayout>
            }
          />

          <Route
            path="/investigations"
            element={
              <DashboardLayout>
                <Investigations />
              </DashboardLayout>
            }
          />

          <Route
            path="/tasks"
            element={
              <DashboardLayout>
                <Tasks />
              </DashboardLayout>
            }
          />

          <Route
            path="/notifications"
            element={
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            }
          />

          <Route
            path="/analytics"
            element={
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            }
          />

          <Route
            path="/search"
            element={
              <DashboardLayout>
                <GlobalSearch />
              </DashboardLayout>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;