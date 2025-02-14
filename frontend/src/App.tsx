import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Player } from "./components/Player";
import { TestApp } from "./components/test";
import LandingPage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
// import SignUp from "./components/Signup";
// import SignIn from "./components/Signin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:id" element={<Player/>} />
        <Route path="/test/:id" element={<TestApp/>} />
        <Route path="/" element={<LandingPage/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/auth/signup" element={<SignUp/>} />
        <Route path="/auth/signin" element={<SignIn/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
