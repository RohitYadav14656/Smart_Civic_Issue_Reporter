import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);

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
  }
  const deny=async(id)=>{
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
      <h1>Uploaded Data</h1>

      {data.map((item) => (
        <div key={item._id}>
          <h3>{item.name}</h3>
          <p>{item.address}</p>
          <img src={item.imageUrl} alt="uploaded" width="200" />
          <button onClick={()=>allow(item._id)}>Allow</button>
          <button onClick={()=>deny(item._id)}>Deny</button>
        </div>
      ))}
    </div>
  );
}

export default App;