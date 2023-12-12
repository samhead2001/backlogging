import * as React from "react"
import { getAuth, signOut } from 'firebase/auth'

import { db } from '../config/config'; // Import your Firebase configuration
import { collection, getDocs, query, where, doc, FieldPath, limit } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, List } from "antd";
import TopNavigation from "../components/TopNavigation";

interface GameType {
  id: string;
  game_name: string;
  personal_rating: number;
  status: string;
}

const DisplayGameListPage = () => {
  const [games, setGames] = useState<GameType[]>([]);
  const [id, setId] = useState<any | null>(null);
  const [gameIDs, setGameIDs] = useState<string[]>([]);
  const [ratingsIDs, setRatingsIDs] = useState<number[]>([]);
  const [statusIDs, setStatusIDs] = useState<string[]>([]);
  const navigate = useNavigate(); // Create a history object for navigation
  const {state} = useLocation();
  const {email} = state;

  async function generateList() {
    try {
      // console.log(id);
      const backlog = await collection(db, "savedSlugIDs");
      console.log(email);
      const q = query(backlog, where('email', '==', email));
      const querySlugSnapshot = await getDocs(q);
      var gameList: GameType[] = [];
      querySlugSnapshot.forEach((doc) => {
        console.log(doc.data().games);
        for (var i = 0; i < doc.data().games.length; i++) {
          const game: GameType = {
            id: doc.data().games[i], 
            game_name: doc.data().names[i],
            personal_rating: doc.data().ratings[i],
            status: doc.data().status[i]
          }
          gameList.push(game);
        }
      setGames(gameList);
      });
        // const slugDoc = querySlugSnapshot.docs[0];
          // }
          
    } catch (error) {
      console.error("Error fetching document:", error);
    }
      //   setGames(gameList);
      //   const ref = slugDoc.ref;
      //   console.log(slugDoc.data().games);
      //   setGameIDs(slugDoc.data().games);
      //   setRatingsIDs(slugDoc.data().ratings);
      //   setStatusIDs(slugDoc.data().status);
      // else {

      // }
      // Step 3: Set the selected game in state
  }

  // async function findBacklogGames(ids: string[]) {
  //   try {
  //     var searchedGames: DataType[] = [];
  //     const backlog = await collection(db, "");
  //     for (var i = 0; i > ids.length; i++) {
  //       const id = ids[i];
  //       const rating = ratingsIDs[i];
  //       const status = statusIDs[i];
  //       console.log(id);
  //       const q = query(backlog, where('__name__', '==', id), limit(1));
  //       const querySnapshot = await getDocs(q);
  //       querySnapshot.forEach((doc) => {
  //         console.log(doc.data())
  //         const game: DataType = {
  //           id: doc.id, 
  //           name: doc.data().name, 
  //           rating: doc.data().esrb_rating, 
  //           // released: doc.data().released,
  //           platform: doc.data().platforms,
  //           personal_rating: rating,
  //           status: status
  //         }
  //         searchedGames.push(game);
  //       });
  //     };
  //     console.log("went through everything")
  //     setGames(searchedGames);
  //     // Step 3: Set the selected game in state
  //   } catch (error) {
  //     console.error("Error fetching document:", error);
  //   }
  // }
  useEffect(() => {
    generateList();
  }, [email]);
    // const game = getRandomDocument('games');

    if (!games) {
        // Handle the case where there is no game data
        return <div>Loading...</div>;
    }

    
  const handleGameClick = async(id: string) => {
    // Use history.push to navigate to GameDetailPage and pass the data as state
    navigate('/game-detail', {state: {id: id, email: email}});
  };


    //TODO: Change released from a Timestamp to a string
    //TODO: Find a way to check if values are null. If so, don't add them.
    return (
      <div style={{ backgroundColor: '#004080', minHeight: '100vh', color: 'white', fontSize: "20px"}}>
      <TopNavigation email={email}></TopNavigation>
      <List
        style={{ backgroundColor: '#e6f7ff', width: "75%", margin: "auto"}}
        bordered
        dataSource={games}
        renderItem={(item) => (
      <List.Item>
        {<Button style={{ width: "300px" }} onClick={(e:any) => handleGameClick(item.id)}>{item.game_name}</Button>}
        <div style={{ flex: '1', textAlign: 'center' }}>
          Rating: {item.personal_rating}
        </div>
        <div style={{ flex: '1', textAlign: 'right' }}>
          Status: {item.status}
        </div>
        
      </List.Item>
    )}
    />
          
          

          {/* Add more details as needed */}
        </div>
    );
};

export default DisplayGameListPage;