import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import Carousel from "../components/Carousel";
import hero1 from "@/assets/hero1.png";
import hero2 from "@/assets/hero2.jpeg";
import hero3 from "@/assets/hero3.png";
import { useForgotPasswordMutation } from "../hooks/useAuth";

const slides = [
  {
    image: hero1,
    title: "Our Smart Solutions",
    description:
      "Our Smart Home Devices open up a world of endless possibilities. Dive into the extraordinary, where control and customization know no bounds.",
    stat: "500+",
    statLabel: "Clients",
  },
  {
    image: hero2,
    title: "Home Security Camera System",
    description:
      "Unlock the power of seamless control and vigilant monitoring with our Home Security System in Bangalore. Gain peace of mind knowing that your home is secure no matter where you are.",
    stat: "100+",
    statLabel: "Premium Security",
  },
  {
    image: hero3,
    title: "Our LED Solutions",
    description:
      "MAKc Automation's Smart LED lights for Home and innovative lighting solutions. Our commitment to providing exceptional lighting goes beyond mere illumination.",
    stat: "100%",
    statLabel: "Safety Assure",
  },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const isLoading = forgotPasswordMutation.isPending;

  const companyImage = useSelector((state) => state.company?.companyImage);

  const teal = "hsl(173.4, 80.4%, 40%)";
  const tealLight = "hsl(173.4, 80.4%, 95%)";
  const tealDark = "hsl(173.4, 80.4%, 28%)";

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !username.trim()) {
      toast.error("Please enter both username and email address.");
      return;
    }

    try {
      const res = await forgotPasswordMutation.mutateAsync({
        username,
        email,
      });

      if (res?.code === 200 || res?.status === true || res?.success) {
        toast.success(
          res?.message || "Password reset link sent to your email.",
        );
        setEmail("");
        setUserName("");
      } else {
        toast.error(res?.message || "Failed to send reset link.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const current = slides[slideIndex];

  const companyImageObj = companyImage?.find(
    (img) => img.image_for === "Company",
  );
  const baseUrl =
    companyImageObj?.image_url ||
    "https://makcautomations.com/crmapi/public/assets/images/company_images/";

  const noImageObj = companyImage?.find((img) => img.image_for === "No Image");
  const fallbackUrl =
    noImageObj?.image_url ||
    "https://makcautomations.com/crmapi/public/assets/images/no_image.jpg";

  const logoPath =
    useSelector((state) => state.company?.companyDetails?.company_logo) || "";

  const logoUrl = logoPath ? `${baseUrl}${logoPath}` : fallbackUrl;

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Carousel
        current={current}
        slideIndex={slideIndex}
        slides={slides}
        setSlideIndex={setSlideIndex}
      />
      
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 py-12 relative overflow-hidden"
        style={{ background: "hsl(173.4, 18%, 97%)" }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right, hsl(173.4,80.4%,40%,0.13) 0%, transparent 65%)",
          }}
        />

        <div
          className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at bottom left, hsl(173.4,80.4%,40%,0.10) 0%, transparent 65%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(173.4,50%,60%) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          className="max-w-sm w-full relative z-10 rounded-2xl px-8 py-10"
          style={{
            background: "#ffffff",
            boxShadow:
              "0 4px 6px hsl(173.4,40%,40%,0.04), 0 12px 40px hsl(173.4,40%,40%,0.10), 0 1px 2px hsl(173.4,40%,40%,0.06)",
            border: "1px solid hsl(173.4, 30%, 92%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 flex justify-center"
          >
            <img
              src={logoUrl}
              alt="MAKc Logo"
              className="h-16 w-auto object-contain"
            />
          </motion.div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Forgot Password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your username and email address to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              {/* Username Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  className="block text-xs font-semibold mb-2 tracking-wider uppercase"
                  style={{ color: "hsl(173.4,30%,40%)" }}
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                    style={{
                      background: "hsl(173.4,30%,97%)",
                      border: "1.5px solid hsl(173.4,30%,88%)",
                      color: "hsl(173.4,50%,12%)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = teal;
                      e.target.style.boxShadow = `0 0 0 3px hsl(173.4,80.4%,40%,0.12)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "hsl(173.4,30%,88%)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </motion.div>

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label
                  className="block text-xs font-semibold mb-2 tracking-wider uppercase"
                  style={{ color: "hsl(173.4,30%,40%)" }}
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                    style={{
                      background: "hsl(173.4,30%,97%)",
                      border: "1.5px solid hsl(173.4,30%,88%)",
                      color: "hsl(173.4,50%,12%)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = teal;
                      e.target.style.boxShadow = `0 0 0 3px hsl(173.4,80.4%,40%,0.12)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "hsl(173.4,30%,88%)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.015 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: isLoading
                      ? "hsl(173.4,80.4%,50%)"
                      : `linear-gradient(135deg, hsl(173.4,80.4%,40%) 0%, hsl(173.4,80.4%,32%) 100%)`,
                    color: "white",
                    boxShadow: isLoading
                      ? "none"
                      : "0 4px 20px hsl(173.4,80.4%,40%,0.35)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <Send size={14} />
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Login Redirect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-xs mt-2"
              >
                <span className="text-slate-500">Remember your password? </span>
                <Link
                  to="/"
                  className="font-semibold transition-all duration-200 flex items-center justify-center gap-1 mt-2"
                  style={{ color: teal }}
                  onMouseEnter={(e) => (e.target.style.color = tealDark)}
                  onMouseLeave={(e) => (e.target.style.color = teal)}
                >
                  <ArrowLeft size={12} />
                  Back to Login
                </Link>
              </motion.div>
            </div>
          </form>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-5 text-[11px]"
          style={{ color: "hsl(173.4, 25%, 58%)" }}
        >
          © 2026 AG Solutions — All Rights Reserved
        </motion.p>
      </motion.div>
    </div>
  );
}
