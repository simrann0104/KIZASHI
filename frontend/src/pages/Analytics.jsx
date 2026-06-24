import { useEffect, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function Analytics() {

const [predictions,setPredictions]=useState([]);
const [history,setHistory]=useState([]);
const [dashboard,setDashboard]=useState(null);


useEffect(()=>{

axios
.get("http://127.0.0.1:8000/predictions/1")
.then(res=>setPredictions(res.data))
.catch(err=>console.log(err));


axios
.get("http://127.0.0.1:8000/history/1")
.then(res=>setHistory(res.data))
.catch(err=>console.log(err));


axios
.get("http://127.0.0.1:8000/dashboard/1")
.then(res=>setDashboard(res.data))
.catch(err=>console.log(err));

},[]);



const latestPrediction=

predictions.length>0

? predictions[predictions.length-1]

: null;



const riskCounts={

Low:0,

Moderate:0,

High:0

};



predictions.forEach(p=>{

if(

riskCounts[p.risk_level]!==undefined

){

riskCounts[p.risk_level]++;

}

});



const riskData=[

{

risk:"Low",

count:riskCounts.Low

},

{

risk:"Moderate",

count:riskCounts.Moderate

},

{

risk:"High",

count:riskCounts.High

}

];



const getRiskColor=(risk)=>{

if(risk==="Low")

return "#22c55e";


if(risk==="Moderate")

return "#f59e0b";


if(risk==="High")

return "#ef4444";


return "#ffffff";

};



return(

<div className="page-fade">

<div className="daily-header">

<h1>

📊 Analytics

</h1>

<p>

Behavior analysis over the last 30 days

</p>

</div>




{dashboard && (


<div className="dashboard-cards">



<div className="glass-card">

<h3>

📚 Total Logs

</h3>

<h1>

{dashboard.total_logs}

</h1>

</div>





<div className="glass-card">

<h3>

⭐ Behavior Score

</h3>

<h1>

{Math.max(

0,

Math.min(

100,

Math.round(

(1-dashboard.latest_bdi)*100

)

)

)}

</h1>

</div>





<div className="glass-card">

<h3>

⚠️ Risk

</h3>


<h1

style={{

color:getRiskColor(

dashboard.latest_risk

)

}}

>

{dashboard.latest_risk}

</h1>


</div>





<div className="glass-card">

<h3>

🔥 Streak

</h3>


<h1>

{dashboard.total_logs}

</h1>

</div>



</div>

)}





{latestPrediction && (


<div className="insight-card">


<h2 className="summary-title">

<span>🧠</span>

Behavior Summary

</h2>


<div className="insight-grid">



<div>

<h4>

Insight

</h4>


<p>

{latestPrediction.insight}

</p>

</div>




<div>

<h4>

Recommendation

</h4>


<p>

{latestPrediction.recommendation}

</p>

</div>




<div>

<h4>

Trend

</h4>


<p>

▲ Improving

</p>

</div>




<div>

<h4>

Consistency

</h4>


<p>

84%

</p>

</div>



</div>


</div>

)}








<div className="chart-grid">





<div className="chart-card">


<h3>

📉 BDI Trend

</h3>


<ResponsiveContainer
width="100%"
height={260}
>


<LineChart

data={predictions}

>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="prediction_date"/>

<YAxis/>

<Tooltip/>


<Line

stroke="#6366f1"

strokeWidth={3}

dot={false}

dataKey="bdi"

/>



</LineChart>


</ResponsiveContainer>


</div>








<div className="chart-card">


<h3>

📊 Risk Distribution

</h3>


<ResponsiveContainer
width="100%"
height={260}
>


<BarChart

data={riskData}

>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="risk"/>

<YAxis/>

<Tooltip/>


<Bar

fill="#8b5cf6"

dataKey="count"

/>



</BarChart>


</ResponsiveContainer>


</div>








<div className="chart-card">


<h3>

📚 Study Trend

</h3>


<ResponsiveContainer
width="100%"
height={260}
>


<LineChart

data={history}

>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="date"/>

<YAxis/>

<Tooltip/>


<Line

stroke="#3b82f6"

dataKey="study_hours"

/>



</LineChart>


</ResponsiveContainer>


</div>








<div className="chart-card">


<h3>

😊 Mood Trend

</h3>


<ResponsiveContainer
width="100%"
height={260}
>


<LineChart

data={history}

>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="date"/>

<YAxis/>

<Tooltip/>


<Line

stroke="#22c55e"

dataKey="mood_score"

/>



</LineChart>


</ResponsiveContainer>


</div>



</div>



</div>

);


}

export default Analytics;