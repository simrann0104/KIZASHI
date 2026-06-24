import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="logo">

KIZASHI


<p>

Behavior Intelligence

</p>

</div>

            <NavLink to="/">
                <span>🏠</span>
                Overview
            </NavLink>

            <NavLink to="/daily-log">
                <span>📝</span>
                Daily Log
            </NavLink>

            <NavLink to="/analytics">
                <span>📊</span>
                Analytics
            </NavLink>

            <NavLink to="/history">
                <span>📚</span>
                History
            </NavLink>

            <NavLink to="/insights">
                <span>🤖</span>
                Insights
            </NavLink>

            <NavLink to="/account">
                <span>👤</span>
                Account
            </NavLink>

        </div>
    );
}

export default Sidebar;