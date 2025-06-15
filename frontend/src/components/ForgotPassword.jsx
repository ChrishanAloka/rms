import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("https://rms-6one.onrender.com/api/auth/forgot-password", {
        email
      });

      setMessage(res.data.message);
      setLoading(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter registered email"
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        {message && <p className="mt-3">{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;