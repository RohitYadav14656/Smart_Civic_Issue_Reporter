import { useEffect, useState } from "react";
import {useNavigate } from 'react-router-dom';

function Admin() {
  const [data, setData] = useState([]);
  const [issue,setIssue]=useState("pending...");
  const navigate=useNavigate()

  useEffect(() => {
    fetch("http://localhost:3050/data")
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setData(result);
      })
      .catch((err) => console.log(err));
  }, []);
  const allow=async()=>{
    alert("access allowed")
    setIssue("approved")
  }
  const deny=async(id)=>{
    setIssue("denied")
     try {
    await fetch(`http://localhost:3050/delete/${id}`, {
      method: "DELETE",
    });

    // remove item from UI without reloading
    setData((prev) => prev.filter((item) => item._id !== id));
  } catch (err) {
    console.log(err);
  }
  }

  return (
    <div>
      <button onClick={() => navigate("/signup")}>Signup for munciplity</button>
      <h1>Uploaded Data</h1>

      {data.map((item) => (
        <div key={item._id}>
          <h3>{item.name}</h3>
          <p>{item.address}</p>
          <p>{item.pincode}</p>
          <img src={item.imageUrl} alt="uploaded" width="200" />
          <button onClick={()=>allow(item._id)}>Allow</button>
          <button onClick={()=>deny(item._id)}>Deny</button>
        </div>
      ))}
    </div>
  );
}

export default Admin;