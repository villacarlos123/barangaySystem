import { Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import OfficialPage from "./pages/Officials";
import ResidentsDashboard from "./pages/Residents";
import Document from "./pages/Document";

import Login from "./auth/Login";



const App = () => {


return(
        
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/officials" element={<OfficialPage />} />
        <Route path="/residents" element={<ResidentsDashboard />} />
        <Route path="/documents request" element={<Document />} />

    </Routes>
)

}

export default App