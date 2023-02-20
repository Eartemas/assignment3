/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Eshban Artemas Student ID: 15769218 Date: 02-18-2023
*
*  Online (Cyclic) Link: https://odd-red-kingfisher-boot.cyclic.app/about
********************************************************************************/ 

const express = require('express');
const app = express();
const path = require("path");
const blogService = require("./blog-service");


const cloudinary = require ('cloudinary').v2;
const multer = require("multer");
const streamifier = require('streamifier');

const HTTP_PORT = process.env.PORT || 8080;

// Config
cloudinary.config({
  cloud_name: "dcnqjksuy",
  api_key: "766462514461559",
  api_secret: "3dbjFYbmwgZ2PWI5zPyXrBmGm8c",
  secure: true,
})

const upload = multer(); // upload variable with no disk storage {storage:storage}

function onHttpStart(){
  console.log("Express http server listening on:  "+ HTTP_PORT);
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about');
});

// -------------------ABOUT--------------------------------------------
app.get("/about",(req,res)=>{
  res.sendFile(path.join(__dirname,"/views/about.html"));
});

// -------------------BLOG--------------------------------------------
app.get("/blog", (req, res)=> {
  blogService.getPublishedPosts()
  .then((posts) => {
      res.send(posts);
  })
  .catch((err) => {
    res.send({message: err});
  });
});

// -------------------POSTS--------------------------------------------
/*app.get("/posts", (req, res)=> {
  blogService.getAllPosts()
  .then((posts) => {
      res.send(posts);
  })
  .catch((err) => {
      res.send({message: err});
      
  });
});

app.get("/posts", function(req, res) {
  let queryPromise = null;

  // by category query 
  if (req.query.category) {
      queryPromise = blogService.getPostsByCategory(req.query.category);
      // by mindate Query 
  } else if (req.query.minDate) {
      queryPromise = blogService.getPostsByMinDate(req.query.minDate);
      //all posts 
  } else {
      queryPromise = blogService.getAllPosts()
  }

  queryPromise.then(data => {
      res.send(data)
  }).catch(err => {
      res.render("No Posts Found");
  })
});*/
app.get("/posts", function(req, res) {
  let queryPromise = null;

  // by category query 
  if (req.query.category) {
      queryPromise = blogService.getPostsByCategory(req.query.category);
      // by mindate Query 
  } else if (req.query.minDate) {
      queryPromise = blogService.getPostsByMinDate(req.query.minDate);
      //all posts 
  } else {
      queryPromise = blogService.getAllPosts()
  }

  queryPromise.then(data => {
      res.send(data)
  }).catch(err => {
      res.render("No Posts Found");
  })
});

app.get("/categories", function(req, res) {
  blogService.getCategories()
      .then((categories) => {
          res.send(categories);
      })
      .catch((err) => {
          res.send({ message: err });
      });
});



// -------------------CATEGORIES--------------------------------------------
app.get("/categories", (req, res) =>{
  blogService.getCategories()
  .then((categories) => {
  res.send(categories);
  })
  .catch((err) => {
    res.send({message: err});
  });
});

// -------------------Add Posts--------------------------------------------
app.get("/posts", function(req, res) {
  let queryPromise = null;

  //---------By category----------------  
  if (req.query.category) {
      queryPromise = blogService.getPostsByCategory(req.query.category);
      
      //------By mindate-----------  
  } else if (req.query.minDate) {
      queryPromise = blogService.getPostsByMinDate(req.query.minDate);
      
      //---------All posts-------------- 
  } else {
      queryPromise = blogService.getAllPosts()
  }

  queryPromise.then(data => {
      res.send(data)
  }).catch(err => {
      res.render("No Posts Found");
  })
});

app.get("/categories", function(req, res) {
  blogService.getCategories()
      .then((categories) => {
          res.send(categories);
      })
      .catch((err) => {
          res.send({ message: err });
      });
});

app.get('/posts/add', (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {

  let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                  if (result) {
                      resolve(result);
                  } else {
                      reject(error);
                  }
              }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
  };

  async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
  }

  upload(req).then((uploaded) => {
      req.body.featureImage = uploaded.url;
      // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

      var postData = req.body;
      blogService.addPost(postData).then(data => {
          res.redirect('/posts');
      }).catch(err => {
          res.send(err);
      });


  });


});


// 404
app.get("*",(req,res)=>{
  res.status(404).send("Page Not Found");
})  // if no matching route is found default to 404 with message "Page Not Found"


//LISTEN
blogService.initialize().then(()=>{
  app.listen(HTTP_PORT,onHttpStart);

}).catch(()=>{
  console.log("error");
});