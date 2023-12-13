import React from 'react';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

interface TopNavigationProps {
  email: string | null;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ email }) => {
  const navigate = useNavigate();

  const handleSignInCheck = () => {
    navigate('/login');
  };

  const handleSignOutCheck = () => {
    navigate('/', { state: { email: "" } });
  };

  const handleRandomGameClick = () => {
    navigate('/game-detail', { state: { id: Math.floor(Math.random() * 10000).toString(), email: email}});
  };

  const handleFindGameByNameClick = () => {
    navigate('/game-search', { state: { email: email } });
  };

  const handleFindGameByCoverClick = () => {
    navigate('/game-search-image', { state: { email: email } });
  };

  const handleBacklogCheck = () => {
    if (email === "") {
      // Consider using a notification library for a better user experience
      alert('User is not logged in. Please sign in or create a new account.');
    }
    else {
      navigate('/backlog', { state: { email: email } });
    }
  };

  return (
    <Menu theme="dark" mode="horizontal">
      {!email && <Menu.Item key="1" onClick={handleSignInCheck}>Sign In</Menu.Item>}
      {email && <Menu.Item key="2" onClick={handleSignOutCheck}>Sign Out</Menu.Item>}
      <Menu.Item key="3" onClick={handleRandomGameClick}>Random Game</Menu.Item>
      <Menu.Item key="4" onClick={handleFindGameByNameClick}>Search Game By Name</Menu.Item>
      <Menu.Item key="5" onClick={handleFindGameByCoverClick}>Search Game By Cover</Menu.Item>
      <Menu.Item key="6" onClick={handleBacklogCheck}>Backlog</Menu.Item>
    </Menu>
  );
};

export default TopNavigation;