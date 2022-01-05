const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
let inspect = require("util").inspect;
let Busboy = require("busboy");
let path = require("path");
let os = require("os");
let fs = require("fs");
let UUID = require("uuid-v4");

/*
Firebase config
*/
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "lucastagram-3f53e.appspot.com"
});

const db = admin.firestore();
let bucket = admin.storage().bucket();

const app = express();

app.use(cors());

app.get("/posts", (request, response) => {
  let posts = [];
  db.collection("posts")
    .orderBy("date", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        posts.push(doc.data());
      });
      response.send(posts);
    });
});

app.post("/createPost", (request, response) => {
  var busboy = new Busboy({ headers: request.headers });

  let uuid = UUID();

  let fields = {};
  let fileData = {};

  busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
    console.log(
      "File [" +
        fieldname +
        "]: filename: " +
        filename +
        ", encoding: " +
        encoding +
        ", mimetype: " +
        mimetype
    );
    let filepath = path.join(os.tmpdir(), filename);
    console.log(filepath);
    file.pipe(fs.createWriteStream(filepath));
    fileData = { filepath, mimetype };
  });

  busboy.on("field", function(
    fieldname,
    val,
    fieldnameTruncated,
    valTruncated,
    encoding,
    mimetype
  ) {
    fields[fieldname] = val;
  });

  busboy.on("finish", function() {
    bucket.upload(
      fileData.filepath,
      {
        uploadType: "media",
        metadata: {
          metadata: {
            contentType: fileData.mimetype,
            firebaseStorageDownloadTokens: uuid
          }
        }
      },
      (error, uploadedFile) => {
        if (!error) {
          createDocument(uploadedFile);
        }
      }
    );

    function createDocument(uploadedFile) {
      db.collection("posts")
        .doc(fields.id)
        .set({
          id: fields.id,
          caption: fields.caption,
          location: fields.location,
          date: parseInt(fields.date),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}` //
        })
        .then(() => {
          response.send("Post Added" + fields.id);
        });
    }
  });
  request.pipe(busboy);
});

app.listen(process.env.PORT || 3000);
