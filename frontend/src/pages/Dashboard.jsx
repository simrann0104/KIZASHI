import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

const [data, setData] = useState(null);

useEffect(() => {

axios
.get("http://127.0.0.1:8000/dashboard/1")
.then((res) => {

setData(res.data);

})
.catch((err) => {

console.error(err);

});

}, []);


if (!data) {

return <h2>Loading...</h2>;

}


const getRiskColor = (risk) => {

if (risk === "Low") return "#22c55e";

if (risk === "Moderate") return "#f59e0b";

if (risk === "High") return "#ef4444";

return "#ffffff";

};



const score = Math.max(

0,

Math.min(

100,

Math.round((1 - data.latest_bdi) * 100)

)

);



return (

<>


{/* Hero */}

<div className="hero fade1">


<div>

<h1>

Welcome Back, Simran 👋

</h1>


<p>

Current Risk :

<b

style={{

color:getRiskColor(

data.latest_risk

),

marginLeft:"8px"

}}

>

{data.latest_risk}

</b>

</p>



<div className="hero-badge">

🔥 {data.streak} Day Streak
</div>



</div>




<div className="score-wrapper">


<div className="score-box">

{score}%

</div>


<p>

Behavior Score

</p>


</div>


</div>






{/* Dashboard Content */}

<div className="dashboard-body">


{/* Cards */}

<div className="dashboard-cards fade2">



<div className="glass-card">

<h3>

📚 Total Logs

</h3>

<h1>

{data.total_logs}

</h1>

</div>





<div className="glass-card">

<h3>

📉 Latest BDI

</h3>

<h1>

{Math.round(

data.latest_bdi*100

)}

</h1>

</div>





<div className="glass-card">

<h3>

⚠️ Risk Level

</h3>


<h1

style={{

color:getRiskColor(

data.latest_risk

)

}}

>

{data.latest_risk}

</h1>

</div>



</div>





{/* Recommendation */}

<div className="recommendation-card fade3">


<h2>

🧠 AI Recommendation

</h2>



<p

style={{

marginTop:"15px",

fontSize:"17px",

lineHeight:"28px",

color:"#cbd5e1"

}}

>

{data.recommendation}

</p>



</div>





{/* Insight */}

<div className="insight-card fade4">

<h2>📈 Weekly Insight</h2>

<p>📚 Study habits remain consistent</p>

<p>😴 Sleep patterns appear stable</p>

<p>☕ Short breaks seem to help focus</p>

</div>





{/* Buttons */}

<div className="dashboard-actions fade5">


<Link to="/daily-log">

<button>

📝 Check-In

</button>

</Link>




<Link to="/history">

<button>

📚 History

</button>

</Link>




<Link to="/predictions">

<button>

🤖 Predictions

</button>

</Link>




<Link to="/analytics">

<button>

📊 Analytics

</button>

</Link>



</div>



</div>


</>

);

}

export default Dashboard;