import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
></motion.div>
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function History() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/history/1")
      .then((res) => {
        setLogs(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/">
        <button>← Dashboard</button>
      </Link>

      <h1>History</h1>

      <pre>
        {JSON.stringify(logs, null, 2)}
      </pre>
    </div>
  );
}

export default History;