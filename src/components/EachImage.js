import { Link, Route, Routes, useParams } from "react-router-dom";
import "../assets/App.css";
import { ImageUpload, PhotoFolders, Home, LogIn } from "./index";
import { useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase-config";
import { UserAuth } from "./AuthContext";

function EachImage(props) {
  const { userId,imageName } = useParams();
  const location = useLocation();
  const { imageLink, folder } = location.state;
console.log(folder)
  const download = async () => {
    fetch(imageLink)
      .then((resp) => resp.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        // the filename you want
        a.download = `${imageName}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        // alert('your file has downloaded!'); // or you know, something with better UX...
      })
      .catch(() => alert("oh no!"));
  };


  return (
    <div>
      <h1>Each Image</h1>
      <Link to={`/${userId}/albums/${folder}`}>
        <div>Back</div>
      </Link>
      <img src={imageLink} className={"singleImage"} />
      <button onClick={(e) => download(e)}>Download</button>
    </div>
  );
}

export default EachImage;
