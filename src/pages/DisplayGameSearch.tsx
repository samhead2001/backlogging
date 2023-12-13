import * as React from "react"
import { getAuth, signOut } from 'firebase/auth'

import { db } from '../config/config'; // Import your Firebase configuration
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button, Input, List, Typography } from "antd";
import TopNavigation from "../components/TopNavigation";

interface DataType {
  id: string;
  name: string;
  rating: string;
  released: string;
  platforms: string[];
}

const DisplayGameSearch = () => {
  const [data, setData] = useState<DataType[]>([]);
  // const [list, setList] = useState<DataType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [numGames, setNumGames] = useState(10);
  const [email, setEmail] = useState("");

  const navigate = useNavigate(); // Create a history object for navigation
  const {state} = useLocation();

  const handleAddClick = async(num: number) => {
    // Use history.push to navigate to GameDetailPage and pass the data as state
    setNumGames(numGames + num);
    // setList(data.slice(0, numGames));
  };
  async function getDocumentsFromName(collectionName: string, name: string) {
    try {
      // Step 1: Retrieve all documents from the collection
      const games = await collection(db, collectionName);
      const q = query(games, where('name', '>=', searchTerm), where('name', '<=', name+ '\uf8ff'), limit(numGames));
      const querySnapshot = await getDocs(q);
      var searchedGames: DataType[] = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.id);
        const game: DataType = {
          id: doc.id, 
          name: doc.data().name, 
          rating: doc.data().esrb_rating, 
          released: doc.data().released,
          platforms: doc.data().platforms
        }
        searchedGames.push(game);
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
      });
      setData(searchedGames);
    } catch (error) {
      console.error("Error fetching random document:", error);
    }
  }
  const handleGameClick = async(id: string) => {
    // Use history.push to navigate to GameDetailPage and pass the data as state
    navigate('/game-detail', {state: {id: id, email: email}});
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    getDocumentsFromName("games", newSearchTerm);
  }
  useEffect(() => {
    setEmail(state.email);
  }, [state]);

  useEffect(() => {
    getDocumentsFromName("games", searchTerm);
    // const {email} = state;
  }, [numGames]);
    // const game = getRandomDocument('games');

    
    if (!data) {
        // Handle the case where there is no game data
        return <div>Loading...</div>;
    }

    //TODO: Change released from a Timestamp to a string
    //TODO: Find a way to check if values are null. If so, don't add them.
    return (
        <div style={{ backgroundColor: '#004080', minHeight: '100vh', color: 'white', fontSize: "20px"}}>
          <TopNavigation email={email}></TopNavigation>
          <div style={{ textAlign: 'center' }}>
            <Input style={{width: "50%", margin: "auto"}}
              onChange={handleInputChange}
              placeholder="Insert Game Name Here:" /> 
          </div>

          <div >
            <List 
              style={{ backgroundColor: '#e6f7ff', width: "50%", margin: "auto"}}
              bordered
              dataSource={data}
              renderItem={(item) => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: '1' }}>
                  <Button style={{ width: "300px" }} onClick={(e: any) => handleGameClick(item.id)}>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  </Button>
                  </div>
                  <div style={{ flex: '1', textAlign: 'center' }}>
                    {item.platforms}
                  </div>
                    { item.released != "nan" &&
                    <div style={{ flex: '1', textAlign: 'right' }}>
                      {item.released}
                    </div>
                  }

                </List.Item>
              )}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button onClick={(e:any) => handleAddClick(10)}>More Games</Button>
          </div>
        </div>
    );
};

export default DisplayGameSearch;