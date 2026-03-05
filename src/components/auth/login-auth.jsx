import { LOGIN } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { setCredentials } from "@/store/auth/authSlice";
import { setCompanyDetails } from "@/store/auth/companySlice";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import LoginForm from "./login-form";
import { toast } from "sonner";
import Carousel from "./carousel";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    title: "Master Your Craft",
    description:
      "Unlock industry-leading courses built by experts who have spent decades in the field. Learn at your own pace, your own way.",
    stat: "50,000+",
    statLabel: "Active Learners",
  },
  {
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    title: "Knowledge That Moves You",
    description:
      "From foundational skills to advanced specializations — every program is designed to close the gap between where you are and where you want to be.",
    stat: "300+",
    statLabel: "Premium Courses",
  },
  {
    image:
      "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    title: "Built for Achievers",
    description:
      "Mac is where ambitious professionals come to grow. Join a community that takes learning seriously and careers personally.",
    stat: "98%",
    statLabel: "Completion Rate",
  },
];

export default function AuthUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const emailInputRef = useRef(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { trigger: login, loading: isLoading } = useApiMutation();
  const dispatch = useDispatch();

  const loadingMessages = [
    "Setting things up...",
    "Checking credentials...",
    "Preparing dashboard...",
    "Almost there...",
  ];

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both username and password.");
      return;
    }
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    try {
      const res = await login({
        url: LOGIN.postLogin,
        method: "post",
        data: formData,
      });
      if (res?.code === 200) {
        const { UserInfo, version, year } = res;
        if (!UserInfo || !UserInfo.token) {
          toast.error("Login Failed: No token received.");
          return;
        }
        dispatch(
          setCredentials({
            token: UserInfo.token,
            user: UserInfo.user,
            version: version?.version_panel,
            currentYear: year?.current_year,
            tokenExpireAt: UserInfo.token_expires_at,
          }),
        );
        dispatch(setCompanyDetails(res.company_details));
      } else {
        toast.error(res.message || "Login Failed: Unexpected response.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const current = slides[slideIndex];

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Carousel current={current} slideIndex={slideIndex} slides={slides} />
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
            className="mb-8"
          >
            <img
              src="https://aia.in.net/crm/public/assets/images/logo/new_retina_logos.webp"
              alt="MAC Logo"
              className="h-9 object-contain"
            />
          </motion.div>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            emailInputRef={emailInputRef}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-5 text-[11px]"
          style={{ color: "hsl(173.4, 25%, 58%)" }}
        >
          © 2026 AG Solutions — All Rights Reserved
        </motion.p>
      </motion.div>
    </div>
  );
}
