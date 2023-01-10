import * as dotenv from 'dotenv';
// import * as GIF from './create_gif';
dotenv.config();
import path from 'path';
import express from 'express';
const app = express();

const port = process.env.GIF_PORT;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('app.ejs');
});

app.post('/create-gif', (req, res) => {
  res.readyState = 4;
  res.status = 200;
  res.send(JSON.stringify(req.body.frames));
  // const createdGif = GIF.makeGIF(width, height, reproduceSteps);
  // res.sendFile(createdGif);
});

app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
