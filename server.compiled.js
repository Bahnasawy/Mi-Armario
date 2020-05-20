import express from 'express';
import graphqlHTTP from 'express-graphql';
import cookieSession from 'express-session';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import axios from 'axios';
import jimp from 'jimp';
import cors from 'cors';
import gql from './api.js';
import a from './a.js';
let app = express();
const storage = multer.diskStorage({
  destination: "./public/images/temp/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE" + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000
  }
}).single("myImage");
app.use(cors({
  origin: "localhost:3000",
  credentials: true
}));
app.use(express.static('public'));
app.use(express.static(path.join(a.__dirname, 'client', 'build')));
app.use(cookieSession({
  name: "session",
  keys: ['Key1', 'Key2'],
  secret: "secret",
  maxAge: 60 * 60 * 1000,
  cookie: {
    httpOnly: false
  },
  resave: false,
  saveUninitialized: true,
  httpOnly: false
}));
app.set('trust proxy', 1);
app.use(cookieParser());
app.use('/graphql', graphqlHTTP({
  schema: gql.schema,
  rootValue: gql.root,
  graphiql: true
}));
app.use(function (req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

async function send(id, body) {
  const mutation = `mutation($product: Tables!){
    insert(input: $product)
  }`;
  const variables = {
    "product": {
      "product": {
        "id": `${id.toString('hex')}`,
        "name": `${body.name}`,
        "price": parseInt(body.price),
        "category_id": `${body.category}`,
        "size": `${body.size}`,
        "quantity": parseInt(body.quantity, 10)
      }
    }
  };
  const options = {
    url: "http://localhost:8080/graphql",
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: {
      "query": mutation,
      "variables": variables
    }
  };

  try {
    const response = await axios(options);
  } catch (error) {
    console.log(error.message);
  }
}

function home(req, res) {
  if (req.cookies['mi-armario'] === 'undefined' || req.cookies['mi-armario'] === undefined) {
    crypto.randomBytes(48, (err, buffer) => {
      res.cookie('mi-armario', JSON.stringify({
        id: buffer.toString('hex'),
        user_id: "",
        cart: {},
        username: ""
      }), {
        httpOnly: false,
        maxAge: 60 * 1000
      });
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(200);
  }
}

function up(req, res) {
  const id = crypto.randomBytes(10);
  const category = {
    "0": "tshirts",
    "1": "shoes",
    "2": "bags",
    "3": "pants",
    "4": "jackets"
  };
  upload(req, res, err => {
    jimp.read(`./public/images/temp/${req.file.filename}`, (err, image) => {
      image.write(`./public/images/${category[req.body.category]}/${id.toString('hex')}.png`);
    });
    fs.remove(`./public/images/temp/${req.file.filename}`, err => console.log(err));
    send(id, req.body);
    if (!err) return res.sendStatus(200);
  });
}

app.get("/", home);
app.post("/upload", up);
console.log("Listening on port 8080");
app.listen(8080);
