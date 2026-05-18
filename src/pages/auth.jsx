import React from "react";
import AuthScreen from "@/components/screens/auth/auth";
import Head from "next/head";

const AuthPage = () => {
  return (
    <>
      <Head>
        <title>Login / Sign Up | TNature</title>
        <meta name="description" content="Login or create an account with TNature to enjoy a natural shopping experience." />
      </Head>
      <AuthScreen />
    </>
  );
};

export default AuthPage;
