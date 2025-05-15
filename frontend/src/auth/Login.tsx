import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "../utils/getAuth";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() =>{ 
    if(getAuth()){
        window.location.href = "/dashboard"
    }else{
        return
    }
}, [])


  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    // Dummy authentication logic (replace with backend API call)
    if (email === "admin@gmail.com" && password === "password") {
      sessionStorage.setItem("user", JSON.stringify({ email }));
      alert("Login Successful!");
      window.location.reload();
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center h-screen bg-gray-100"
    >
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-gray-700 text-center">Login</h2>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        
        <form className="mt-6" onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm">Email</label>
            <input 
              type="email" 
              className="w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-600 text-sm">Password</label>
            <input 
              type="password" 
              className="w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Login
          </motion.button>
        </form>
        
        <p className="text-center text-gray-500 text-sm mt-4">Don't have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a></p>
      </div>
    </motion.div>
  );
};

export default Login;


