import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import TopBar from "./TopBar";

import "./MainLayout.css";


export default function MainLayout() {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <TopBar />

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}