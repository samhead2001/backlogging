import * as React from "react"  
import axios from "axios";
import TopNavigation from "../components/TopNavigation";
import { useLocation } from "react-router-dom";

const DisplayGameByImagePage = () => {
    const [file, setFile] = React.useState<File | null>(null);
    const [filebase64,setFileBase64] = React.useState<string>("")
    const [gameName,setGameName] = React.useState<string>("")
    const [image, setImage] = React.useState<string | null>(null);
    const {state} = useLocation();
    const {email} = state;
    
    function convertFile(files: FileList | null) {
      if (files) {
        const fileRef = files[0] || "";
        const fileType: string = fileRef.type || "";
        console.log("This file upload is of type:", fileType);
  
        // Save the selected file in the state
        setFile(fileRef);
  
        const reader = new FileReader();
        reader.readAsBinaryString(fileRef);
        reader.onload = (ev: any) => {
          // convert it to base64
          setFileBase64(`data:${fileType};base64,${btoa(ev.target.result)}`);
          console.log(filebase64);
        };
      }
    }

    const handleMLClick = async () => {
      try {
        if (!file) {
          console.error("No file selected");
          return;
        }
    
        // Prepare a sample FormData object with a file (adjust as needed)
        const formData = new FormData();
        formData.append('image', file); // Provide the filename as the third argument
    
        // Make a POST request to the server
        const response = await fetch("http://localhost:8080/ocr", {
          method: 'POST',
          body: formData,
        });
    
        console.log(response.headers.get("content-type"));
    
        if (response.ok) {
          const data = await response.json();
          console.log(data.result);
          console.log(data.image);
          setGameName(data.result);
          setImage(data.image);
          // Handle the JSON data
        } else {
          console.error('Error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    //   try {
    //     //POST Response

    //     const response = await fetch("http://127.0.0.1:5000/ocr");
    //     console.log(response.headers.get("content-type"));

    //     if (response.ok) {
    //         const data = await response.json();
    //         console.log(data);
    //         // Handle the JSON data
    //     } else {
    //         console.error('Error:', response.status);
    //     }
    // } catch (error) {
    //     console.error('Fetch error:', error);
    // }
    };

    return (
      <div style={{ backgroundColor: "#004080", minHeight: "100vh", color: "white", fontSize: "20px" }}>
        <TopNavigation email={email}></TopNavigation>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <div>
            <input type="file" onChange={(e) => convertFile(e.target.files)} />
            <hr />
            {filebase64 && (
              <>
                {filebase64.indexOf("image/") > -1 && <img src={filebase64} width={500} />}
                {image && <img style={{marginLeft: "100px"}}width={500} src={`data:image/jpeg;base64,${image}`} alt="Generated Image" />}
                <hr />
                <button onClick={handleMLClick}>Generate Game Name</button>
                <br />
                Name: {gameName != "" ? gameName : "Cannot find game name."}
              </>
            )}
          </div>
        </div>
      </div>
    );
};

export default DisplayGameByImagePage;