import { Link, useParams } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import {
  Typography,
  AppBar,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CssBaseline,
  Grid,
  Toolbar,
  Container,
  Button,
  ButtonGroup,
} from "@mui/material";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import useStyles from "./style";

function PhotoFolders() {
  const { classes } = useStyles();
  const { userId } = useParams();
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState("");
  const albums = collection(db, `albums/${userId}/personalAlbums`);
  
  let nameNewFolder = { folder: newFolder };
  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    let albumFolders = await getDocs(albums);
    console.log(albumFolders.docs[0].data())
    setFolders((prev) =>
    albumFolders.docs.map((doc) => ({ ...doc.data(), folder: doc.id }))
    );
  };

  const handleNewFolder = async () => {
    const newAlbum = await setDoc(
      doc(db, "albums", userId, "personalAlbums", newFolder),
      {}
    );
    setFolders((prev) => [...prev, nameNewFolder]);
    show("newFolderArea", "newFolder")
  };

  const show = (hiddenEle, shownEle) => {
    const x = document.getElementById(`${hiddenEle}`);
    const y = document.getElementById(`${shownEle}`);
    (x.style.display === "none" ?
      x.style.display = "block":
      x.style.display = "none")
    
 (y.style.display === "none" ?
      y.style.display = "block": 
      y.style.display = "none"
 )
  };

  let randomProperty =  function (obj) {
    let keys = Object.keys(obj);
    keys.pop()
    return `${obj[keys[ keys.length * Math.random() << 0]]}`;
};

  return (
    <div>
      <div className={classes.container}>
        <Container maxWidth="sm">
          <Typography
            variant="h2"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Photo Albums
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="textSecondary"
            paragraph
          >
            Your magical memories
          </Typography>
        </Container>
      </div>
      <div id="newFolderArea" style={{display:"none"}}>
        <button onClick={(evt) => handleNewFolder()}>Add folder</button>
        <input
          value={newFolder}
          onChange={(e) => setNewFolder(`${e.target.value}`)}
        />
      </div>
      <CreateNewFolderOutlinedIcon
        fontSize="large"
        id="newFolder"
        onClick={() => show("newFolderArea", "newFolder")}
      />
      <div className="folderArea">
      </div>
      <Container className={classes.cardGrid} maxWidth="md">
        <Grid container spacing={4}>
          {folders.map((card) => (
            <Grid item key={card + v4()} xs={4} md={4}>
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image= {Object.keys(card).length>1?  randomProperty(card) :"https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg"}
                  title="Image title"
                />
                <CardContent className={classes.CardContent}>
                  <Link
                    key={card.folder}
                    to={`/${userId}/albums/${card.folder}`}
                  >
                    <Typography gutterBottom variant="h5">
                      {card.folder}
                    </Typography>
                  </Link>
                  <Typography>
                    {" "}
                    This is a media card. You can use to describe content
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default PhotoFolders;
