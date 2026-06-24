import { useState } from "react";
import axios from "axios";

function DailyLog() {

const [form, setForm] = useState({

user_id:1,

date:new Date().toISOString().split("T")[0],

study_hours:null,
screen_time:null,
focus_sessions:null,

mood_score:5,
stress_level:5,
motivation_level:5,

sleep_hours:null,
energy_level:5,

routine_score:null,

tasks_completed:null,
tasks_planned:null

});


const [prediction,setPrediction]=useState(null);



const handleChange=(e)=>{
  const { name, type, value } = e.target;
  const parsedValue = (type === "number" || type === "range")
    ? (value === "" ? "" : Number(value))
    : value;

  setForm({
    ...form,
    [name]: parsedValue,
  });
};



const submitLog=async()=>{

try{

await axios.post(

"http://127.0.0.1:8000/daily-log",

form

);


const pred=await axios.post(

"http://127.0.0.1:8000/predict",

form

);


setPrediction(pred.data);

alert(

"Daily Log Saved Successfully!"

);

}

catch(err){

console.log(err);

alert(

"Error Saving Log"

);

}

};

const getMoodEmoji = (value) => {

if(value<=2) return "😢";

if(value<=4) return "😕";

if(value<=6) return "😐";

if(value<=8) return "🙂";

return "😄";

};
return (

<div className="dailylog-container">

<div className="daily-header">

<h1>📝 Daily Check-In</h1>

<p>
Track today's habits and wellness
</p>

</div>



<div className="dailylog-card">


{/* Basic Metrics */}

<div className="section-card">

<h3>📅 Basic Metrics</h3>

<div className="dailylog-grid">

<input
type="date"
name="date"
value={form.date}
onChange={handleChange}
/>


<input
type="number"
name="study_hours"
placeholder="Study Hours"
min="0"
value={form.study_hours ?? ""}
onChange={handleChange}
/>


<input
type="number"
name="screen_time"
placeholder="Screen Time"
min="0"
value={form.screen_time ?? ""}
onChange={handleChange}
/>


<input
type="number"
name="focus_sessions"
placeholder="Focus Sessions"
min="0"
value={form.focus_sessions ?? ""}
onChange={handleChange}
/>

</div>

</div>




{/* Mental Wellness */}

<div className="section-card">

<h3>😊 Mental Wellness</h3>

<div className="dailylog-grid">


<div>

<div className="slider-header">
<label>Mood Score</label>

<span className="slider-value">
{getMoodEmoji(form.mood_score)}
{form.mood_score}

</span>

</div>

<input
type="range"
min="1"
max="10"
name="mood_score"
value={form.mood_score}
onChange={handleChange}
/>

</div>




<div>

<div className="slider-header">

<label>Stress Level</label>

<span className="slider-value">
{getMoodEmoji(form.stress_level)}
{form.stress_level}

</span>

</div>

<input
type="range"
min="1"
max="10"
name="stress_level"
value={form.stress_level}
onChange={handleChange}
/>

</div>





<div>

<div className="slider-header">

<label>Motivation</label>

<span className="slider-value">
{getMoodEmoji(form.motivation_level)}
{form.motivation_level}

</span>

</div>

<input
type="range"
min="1"
max="10"
name="motivation_level"
value={form.motivation_level}
onChange={handleChange}
/>

</div>





<div>

<div className="slider-header">

<label>Energy Level</label>

<span className="slider-value">
{getMoodEmoji(form.energy_level)}
{form.energy_level}

</span>

</div>

<input
type="range"
min="1"
max="10"
name="energy_level"
value={form.energy_level}
onChange={handleChange}
/>

</div>


</div>

</div>




{/* Lifestyle */}

<div className="section-card">

<h3>🌙 Lifestyle</h3>

<div className="dailylog-grid">


<input
type="number"
name="sleep_hours"

placeholder="Sleep Hours"
value={form.sleep_hours ?? ""}
onChange={handleChange}
/>



<input
type="number"
name="routine_score"
min = "0"
placeholder="Routine Score"
value={form.routine_score ?? ""}
onChange={handleChange}
/>

</div>

</div>





{/* Productivity */}

<div className="section-card">

<h3>🎯 Productivity</h3>

<div className="dailylog-grid">


<input
type="number"
name="tasks_completed"
placeholder="Tasks Completed"
min="0"
value={form.tasks_completed ?? ""}
onChange={handleChange}
/>



<input
type="number"
name="tasks_planned"
placeholder="Tasks Planned"
min="0"
value={form.tasks_planned ?? ""}
onChange={handleChange}
/>

</div>

</div>





<button

className="save-btn"

onClick={submitLog}

>

Save Daily Log & Predict

</button>

</div>




{prediction && (

<div className="prediction-card">

<h2>

🧠 Prediction Result

</h2>


<div className="prediction-grid">


<div className="pred-box">

<h4>Behavior Score</h4>

<h1>

{prediction.behavior_score}

</h1>

</div>



<div className="pred-box">

<h4>Risk Level</h4>

<h1>

{prediction.risk_level}

</h1>

</div>



<div className="pred-box">

<h4>BDI</h4>

<h1>

{prediction.BDI}

</h1>

</div>


</div>



<div style={{marginTop:"30px"}}>

<p>

💡 <b>Insight</b>

</p>

<p>

{prediction.insight}

</p>



<p style={{marginTop:"15px"}}>

🎯 <b>Recommendation</b>

</p>

<p>

{prediction.recommendation}

</p>


</div>


</div>

)}

</div>
);
}

export default DailyLog;
