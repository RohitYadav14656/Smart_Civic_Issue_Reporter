import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    pincode: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "pincode" ? value.replace(/\D/g, "") : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.pincode || !form.password) {
      alert("All fields are required");
      return;
    }

    if (form.pincode.length !== 6) {
      alert("Pincode must be 6 digits");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:3050/munciplitysignup", form);

      console.log(res.data);
      alert("Signup successful!");

    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Signup</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={form.username}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="text"
          name="pincode"
          placeholder="Enter Pincode"
          value={form.pincode}
          maxLength={6}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Signup"}
        </button>
      </form>
    </div>
  );
}

export default Signup;