
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Predictions() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/predictions/1")
      .then((res) => {
        setPredictions(res.data);
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

      <h1>KIZASHI Predictions</h1>

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>BDI</th>
            <th>Risk Level</th>
            <th>Prediction</th>
            <th>Insight</th>
          </tr>
        </thead>

        <tbody>
          {predictions.map((prediction) => (
            <tr key={prediction.id}>
              <td>{prediction.prediction_date}</td>
              <td>{prediction.bdi}</td>
              <td>{prediction.risk_level}</td>
              <td>{prediction.ml_prediction}</td>
              <td>{prediction.insight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Predictions;