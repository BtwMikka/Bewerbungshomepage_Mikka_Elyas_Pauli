// server.js

// where your node app starts
// init project

const express = require("express");
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
// Die statischen Seiten in public und content werden als "statisch" definiert. So können Sie direkt adressiert werden.

app.use(express.static("public"));
app.use(express.static("content"));
app.use(express.static("secure"));

// *******************************
// Passwortgeschützter Bereich
// *******************************

//Render die Datei admin.ejs, wenn die Admin-Seite aufgerufen wird
app.get("/secure", (req, res) => {
  app.set("views", path.join(__dirname, "secure"));
  res.render("login", {
    posts: " ",
  });
});

//Wenn die Anmeldedaten eingegeben worden sind, wird die Richtigkeit überprüft
app.post("/auth", function (request, response) {
  // Capture the input fields
  let username = request.body.username;
  let password = request.body.password;

  var userName1 = process.env.userName1;
  var userPass1 = process.env.userPass1;

  var userName2 = process.env.userName2;
  var userPass2 = process.env.userPass2;

  // Ensure the input fields exists and are not empty
  if (username && password) {
    if (
      (username !== userName1 || password !== userPass1) &&
      (username !== userName2 || password !== userPass2)
    ) {
      //Wenn die Logindaten nicht korrekt sind, melde dies;
      app.set("views", path.join(__dirname, "secure"));
      response.render("login", {
        posts: "Incorrect Username and/or Password!",
      });
    } else {
      // Wenn die Daten korrekt sind, wird der passwortgeschützte Bereich aufgerufen
      response.redirect(`/safe-area.html#loggedin`);
      app.set("views", path.join(__dirname, "views"));
    }
  }
});

//Definition des Blogs - Initialisierung
const cors = require("cors");
app.use(cors());

const path = require("path");

app.set("views", path.join(__dirname, "blog"));
app.set("view engine", "ejs");

const matter = require("gray-matter");

