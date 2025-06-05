"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "signin" | "signup";
  }>({ isOpen: false, mode: "signin" });
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Add slight delay for smoother transition
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    };
    checkUser();
  }, [router]);

  const handleSignUp = () => {
    setAuthModal({ isOpen: true, mode: "signup" });
  };

  const handleSignIn = () => {
    setAuthModal({ isOpen: true, mode: "signin" });
  };

  const handleAuthSuccess = () => {
    setAuthModal({ isOpen: false, mode: "signin" });
    // Add slight delay for smoother transition
    setTimeout(() => {
      router.push("/dashboard");
    }, 100);
  };

  const handleCloseModal = () => {
    setAuthModal({ isOpen: false, mode: "signin" });
  };

  return (
    <>
      <Hero onSignUp={handleSignUp} onSignIn={handleSignIn} />
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseModal}
        mode={authModal.mode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
