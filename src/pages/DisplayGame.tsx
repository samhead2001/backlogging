import * as React from "react"
import { getAuth, signOut } from 'firebase/auth'

import { db } from '../config/config'; // Import your Firebase configuration
import { collection, getDocs, query, where, doc, FieldPath, limit, arrayUnion, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNavigation from "../components/TopNavigation";

interface GameType {
  id: string;
  developers: string;
  esrb_rating: string;
  genres: string;
  name: string;
  rating?: string;
  platforms?: string[];
  playtime?: string;
  publishers: string[];
  achievements_count: string;
  // released: string;
}

const DisplayGamePage = () => {
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [game, setGame] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('Not Played');
  const {state} = useLocation();
  const {id, email, random} = state;

  useEffect(() => {
    console.log("does this appear TWO!? times?" + random)
    if (random === true) {
      getRandomDocument("games");
    }
    else {
      getDocument("games", id);
    }
  }, []);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setSliderValue(newValue);
  };

  async function getDocument(collectionName: string, documentId: string) {
    try {
      console.log(documentId);
      const games = await collection(db, collectionName);
      const q = query(games, where("__name__", '==', documentId), limit(1));
      const queryGameSnapshot = await getDocs(q);
      queryGameSnapshot.forEach((doc) => {
        console.log(doc.data());
        const game: GameType = {
          id: doc.id, 
          developers: doc.data().developers,
          esrb_rating: doc.data().esrb_rating,
          genres: doc.data().genres,
          name: doc.data().name,
          rating: doc.data().esrb_rating,
          platforms: doc.data().platforms,
          playtime: doc.data().playtime,
          publishers: doc.data().publishers,
          achievements_count: doc.data().achievements_count,
          // released: doc.data().released,
        }
        setGame(game);
      });

      
      //Get status and rating
      const slugsCollection = collection(db, "savedSlugIDs");
      const backlog = query(slugsCollection, where("email", "==", email));
      const querySlugSnapshot = await getDocs(backlog);
      const slugDoc = querySlugSnapshot.docs[0];
      const ref = slugDoc.ref;
      //Return the index of the id
      const index = slugDoc.data().games.indexOf(id);
      console.log(index);
      if (index != -1) {
        //Set the status and rating
        console.log("Ratings: " + slugDoc.data().ratings[index]);
        console.log("Status: " + slugDoc.data().status[index]);
        setSliderValue(slugDoc.data().ratings[index]);
        setSelectedOption(slugDoc.data().status[index]);
      }
      // Step 3: Set the selected game in state
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  }
  async function getRandomDocument(collectionName: string) {
    try {
      const g = doc(db, collectionName, id);
      const docSnap = await getDoc(g);
      // Step 1: Retrieve all documents from the collection
      

      // Step 2: Randomly select one document
      // const documents = querySnapshot.docs;
      
      // const doc = documents[randomIndex];

      // Step 3: Set the selected game in state
      console.log(docSnap.data());
      const game: GameType = {
        id: docSnap.id, 
        developers: docSnap.data()?.developers ?? "",
        esrb_rating: docSnap.data()?.esrb_rating ?? "",
        genres: docSnap.data()?.genres ?? "",
        name: docSnap.data()?.name ?? "",
        rating: docSnap.data()?.esrb_rating ?? "",
        platforms: docSnap.data()?.platforms ?? "",
        playtime: docSnap.data()?.playtime ?? "",
        publishers: docSnap.data()?.publishers ?? "",
        achievements_count: docSnap.data()?.achievements_count ?? "",
        // released: docSnap.data()?.released ?? defaultValueForReleased,
      }
      setGame(game);
    } catch (error) {
      console.error("Error fetching random document:", error);
    }
  }
    // const game = getRandomDocument('games');

  if (!game) {
      // Handle the case where there is no game data
      return <div style={{ backgroundColor: '#004080', minHeight: '100vh', color: 'white', fontSize: "20px"}}>
        <TopNavigation email={email}></TopNavigation>
        Loading...
        </div>;
  }
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedOption(newValue);
  };

  const checkGameUniqueness = (ids: string[]) => {
    if (ids.includes(game.id)) {
      // Username already exists in the collection
      return false;
    }
  
    return true; // Username is unique
  };

  //Add Game to Backlog List
  const updateList = async() => {
    try {
      const slugsCollection = collection(db, "savedSlugIDs");
      const backlog = query(slugsCollection, where("email", "==", email));
      const querySlugSnapshot = await getDocs(backlog);
      const slugDoc = querySlugSnapshot.docs[0];
      const ref = slugDoc.ref;
      console.log(slugDoc.data());
      //If game isn't already in list, add to list.
      if (checkGameUniqueness(slugDoc.data().games)) {
        console.log(selectedOption);
        var ratings = slugDoc.data().ratings;
        ratings.push(sliderValue);
        var status = slugDoc.data().status;
        status.push(selectedOption);
        var names = slugDoc.data().names;
        names.push(game.name);
        var games = slugDoc.data().games;
        games.push(game.id);
        await setDoc(ref, {
          email: email,
          names: names,
          games: games,
          ratings: ratings,
          status: status,
        });
      }
      else { //If game is already in list, get index and update values.
        const index = slugDoc.data().games.indexOf(id);
        console.log(index);
        if (index != -1) {
          console.log("Did I get in here?");
          var ratings = slugDoc.data().ratings;
          ratings[index] = sliderValue;
          var status = slugDoc.data().status;
          status[index] = selectedOption;
          await setDoc(ref, {
            email: email,
            names: slugDoc.data().names,
            games: slugDoc.data().games,
            ratings: ratings,
            status: status,
          });
        }
      }
      // Step 3: Set the selected game in state
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  }

    //TODO: Change released from a Timestamp to a string
    //TODO: Find a way to check if values are null. If so, don't add them.
    return (
      <div style={{ backgroundColor: '#004080', minHeight: '100vh', color: 'white', fontSize: "20px"}}>
        <TopNavigation email={email}></TopNavigation>
        <h2>Game Detail Page</h2>
        <p>Name: {game.name}</p>
        {/* <p>Released: {game.released}</p> */ }
        <p>Developers: {game.developers}</p>
        {game?.publishers[0] !== "" ? (
          <p>Publishers: {game?.publishers[0]}</p> //TODO: array into list of strings
        ) : (
          <p></p>
        )}
        {game?.platforms.length === 0 ? (
          <p>Platforms: {game.platforms}</p> //TODO: array into list of strings
        ) : (
          <p></p>
        )}
        <p>Genres: {game?.genres.join(", ")}</p> {/*TODO: array into list of strings*/}
        {game?.playtime !== 0 ? (
          <p>Playtime: {game?.playtime + " Hours"}</p>
          ) : (
          <p></p>
        )}
          {game.achievements_count !== 0 ? (
            <p>Achievement Count: {game.achievements_count + " Achievements"}</p>
          ) : (
            <p></p>
          )}
          {game.esrb_rating !== "nan" ? (
            <p>ESRB Rating: {game.esrb_rating}</p>
          ) : (
            <p></p>
          )}
          {/* <button onClick={(e:any) => console.log(listID)}>Print Game ID</button> */}
          {/* <button onClick={(e:any) => actuallyAddToList(listID)}>Actually Add Game to List</button> */}
          {email && (
        <>
          <p>Personal Rating: {sliderValue.toFixed(1)}</p>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={sliderValue}
            onChange={handleSliderChange}
            disabled={selectedOption === 'Not Played'}
            style={{ opacity: selectedOption === 'Not Played' ? 0.5 : 1 }}
          />
          <div>
            <label>Select Status:</label>
            <br />
            <select value={selectedOption} onChange={handleDropdownChange}>
              <option value="Not Played">Not Played</option>
              <option value="Currently Playing">Currently Playing</option>
              <option value="Finished">Finished</option>
              <option value="100%">100%</option>
            </select>
            <br />
            <button onClick={(e: any) => updateList()}>Update List</button>
          </div>
        </>
      )}
    </div>
    );
};

export default DisplayGamePage;