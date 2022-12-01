const canvas = document.querySelector('#myCanvas');
canvas.width = 800;
canvas.height = 800;
const ctx = canvas.getContext('2d');
ctx.lineWidth = 0.3;
const canvasSize = canvas.clientWidth;
let gridSize = 100;
let cellSize = 10;
const grid = [];
let gridPosX, gridPosY;

for (let i = 0; i < gridSize; i++) {
  grid.push([]);
  for (let j = 0; j < gridSize; j++) {
    grid[i].push(0);
  }
}

const drawGrid = (center, gridLines = false) => {
  if (gridPosX == null || gridPosY == null) {
    // const center = gridSize / 2;
    const amtVisibleSquaresToCenter = canvasSize / cellSize / 2;
    let leftBound = center - amtVisibleSquaresToCenter;
    leftBound = leftBound < 0 ? 0 : leftBound;
    let rightBound = center + amtVisibleSquaresToCenter;
    rightBound = rightBound >= gridSize ? gridSize : rightBound;
    for (let i = leftBound; i < rightBound; i++) {
      for (let j = leftBound; j < rightBound; j++) {
        const x = (i - (center - amtVisibleSquaresToCenter)) * cellSize;
        const y = (j - (center - amtVisibleSquaresToCenter)) * cellSize;
        if (gridLines) {
          ctx.strokeStyle = '#707070';
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }
  }
};

drawGrid(gridSize / 2, true);
