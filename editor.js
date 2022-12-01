const canvas = document.querySelector('#myCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let [canvasX, canvasY] = [
  canvas.getBoundingClientRect().x,
  canvas.getBoundingClientRect().y,
];
const ctx = canvas.getContext('2d');
const toolButtons = document.querySelectorAll('input.toolButton');
toolButtons.forEach((tool) => {
  tool.onchange = () => {
    if (tool.checked) {
      setTool(tool.dataset.tn);
    }
  };
});
ctx.lineWidth = 0.3;
const canvasSize = canvas.clientWidth;
let gridSize = 1000;
let cellSize = 15;
let amtVisibleSquaresToCenterW = canvas.clientWidth / cellSize / 2;
let amtVisibleSquaresToCenterH = canvas.clientHeight / cellSize / 2;
let gridX = gridSize / 2;
let gridY = gridSize / 2;
const grid = [];
let gridPosX, gridPosY;
let currentPaintColor = 'black';

for (let i = 0; i < gridSize; i++) {
  grid.push([]);
  for (let j = 0; j < gridSize; j++) {
    grid[i].push(0);
  }
}
const clearGrid = () => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
};
const drawGrid = (centerX, centerY, gridLines = false) => {
  ctx.strokeStyle = '#707070';
  if (gridPosX == null || gridPosY == null) {
    // const center = gridSize / 2;
    let leftBound = Math.round(centerX - amtVisibleSquaresToCenterW) - 1;
    let rightBound = Math.round(centerX + amtVisibleSquaresToCenterW) + 1;
    let topBound = Math.round(centerY - amtVisibleSquaresToCenterH) - 1;
    let bottomBound = Math.round(centerY + amtVisibleSquaresToCenterH) + 1;
    leftBound = leftBound < 0 ? 0 : leftBound;
    rightBound = rightBound >= gridSize ? gridSize : rightBound;
    topBound = topBound < 0 ? 0 : topBound;
    bottomBound = bottomBound >= gridSize ? gridSize : bottomBound;
    for (let i = leftBound; i < rightBound; i++) {
      for (let j = topBound; j < bottomBound; j++) {
        const x = (i - (centerX - amtVisibleSquaresToCenterW)) * cellSize;
        const y = (j - (centerY - amtVisibleSquaresToCenterH)) * cellSize;
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
    let xOnCanvas = newX - canvasX;
    let yOnCanvas = newY - canvasY;
    if (
      xOnCanvas > 0 &&
      xOnCanvas < canvas.clientWidth &&
      yOnCanvas > 0 &&
      yOnCanvas < canvas.clientHeight
    ) {
      gridX -= (newX - ogX) / cellSize;
      gridY -= (newY - ogY) / cellSize;
      if (
        gridX - amtVisibleSquaresToCenterW < 0 ||
        gridX + amtVisibleSquaresToCenterW >= gridSize
      ) {
        gridX += (newX - ogX) / cellSize;
      }
      if (
        gridY - amtVisibleSquaresToCenterH < 0 ||
        gridY + amtVisibleSquaresToCenterH >= gridSize
      ) {
        gridY += (newY - ogY) / cellSize;
      }
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
  let xOnCanvas = ogX - canvasX;
  let yOnCanvas = ogY - canvasY;
  if (
    xOnCanvas > 0 &&
    xOnCanvas < canvas.clientWidth &&
    yOnCanvas > 0 &&
    yOnCanvas < canvas.clientHeight
  ) {
    let i = Math.floor(
      gridX - amtVisibleSquaresToCenterW + (ogX - canvasX - 1) / cellSize
    );
    let j = Math.floor(
      gridY - amtVisibleSquaresToCenterH + (ogY - canvasY - 1) / cellSize
    );
    grid[i][j] = currentPaintColor;
  }
  window.onmousemove = (ev) => {
    let newX = ev.clientX;
    let newY = ev.clientY;

    let xOnCanvas = newX - canvasX;
    let yOnCanvas = newY - canvasY;
    if (
      xOnCanvas > 0 &&
      xOnCanvas < canvas.clientWidth &&
      yOnCanvas > 0 &&
      yOnCanvas < canvas.clientHeight
    ) {
      i = Math.floor(
        gridX - amtVisibleSquaresToCenterW + (newX - canvasX - 1) / cellSize
      );
      j = Math.floor(
        gridY - amtVisibleSquaresToCenterH + (newY - canvasY - 1) / cellSize
      );
      grid[i][j] = currentPaintColor;
    }
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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  amtVisibleSquaresToCenterW = canvas.clientWidth / cellSize / 2;
  amtVisibleSquaresToCenterH = canvas.clientHeight / cellSize / 2;
};

// update cell size to control zoom level
window.onwheel = (e) => {
  const scrollDirection = Math.sign(e.deltaY);
  const amtScroll =
    cellSize <= 10 ? 32 : cellSize < 20 ? 8 : cellSize < 50 ? 4 : 2;
  let [cSize, avstc] = [
    Math.min(canvas.clientWidth, canvas.clientHeight),
    canvas.clientWidth < canvas.clientHeight
      ? amtVisibleSquaresToCenterW
      : amtVisibleSquaresToCenterH,
  ];
  if (scrollDirection < 0) {
    cellSize = cSize / (avstc * 2 - amtScroll);
  } else {
    cellSize = cSize / (avstc * 2 + amtScroll);
  }
  if (cellSize <= cSize / gridSize + 1 && cellSize > 0) {
    cellSize = cSize / gridSize + 1;
  } else if (cellSize >= 200 || cellSize < 0) {
    cellSize = 200;
  }
  amtVisibleSquaresToCenterW = canvas.clientWidth / cellSize / 2;
  amtVisibleSquaresToCenterH = canvas.clientHeight / cellSize / 2;

  if (gridX - amtVisibleSquaresToCenterW <= 0) {
    gridX = 0 + amtVisibleSquaresToCenterW;
  } else if (gridX + amtVisibleSquaresToCenterW > gridSize) {
    gridX = gridSize - amtVisibleSquaresToCenterW;
  }

  if (gridY - amtVisibleSquaresToCenterH <= 0) {
    gridY = 0 + amtVisibleSquaresToCenterH;
  } else if (gridY + amtVisibleSquaresToCenterH > gridSize) {
    gridY = gridSize - amtVisibleSquaresToCenterH;
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
      currentPaintColor = 'black';
      nullifyUsedEventListeners();
      window.onmousedown = paintOnGrid;
      break;
    case 'erase':
      nullifyUsedEventListeners();
      currentPaintColor = 0;
      window.onmousedown = paintOnGrid;
      break;
  }
};

setInterval(() => {
  clearGrid();
  drawGrid(gridX, gridY, cellSize >= 15);
}, 1);

setTool('paint');
