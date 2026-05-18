import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import styles from "./AdminLayout.module.scss";
import { House, BoxSeam, Tags, ReceiptCutoff, BoxArrowRight, People, List } from "react-bootstrap-icons";

const AdminLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <House size={20} /> },
    { name: "Orders", path: "/orders", icon: <ReceiptCutoff size={20} /> },
    { name: "Products", path: "/products", icon: <BoxSeam size={20} /> },
    { name: "Categories", path: "/categories", icon: <Tags size={20} /> },
    { name: "Customers", path: "/customers", icon: <People size={20} /> },
  ];

  return (
    <div className={styles.adminLayout}>
      {isSidebarOpen && <div className={styles.overlay} onClick={closeSidebar}></div>}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>TNature Admin</div>
        <nav className={styles.navLinks}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={router.pathname === item.path ? styles.active : ""}
              onClick={closeSidebar}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <small>Admin Panel v1.0</small>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.pageTitle}>
            <button className={styles.menuToggle} onClick={toggleSidebar} aria-label="Toggle Menu">
              <List size={26} />
            </button>
            <h3>{navItems.find(item => item.path === router.pathname)?.name || "Dashboard"}</h3>
          </div>
          <div className={styles.userInfo}>
            {user && <span>Welcome, {user.email}</span>}
            <button onClick={handleLogout} title="Logout">
              <BoxArrowRight size={20} />
            </button>
          </div>
        </header>

        <section className={styles.contentArea}>
          {children}
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
