import "../styles/globals.scss";
import { useEffect, useState } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Router, { useRouter } from "next/router";
import Head from "next/head";

import { ToastContainer } from "react-toastify";
import AdminLayout from "@/components/layout/AdminLayout";
import { FONTS } from "@/styles/fonts";
import LoadingScreen from "@/components/ui/loading_screen/loading_screen";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && router.pathname !== "/auth") {
      router.push("/auth");
    }
  }, [user, loading, router.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user && router.pathname !== "/auth") {
    return <LoadingScreen />;
  }

  if (router.pathname === "/auth") {
    return children;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default function App({ Component, pageProps }) {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    });

    Router.events.on("routeChangeStart", (...params) => {
      NProgress.start(params);
    });
    Router.events.on("routeChangeComplete", NProgress.done);
    Router.events.on("routeChangeError", NProgress.done);
    return () => {
      Router.events.off("routeChangeStart", NProgress.start);
      Router.events.off("routeChangeComplete", NProgress.done);
      Router.events.off("routeChangeError", NProgress.done);
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TNature Admin</title>
      </Head>

      <main className={FONTS.font1}>
        <AuthProvider>
          <DataProvider>
            <AppProvider>
              <ProtectedRoute>
                <Component {...pageProps} />
                <ToastContainer position="bottom-right" />
              </ProtectedRoute>
            </AppProvider>
          </DataProvider>
        </AuthProvider>
      </main>
    </>
  );
}
