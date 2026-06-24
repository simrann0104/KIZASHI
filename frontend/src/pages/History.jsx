import { useEffect, useState } from "react";
import axios from "axios";

function History() {

const [logs,setLogs]=useState([]);


useEffect(()=>{

axios

.get("http://127.0.0.1:8000/history/1")

.then(res=>{

setLogs(res.data);

})

.catch(err=>{

console.log(err);

});

},[]);



return(

<div className="page-fade">



<div className="daily-header">

<h1>

📚 History

</h1>


<p>

Review your previous wellness logs

</p>


</div>




<div className="history-grid">


{

logs.map((log,index)=>(


<div

key={index}

className="history-card"

>


<h3>

📅 {log.date}

</h3>



<div className="history-details">


<p>

📚 Study Hours

<span>

{log.study_hours}

</span>

</p>



<p>

📱 Screen Time

<span>

{log.screen_time}

</span>

</p>



<p>

😊 Mood Score

<span>

{log.mood_score}/10

</span>

</p>



<p>

😴 Sleep Hours

<span>

{log.sleep_hours}

</span>

</p>



<p>

🎯 Tasks Completed

<span>

{log.tasks_completed}

</span>

</p>



</div>


</div>


))

}


</div>



</div>

);

}

export default History;