import React, { useState } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    image: null
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // handle text + file input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });

      // preview image
      setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image || !form.name || !form.address) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", form.name);
      data.append("address", form.address);
      data.append("image", form.image);

      const res = await axios.post(
        "http://localhost:3050/upload",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("Response:", res.data);

      alert("Upload successful!");

      // reset form
      setForm({ name: "", address: "", image: null });
      setPreview(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Image</h2>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={form.name}
          onChange={handleChange}
        />
        <br /><br />

        {/* Address */}
        <input
          type="text"
          name="address"
          placeholder="Enter address"
          value={form.address}
          onChange={handleChange}
        />
        <br /><br />

        {/* Image */}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        <br /><br />

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            width="200"
            style={{ marginBottom: "10px" }}
          />
        )}

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}

export default App;