// *******************************
// Blog - Handling
// *******************************
app.get("/blog", (req, res) => {
  app.set("views", path.join(__dirname, "blog"));
  const dateienVerzeichnis = "./blog/"; // Verzeichnis mit deinen Markdown-Dateien
  fs.readdir(dateienVerzeichnis, (err, dateien) => {
    if (err) {
      console.error(err);
      res.status(500).send("Fehler beim Lesen des Verzeichnisses");
      return;
    }
    const mdDateien = dateien.filter((datei) => path.extname(datei) === ".md");
    const dateiDaten = mdDateien.map((datei) => {
      const dateiPfad = path.join(dateienVerzeichnis, datei);
      const dateiInhalt = fs.readFileSync(dateiPfad, "utf8");
      const { data } = matter(dateiInhalt); // Front Matter extrahieren

      // Fehlerbehandlung für fehlende oder ungültige Daten
      if (!data.title || typeof data.title !== "string") {
        data.title = "Blogeintrag";
      }
      if (!data.description || typeof data.description !== "string") {
        data.description = "Dieser Blogeintrag ist in Arbeit.";
      }
      if (!data.date || typeof data.date !== "string") {
        const today = new Date();
        var month = "" + (today.getMonth() + 1);
        var day = "" + today.getDate();
        var year = today.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        data.date = [year, month, day].join("-");
        // console.log(data.date);
      } else {
        const dateParts = data.date.split(".");
        // console.log(dateParts);
        if (dateParts.length === 3) {
          data.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
      if (!data.img_bloglist || typeof data.img_bloglist !== "string") {
        const img_bloglist = "";
      }

      return {
        title: data.title,
        description: data.description,
        date: data.date,
        path: dateiPfad,
        img: data.img_bloglist,
      };
    });
    res.render("blog", { dateiDaten });
  });
});

app.get("/blog/:article", (req, res) => {
  app.set("views", path.join(__dirname, "blog"));
  const file = matter.read(__dirname + "/blog/" + req.params.article + ".md");

  var md = require("markdown-it")();
  let content = file.content;
  var result = md.render(content);

  res.render("index", {
    post: result,
    title: file.data.title,
    slug: req.params.article,
    description: file.data.description,
    image1: file.data.img1,
    image2: file.data.img2,
    date: file.data.date,
  });
  app.set("views", path.join(__dirname, "views"));
});

// My Blog - Konfiguration
app.get("/blog", (req, res) => {
  app.set("views", path.join(__dirname, "blog"));
  const posts = fs
    .readdirSync(__dirname + "/blog")
    .filter((file) => file.endsWith(".md"));
  res.render("blog", {
    posts: posts,
  });
});

app.get("/blog/:article", (req, res) => {
  app.set("views", path.join(__dirname, "blog"));
  const file = matter.read(__dirname + "/blog/" + req.params.article + ".md");
  console.log(file);

  console.log(req.params.article);
  var md = require("markdown-it")();
  let content = file.content;
  var result = md.render(content);

  res.render("index", {
    post: result,
    title: file.data.title,
    slug: req.params.article,
    description: file.data.description,
    image: file.data.image,
    date: file.data.date,
  });
});

// This is the basic-routing
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// Routing der index.html als /index
app.get("/index", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// Routing der bildergalerie.html als /bildergalerie

app.get("/bildergalerie", (request, response) => {
  response.sendFile(`${__dirname}/views/bildergalerie.html`);
});

// Routing der kontakt.html als /kontakt

app.get("/kontakt", (request, response) => {
  response.sendFile(`${__dirname}/views/kontakt.html`);
});

// Routing der schulbildung.html als /schulbildung

app.get("/schulbildung", (request, response) => {
  response.sendFile(`${__dirname}/views/schulbildung.html`);
});

// Routing der berufsbildung.html als /berufsbildung

app.get("/berufsbildung", (request, response) => {
  response.sendFile(`${__dirname}/views/berufsbildung.html`);
});

// Routing der impressum.html als /impressum

app.get("/impressum", (request, response) => {
  response.sendFile(`${__dirname}/views/impressum.html`);
});

// Routing der daten.html als /daten

app.get("/daten", (request, response) => {
  response.sendFile(`${__dirname}/views/daten.html`);
});

// The E-Mail-Transport initializing

const transporter = nodemailer.createTransport({
  host: "mail.gmx.net", //replace with your email provider - this is the host for gmx mail

  port: 587, // this port number is usally standard

  auth: {
    user: process.env.EMAIL, //This is your E-Mail-Address as environment variable -> see .env

    pass: process.env.PASS, //This is your E-Mail-Password as environment variable -> see .env
  },
});

// verify connection configuration

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

//Funktion für das Senden der E-Mail, hier werden alle Felder des Formulars mit den Daten "vorbereitet"

app.post("/send", (req, res) => {
  // Sendig the E-Mail

  let form = new multiparty.Form();

  let data = {};

  form.parse(req, function (err, fields) {
    console.log(fields);

    Object.keys(fields).forEach(function (property) {
      data[property] = fields[property].toString();
    });

    //Hier wird die E-Mail an Euch definiert. Bitten halten Sie sich genau an der vorgegebenen Schreibweise, Info: \n ist ein Umbruch

    const mail1 = {
      from: process.env.EMAIL,

      to: process.env.EMAIL,

      subject: `Mail von der Website: ${data.reason}`,

      text: ` Name: ${data.fullname} \n E-Mail: <${data.email}> \n Nachricht: ${data.formmessage}`,
    };

    //Hier wird die E-Mail abgesendet

    transporter.sendMail(mail1, (err, data) => {
      if (err) {
        console.log(err);

        res.status(500).send("Something went wrong.");
      } else {
        res.status(200).send("Email successfully sent to recipient!");
      }
    });

    //Hier wird die E-Mail an den Sender definiert, der eine Kopie seiner Nachricht erhält.

    const mail2 = {
      from: process.env.EMAIL,

      to: data.email,

      subject: `Ihre Mail von der Website: ${data.reason}`,

      text: ` Name: ${data.fullname} \n E-Mail: <${data.email}> \n Nachricht: ${data.formmessage}`,
    };

    //Hier wird die E-Mail abgesendet

    transporter.sendMail(mail2, (err, data) => {
      if (err) {
        console.log(err);

        res.status(500).send("Something went wrong.");
      } else {
        res.status(200).send("Email successfully sent to recipient!");
      }
    });
  });
});

// listen for requests :)

var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
