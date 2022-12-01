const canvas = document.querySelector('#myCanvas');
canvas.width = 800;
canvas.height = 800;
let [canvasX, canvasY] = [
  canvas.getBoundingClientRect().x,
  canvas.getBoundingClientRect().y,
];
const ctx = canvas.getContext('2d');
ctx.lineWidth = 0.3;
const canvasSize = canvas.clientWidth;
let gridSize = 200;
let cellSize = 4;
let amtVisibleSquaresToCenter = canvasSize / cellSize / 2;
let gridX = gridSize / 2;
let gridY = gridSize / 2;
const grid = [];
let gridPosX, gridPosY;

for (let i = 0; i < gridSize; i++) {
  grid.push([]);
  for (let j = 0; j < gridSize; j++) {
    grid[i].push(0);
  }
}
const clearGrid = () => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
};
const drawGrid = (centerX, centerY, gridLines = false) => {
  ctx.strokeStyle = '#707070';
  if (gridPosX == null || gridPosY == null) {
    // const center = gridSize / 2;
    let leftBound = Math.round(centerX - amtVisibleSquaresToCenter) - 1;
    let rightBound = Math.round(centerX + amtVisibleSquaresToCenter) + 1;
    let topBound = Math.round(centerY - amtVisibleSquaresToCenter) - 1;
    let bottomBound = Math.round(centerY + amtVisibleSquaresToCenter) + 1;
    leftBound = leftBound < 0 ? 0 : leftBound;
    rightBound = rightBound >= gridSize ? gridSize : rightBound;
    topBound = topBound < 0 ? 0 : topBound;
    bottomBound = bottomBound >= gridSize ? gridSize : bottomBound;
    for (let i = leftBound; i < rightBound; i++) {
      for (let j = topBound; j < bottomBound; j++) {
        const x = (i - (centerX - amtVisibleSquaresToCenter)) * cellSize;
        const y = (j - (centerY - amtVisibleSquaresToCenter)) * cellSize;

        // ctx.fillStyle = grid[i][j] === 0 ? 'black' : 'yellow';
        // ctx.fillRect(x, y, cellSize, cellSize);
        if (grid[i][j] != 0) {
          ctx.fillStyle = grid[i][j];
          ctx.fillRect(x, y, cellSize, cellSize);
        }
        if (gridLines) {
          ctx.beginPath();
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
          // ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }
  }
};

const moveGrid = (e) => {
  let ogX = e.clientX;
  let ogY = e.clientY;
  window.onmousemove = (ev) => {
    let newX = ev.clientX;
    let newY = ev.clientY;
    gridX -= (newX - ogX) / cellSize;
    gridY -= (newY - ogY) / cellSize;
    if (
      gridX - amtVisibleSquaresToCenter < 0 ||
      gridX + amtVisibleSquaresToCenter >= gridSize
    ) {
      gridX += (newX - ogX) / cellSize;
    }
    if (
      gridY - amtVisibleSquaresToCenter < 0 ||
      gridY + amtVisibleSquaresToCenter >= gridSize
    ) {
      gridY += (newY - ogY) / cellSize;
    }
    ogX = newX;
    ogY = newY;
  };
  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

const paintOnGrid = (e) => {
  let ogX = e.clientX;
  let ogY = e.clientY;
  let i = Math.floor(
    gridX - amtVisibleSquaresToCenter + (ogX - canvasX - 1) / cellSize
  );
  let j = Math.floor(
    gridY - amtVisibleSquaresToCenter + (ogY - canvasY - 1) / cellSize
  );
  grid[i][j] = 'black';
  window.onmousemove = (ev) => {
    let newX = ev.clientX;
    let newY = ev.clientY;

    i = Math.floor(
      gridX - amtVisibleSquaresToCenter + (newX - canvasX - 1) / cellSize
    );
    j = Math.floor(
      gridY - amtVisibleSquaresToCenter + (newY - canvasY - 1) / cellSize
    );
    grid[i][j] = 'black';

    ogX = newX;
    ogY = newY;
  };
  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

// update coordinates of canvas on resize
window.onresize = (e) => {
  const canvasRect = canvas.getBoundingClientRect();
  canvasX = canvasRect.x;
  canvasY = canvasRect.y;
};

// update cell size to control zoom level
window.onwheel = (e) => {
  const scrollDirection = Math.sign(e.deltaY);
  const amtScroll =
    cellSize <= 10 ? 32 : cellSize < 20 ? 8 : cellSize < 50 ? 4 : 2;
  if (scrollDirection < 0) {
    cellSize = canvasSize / (amtVisibleSquaresToCenter * 2 - amtScroll);
  } else {
    cellSize = canvasSize / (amtVisibleSquaresToCenter * 2 + amtScroll);
  }
  if (cellSize < 4) {
    cellSize = 4;
  } else if (cellSize >= 200) {
    cellSize = 200;
  }
  console.log(cellSize);
  amtVisibleSquaresToCenter = Math.round(canvasSize / cellSize / 2);

  if (gridX - amtVisibleSquaresToCenter < 0) {
    gridX = 0 + amtVisibleSquaresToCenter;
  } else if (gridX + amtVisibleSquaresToCenter >= gridSize) {
    gridX = gridSize - amtVisibleSquaresToCenter;
  }

  if (gridY - amtVisibleSquaresToCenter < 0) {
    gridY = 0 + amtVisibleSquaresToCenter;
  } else if (gridY + amtVisibleSquaresToCenter >= gridSize) {
    gridY = gridSize - amtVisibleSquaresToCenter;
  }
};

const nullifyUsedEventListeners = () => {
  window.onmousedown = null;
  window.onmousemove = null;
  window.onmouseup = null;
};

const setTool = (tool) => {
  switch (tool) {
    case 'move':
      nullifyUsedEventListeners();
      window.onmousedown = moveGrid;
      break;
    case 'paint':
      nullifyUsedEventListeners();
      window.onmousedown = paintOnGrid;
      break;
  }
};

setInterval(() => {
  clearGrid();
  drawGrid(gridX, gridY, true);
}, 1);

setTool('move');
