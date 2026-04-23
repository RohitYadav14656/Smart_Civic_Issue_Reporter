import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Munciplity() {
  const [form, setForm] = useState({
    pincode: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.pincode || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:3050/munciplitylogin", {
        pincode: form.pincode,
        password: form.password
      });

      console.log("Login success:", res.data);

      // store token or user info (optional)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("pincode", form.pincode);

      alert("Login successful!");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <form onSubmit={handleSubmit}>
        {/* Pincode */}
        <input
          type="text"
          name="pincode"
          placeholder="Enter Pincode"
          value={form.pincode}
          onChange={handleChange}
          maxLength={6}
        />
        <br /><br />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Munciplity;