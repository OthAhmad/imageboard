const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { s3Url } = require("./config.json");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.static("./public"));
app.use(express.json());

app.get("/images", (req, res) => {
    db.selectFromImages()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log("err in selectAllFromImages: ", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    db.addImage(
        s3Url + req.file.filename,
        req.body.username,
        req.body.title,
        req.body.description
    )
        .then(({ rows }) => {
            res.json(rows[0]);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({ error: "Something failed!" });
        });
});

app.get("/image/:imageid", (req, res) => {
    db.getImage(req.params.imageid)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

app.get("/images/more/:imageid", (req, res) => {
    db.moreImages(req.params.imageid)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log("error: ", err);
            res.status(500).send(err);
        });
});

app.get("/get-comments/:imageid", (req, res) => {
    db.getComments(req.params.imageid)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => console.log(err));
});

app.post("/comment/add", (req, res) => {
    console.log(req.body);
    db.addComment(req.body.username, req.body.comment, req.body.imageid)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({ error: "Something failed!" });
        });
});

app.listen(8000, () => console.log("Listening..."));
