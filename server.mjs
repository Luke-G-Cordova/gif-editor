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
  const reproduceSteps = req.params.reproduceSteps;
  const width = req.params.width;
  const height = req.params.height;
  res.readyState = 4;
  res.status = 200;
  // const createdGif = GIF.makeGIF(width, height, reproduceSteps);
  // res.sendFile(createdGif);
});

app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
