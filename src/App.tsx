import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import { initializeApp } from "firebase/app";
import { app } from "./config/config";
import { getAnalytics } from "firebase/analytics";
import SignUpForm from './pages/SignUpForm';
import DisplayGamePage from './pages/DisplayGame';
import DisplayGameSearch from './pages/DisplayGameSearch';
import DisplayGameList from './pages/DisplayGameList';
import DisplayGameByImagePage from './pages/DisplayGameByImage';


// Initialize Firebase
// const app = initializeApp(config.firebaseConfig);
const analytics = getAnalytics(app);

export interface IApplicationProps {}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
        path="/" 
        element={
            <HomePage />
        } 
        />
        <Route path="/login" element={<SignUpForm />} />
        {/* <Route path="/game-detail-random" element={<RandomDisplayGamePage />} /> */}
        <Route path="/game-search" element={<DisplayGameSearch />} />
        <Route path="/game-search-image" element={<DisplayGameByImagePage />} />
        <Route path="/game-detail" element={<DisplayGamePage />} />
        <Route path="/backlog" element={<DisplayGameList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;