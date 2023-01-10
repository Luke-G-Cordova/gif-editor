import GIFEncoder from 'gif-encoder-2';
import { createCanvas } from 'canvas';
import { writeFile } from 'fs';

const makeGIF = (width, height, frames, delay) => {
  canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const encoder = new GIFEncoder(width, height);
  encoder.setDelay(delay);
};
