// import { motion } from "framer-motion";
// import { Eye, EyeOff, LogIn } from "lucide-react";
// import { Button } from "../ui/button";

// export default function LoginForm({
//   email,
//   setEmail,
//   password,
//   setPassword,
//   showPassword,
//   setShowPassword,
//   emailInputRef,
//   handleSubmit,
//   isLoading,
//   loadingMessage,
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.6, delay: 0.2 }}
//       className="lg:col-span-2 p-8 md:p-12 flex flex-col justify-center bg-white to-transparent"
//     >
//       <div className="flex items-center gap-1 p-2 rounded-md mb-8 ">
//         <img
//           src="https://aia.in.net/crm/public/assets/images/logo/new_retina_logos.webp"
//           alt="AIA Logo"
//         />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5 }}
//       >
//         <h1 className="text-4xl md:text-5xl font-bold text-dark mb-2">
//           Welcome back
//         </h1>
//         <p className="text-dark/20 text-lg mb-10">
//           Continue your certification journey with AIA
//         </p>
//       </motion.div>
//       <form onSubmit={handleSubmit}>
//         <div className="space-y-5">
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//           >
//             <label className="block text-sm font-medium text-dark mb-2">
//               Username
//             </label>
//             <motion.input
//               ref={emailInputRef}
//               type="text"
//               placeholder="Enter your username"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-dark text-dark placeholder-dark focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
//               whileFocus={{ scale: 1.02 }}
//             />
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.7 }}
//           >
//             <label className="block text-sm font-medium text-dark mb-2">
//               Password
//             </label>
//             <div className="relative group">
//               <motion.input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-dark text-dark placeholder-dark focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
//                 whileFocus={{ scale: 1.02 }}
//               />
//               <motion.button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-[12px] text-blue-300 transition-colors p-1"
//                 whileHover={{ scale: 1.15 }}
//                 whileTap={{ scale: 0.9 }}
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </motion.button>
//             </div>
//           </motion.div>

//           <Button className="w-full py-3" type="submit" disabled={isLoading}>
//             {isLoading ? (
//               <motion.span
//                 key={loadingMessage}
//                 initial={{ opacity: 0, y: 5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -5 }}
//               >
//                 {loadingMessage}
//               </motion.span>
//             ) : (
//               <>
//                 <LogIn size={18} />
//                 Sign In
//               </>
//             )}
//           </Button>
//         </div>
//       </form>
//     </motion.div>
//   );
// }
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  emailInputRef,
  handleSubmit,
  isLoading,
  loadingMessage,
}) {
  const teal = "hsl(173.4, 80.4%, 40%)";
  const tealLight = "hsl(173.4, 80.4%, 95%)";
  const tealDark = "hsl(173.4, 80.4%, 28%)";

  return (
    <div>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h1
          className="text-3xl font-bold mb-1.5"
          style={{ color: "hsl(173.4,50%,12%)", letterSpacing: "-0.02em" }}
        >
          Welcome back
        </h1>

      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Username */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label
              className="block text-xs font-semibold mb-2 tracking-wider uppercase"
              style={{ color: "hsl(173.4,30%,40%)" }}
            >
              Username
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="text"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label
              className="block text-xs font-semibold mb-2 tracking-wider uppercase"
              style={{ color: "hsl(173.4,30%,40%)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all duration-200 outline-none"
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                style={{ color: "hsl(173.4,40%,55%)" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Forgot password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end"
          >
            <button
              type="button"
              className="text-xs font-medium transition-colors"
              style={{ color: teal }}
              onMouseEnter={(e) => (e.target.style.color = tealDark)}
              onMouseLeave={(e) => (e.target.style.color = teal)}
            >
              Forgot password?
            </button>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
                  <motion.span
                    key={loadingMessage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {loadingMessage}
                  </motion.span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </form>



      
    </div>
  );
}
