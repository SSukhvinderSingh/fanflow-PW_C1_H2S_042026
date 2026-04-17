import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/map", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-brand flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        <h1 className="text-4xl font-bold text-brand mb-2">FanFlow</h1>
        <p className="text-gray-500 mb-8 font-medium">Every moment, seamlessly yours.</p>
        <button
          onClick={signInWithGoogle}
          className="w-full bg-brand text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-brand/50"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
