import React from "react";
import { getAuth } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { message, Menu, Button } from 'antd';
import TopNavigation from "../components/TopNavigation";

const HomePage = () => {
    const [email, setEmail] = React.useState("");
    const { state } = useLocation();
    const auth = getAuth();
    const navigate = useNavigate(); // Create a history object for navigation

    const handleSignInCheck = () => {
      navigate('/login');
    };

    React.useEffect(() => {
        if (state !== null) {
            setEmail(state.email);
        }
    }, [state]);

    return (
        <div style={{ backgroundColor: '#004080', minHeight: '100vh', color: 'white', fontSize: "20px"}}>
          <TopNavigation email={email}></TopNavigation>
          <div style={{ padding: '20px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: '70%',
              backgroundColor: '#001529',
              padding: '20px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <b>Welcome to Backlogging!</b>
              <br />
              <p>Do you have a lot of unorganized Video Games on a shelf?</p>
              <br />
              <p>Ever wanted to keep track of which games you have played and your personal ratings for those games?</p>
              <br />
              <p>This website will keep track of all your games!</p>
              <br />
              <p>What are you waiting for?</p>
              <Button type="primary" style={{ width: 'auto', height: 50, backgroundColor: '#e6f7ff', marginTop: '20px' }} onClick={handleSignInCheck}>
                <p style={{color: "black", fontSize: "24px"}}>Sign Up Now!</p>
              </Button>
            </div>
          </div>
        </div>
    )
}

export default HomePage;
