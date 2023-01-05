import * as dotenv from 'dotenv';
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

app.post('/', (req, res) => {});

app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
