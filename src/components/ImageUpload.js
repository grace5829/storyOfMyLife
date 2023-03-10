// import logo from './assets/logo.svg';
import "../assets/App.css";
import { useState, useEffect, useRef } from "react";
import { db, storage } from "../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { collection, deleteDoc, deleteField, doc, getDoc, limit, orderBy, updateDoc } from "firebase/firestore";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Link, useParams } from "react-router-dom";
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
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import useStyles from "./style";
import { query } from "firebase/database";
function ImageUpload() {
  const {classes}=useStyles()
  const [uploadImages, setUploadImages] = useState(null);
  const [imageList, setImageList] = useState({});
  const [imageListBackup, setImageListBackup] = useState({});
  const [sortedImageList, setSortedImageList] = useState([]);
  // const [selectedImages, setSelectedImages] = useState([]);
  const { userId, albumName } = useParams();
  // const imageListRef = ref(storage, "images/");
  // const albumFolders = collection(db, `albums/${userId}/personalAlbums`);
  const data = doc(db, "albums", userId, "personalAlbums", albumName);
  const aRef = useRef(null);
  let unsortedKeys=[]
  const fetchImages = async () => {
    setSortedImageList([])
    setImageList({})
    try {
      const datas = await getDoc(data);
      Object.keys(datas.data()).map((name) => {
        setImageList((prev) => ({ ...prev, [name]: datas.data()[name] }));
        setImageListBackup((prev) => ({ ...prev, [name]: datas.data()[name] }));
        setSortedImageList((prev)=> ([...prev, name]))
        // unsortedKeys.push(name)
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchImages();
  }, []);
  useEffect(() => {
    sort()
  }, [fetchImages]);



  // console.log(imageList)
  const sort= ()=>{
    unsortedKeys=sortedImageList
    unsortedKeys.sort()
    console.log("sorteddd"+unsortedKeys)
    setSortedImageList(unsortedKeys)
    setImageList(unsortedKeys)
  }
  console.log(sortedImageList)
  const handleUpload = (e) => {
    if (uploadImages == null) return;
    let obj = {};
    Object.values(uploadImages).forEach((image) => {
      const imageRef = ref(
        storage,
        `images/${image.name.split(".")[0] + v4()}`
      );
      let name = image.name;
      uploadBytes(imageRef, image).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setImageList((prev) => ({ ...prev, [name.split(".")[0]]: url }));
          setImageListBackup((prev) => ({ ...prev, [name.split(".")[0]]: url }));
          setSortedImageList((prev) => ([ ...prev, [name.split(".")[0]] ]));
          let newName = image.name.split(".")[0];
          obj[newName] = url;
          // updateDoc allows us to override info in DB or add info without erasing previously data
          //we can use setDoc if we always want to erase all informaiton
          updateDoc(data, obj);
        });
      });
    });
    aRef.current.value = null;
    show("newPhotoArea", "newPhotoImage")
  };

  const download = async (fileName) => {
    fetch(imageList[fileName])
      .then((resp) => resp.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        // the filename you want
        a.download = `${fileName}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("oh no!"));
  };

  const downloadSelected = () => {
    let checkboxes = document.querySelectorAll(".checkbox");
    let downloadThese = [];
    for (let checkbox of checkboxes) {
      if (checkbox.checked) {
        downloadThese.push(checkbox.id);
      }
    }
    var zip = new JSZip();
    const remoteZips = downloadThese.map(async (image) => {
      const response = await fetch(imageList[image]);
      const data = await response.blob();
      zip.file(`${image}.jpeg`, data);
      return data;
    });
    Promise.all(remoteZips).then(() => {
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `StoryOfMyLife.zip`);
      });
    });
    for (let checkbox of checkboxes) {
      if (checkbox.checked) {
        checkbox.checked = false;
      }
    }
  };

  const downloadAll = async () => {
    var zip = new JSZip();

    // block.packages is an array of items from the CMS
    const remoteZips = Object.keys(imageList).map(async (image) => {
      // pack.file.url is the URL for the .zip hosted on the CMS
      const response = await fetch(imageList[image]);
      const data = await response.blob();

      // pack.kitName is from a loop, replace with your file name.
      zip.file(`${image}.jpeg`, data);

      return data;
    });

    Promise.all(remoteZips).then(() => {
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `StoryOfMyLife.zip`);
      });
    });
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
  async function deleteImage(entry) {
    const folderRef = doc(db, "albums", userId, "personalAlbums", albumName);
    await updateDoc(folderRef,{
      [entry]:deleteField()
    })
    let copyImageSet=imageList
   Reflect.deleteProperty(copyImageSet,entry)
  //  setImageList(copyImageSet)
  setImageList({});
  setSortedImageList([])
   fetchImages()
    // await setWorms(worms.filter((worm) => worm !== entry));
    // await setWormsBackup(worms.filter((worm) => worm !== entry));
  }
  const maxImageName =(name)=>{
    if (name.length<21){
      return name
    } 
 return name.substring(0,20)+"..."
  }
  return (
    <div className="App">
            <AddAPhotoIcon
        fontSize="large"
        id="newPhotoImage"
        onClick={() => show("newPhotoArea", "newPhotoImage")}
        />
      <div id="newPhotoArea" style={{display:"none"}}>
      <input
        type="file"
        multiple
        ref={aRef}
        onChange={(e) => {
          setUploadImages(e.target.files);
        }}
        />
      <button onClick={handleUpload}>Upload </button>
        </div>
      <div>
        {/* {selectedImages==={}? <></>: Object.keys(imageList).map((name)=>{
          <div>{name} </div>
        })} */}
        <button onClick={downloadSelected}>Download selected </button>
        <button onClick={(e) => downloadAll(e)}>Download All </button>
      </div>
      {/* <div className="allImagesArea"> */}
      <Container className={classes.cardImageGrid} maxWidth="md">
        <Grid container spacing={4}>
        {sortedImageList.map((name) => (
          <Grid item key={name + v4()} xs={12} sm={6} md={4} lg={4} className={name}>
                  <Card className={classes.image}>
                    {/* {console.log(imageList[name])} */}
                    {/* {console.log("imageList"+imageList[name])} */}
                    <input
                  type={"checkbox"}
                  className={"checkbox"}
                  id={name}
                  />
                    <CardMedia
                      className={classes.cardImageMedia}
                      image={imageListBackup[name]}
                      title="Image title"
                    />
                    {/* <CardContent className={classes.cardContent}>
                </CardContent> */}
                <CardActions id="imageDetails">
                  <span>

                <DownloadIcon 
                        fontSize="medium"
                        id="downloadIcon"
                        onClick={ (e) => download(name)}>
                </DownloadIcon>
                          </span>
            <Link
              state={{
                imageLink: `${imageListBackup[name]}`,
                folder: `${albumName}`,
              }}
              to={`/${userId}/albums/${albumName}/photo/${name}`}
              key={name}
            >
              <p>
                {maxImageName(name)}
                </p>
              </Link>
            <DeleteIcon
            onClick={()=>deleteImage(name)}
            className="deleteIcon"
            ></DeleteIcon>
                </CardActions>
                  </Card>
                </Grid> 
        ))}
              {/* <Container className={classes.cardGrid} maxWidth="md">
        <Grid container spacing={2}>
          {Object.keys(imageList).map((card) => (
            <Grid item key={card} xs={4} md={4}>
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image={imageList[card]}
                  title="Image title"
                />
                <CardContent className={classes.CardContent}>
                    <Typography gutterBottom variant="h5">
                      {card}
                    </Typography>
                  <Typography>
                    {" "}
                    This is a media card. You can use to describe content
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container> */}
        </Grid>
      </Container>
      {/* </div> */}
    </div>
  );
}

export default ImageUpload;
