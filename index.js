import GIFEncoder from 'gif-encoder-2';
import { createCanvas } from 'canvas';
import { writeFile } from 'fs';

const size = 200;
const half = size / 2;

const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

function drawBackground() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
}

const encoder = new GIFEncoder(size, size);
encoder.setDelay(500);
encoder.start();

drawBackground();
ctx.fillStyle = '#ff0000';
ctx.fillRect(0, 0, half, half);
encoder.addFrame(ctx);

drawBackground();
ctx.fillStyle = '#00ff00';
ctx.fillRect(half, 0, half, half);
encoder.addFrame(ctx);

drawBackground();
ctx.fillStyle = '#0000ff';
ctx.fillRect(half, half, half, half);
encoder.addFrame(ctx);

drawBackground();
ctx.fillStyle = '#ffff00';
ctx.fillRect(0, half, half, half);
encoder.addFrame(ctx);

encoder.finish();

const buffer = encoder.out.getData();

writeFile('media/example.gif', buffer, (error) => {
  console.log(error);
});
