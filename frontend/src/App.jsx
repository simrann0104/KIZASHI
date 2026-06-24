import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import DailyLog from "./pages/DailyLog";
import History from "./pages/History";
import Predictions from "./pages/Predictions";
import Analytics from "./pages/Analytics";
import Insights from "./pages/Insights";
import Account from "./pages/Account";

import "./App.css";

function App() {

return (

<BrowserRouter>

<div className="app-container">

<Sidebar />

<div className="main-content">

<Routes>

<Route path="/" element={<Dashboard />} />

<Route
path="/daily-log"
element={<DailyLog />}
/>
<Route path="/history" element={<History />} />

<Route path="/predictions" element={<Predictions />} />

<Route path="/analytics" element={<Analytics />} />

<Route path="/insights" element={<Insights />} />

<Route path="/account" element={<Account />} />

</Routes>

</div>

</div>

</BrowserRouter>

);

}

export default App;