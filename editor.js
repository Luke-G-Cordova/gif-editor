const canvas = document.querySelector('#myCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let [canvasX, canvasY] = [
  canvas.getBoundingClientRect().x,
  canvas.getBoundingClientRect().y,
];
const ctx = canvas.getContext('2d');
const toolbar = document.querySelector('div.toolbar');
const toolButtons = document.querySelectorAll('input.toolButton');
let gridLines = true;
toolButtons.forEach((tool) => {
  if (tool.type === 'radio') {
    tool.onchange = () => {
      if (tool.checked) {
        setTool(tool.dataset.tn);
      }
    };
  } else if (tool.type === 'checkbox') {
    tool.onchange = () => {
      if (tool.checked) {
        gridLines = false;
      } else {
        gridLines = true;
      }
    };
  } else if (tool.type === 'button') {
    tool.onclick = () => {
      setTool(tool.dataset.tn);
    };
  } else {
    tool.oninput = () => {
      savePaintColor = tool.value;
      setTool(lastTool);
      // setTool(tool.value);
    };
  }
});
ctx.lineWidth = 0.3;
let gridSize = 1000;
let cellSize = 15;
let amtVisibleSquaresToCenterW = canvas.clientWidth / cellSize / 2;
let amtVisibleSquaresToCenterH = canvas.clientHeight / cellSize / 2;
let gridX = gridSize / 2;
let gridY = gridSize / 2;
let grid = [];
let everyFrame = [];
let currentFrame = 0;
const history = [];
let future = [];
let gridPosX, gridPosY;
let currentPaintColor = 'black';
let savePaintColor = 'black';
let lastTool = 'paint';
let curMatrix = {
  mat: [],
  cMat: [],
  x: 0,
  y: 0,
};

for (let i = 0; i < gridSize; i++) {
  grid.push([]);
  for (let j = 0; j < gridSize; j++) {
    grid[i].push(0);
  }
}
everyFrame.push(grid);
const emptyFrame = JSON.parse(JSON.stringify(grid));
const updateHistory = () => {
  if (future.length > 0) {
    future = [];
  }
  if (history.length < 80) {
    history.push(JSON.stringify(grid));
  }
};
updateHistory();
const undo = () => {
  if (history.length > 1) {
    future.push(JSON.stringify(grid));
    grid = JSON.parse(history.pop());
    everyFrame[currentFrame] = grid;
  }
};
const redo = () => {
  if (future.length > 0) {
    history.push(JSON.stringify(grid));
    grid = JSON.parse(future.pop());
    everyFrame[currentFrame] = grid;
  }
};

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
const clearMatrix = (matrix, cMat, x, y) => {
  x = Math.round(x);
  y = Math.round(y);
  for (let i = 0; i < cMat.length; i++) {
    for (let j = 0; j < cMat[0].length; j++) {
      if (cMat[i][j] != 0) {
        if (matrix[i][j] === cMat[i][j]) {
          grid[x + i][y + j] = 0;
        } else {
          grid[x + i][y + j] = cMat[i][j];
        }
      }
    }
  }
};
const appendMatrix = (matrix, x, y) => {
  x = Math.round(x);
  y = Math.round(y);
  let cMat = [];
  for (let i = 0; i < matrix.length; i++) {
    cMat.push([]);
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] != 0) {
        if (grid[x + i][y + j] != 0) {
          if (grid[x + i][y + j] === matrix[i][j]) {
            cMat[i].push(0);
          } else {
            cMat[i].push(grid[x + i][y + j]);
          }
        } else {
          cMat[i].push(matrix[i][j]);
        }
        grid[x + i][y + j] = matrix[i][j];
      } else {
        cMat[i].push(0);
      }
    }
  }
  return cMat;
};
const getMatrix = () => {
  let box = document.querySelector('div.snipBox');
  let x = Math.round(
    box.offsetLeft / cellSize + (gridX - amtVisibleSquaresToCenterW)
  );
  let y = Math.round(
    box.offsetTop / cellSize + (gridY - amtVisibleSquaresToCenterH)
  );
  let w = Math.round(box.offsetWidth / cellSize + x);
  let h = Math.round(box.offsetHeight / cellSize + y);
  let matrix = [];
  let cMat = [];
  for (let i = x; i < w; i++) {
    matrix.push([]);
    cMat.push([]);
    for (let j = y; j < h; j++) {
      cMat[cMat.length - 1].push(grid[i][j]);
      matrix[matrix.length - 1].push(grid[i][j]);
    }
  }
  return [matrix, cMat, x, y];
};

const moveGrid = (e) => {
  document.body.style.cursor = 'grabbing';
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
    document.body.style.cursor = 'grab';
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

const select = (e) => {
  updateHistory();
  window.onmousedown = null;
  e.path[0].style.cursor = 'grabbing';
  let ogX = e.clientX;
  let ogY = e.clientY;
  window.onmousemove = (ev) => {
    let moveX = ev.clientX - ogX;
    let moveY = ev.clientY - ogY;

    e.path[0].style.top = e.path[0].offsetTop + moveY + 'px';
    e.path[0].style.left = e.path[0].offsetLeft + moveX + 'px';
    ogX = ev.clientX;
    ogY = ev.clientY;
    clearMatrix(curMatrix.mat, curMatrix.cMat, curMatrix.x, curMatrix.y);
    curMatrix.x =
      e.path[0].offsetLeft / cellSize + (gridX - amtVisibleSquaresToCenterW);
    curMatrix.y =
      e.path[0].offsetTop / cellSize + (gridY - amtVisibleSquaresToCenterH);
    curMatrix.cMat = appendMatrix(curMatrix.mat, curMatrix.x, curMatrix.y);
  };
  e.path[0].onmouseup = (ev) => {
    window.onmousedown = snip;
    window.onmousemove = null;
    e.path[0].onmouseup = null;
    e.path[0].style.cursor = 'grab';
    clearMatrix(curMatrix.mat, curMatrix.cMat, curMatrix.x, curMatrix.y);
    curMatrix.x =
      e.path[0].offsetLeft / cellSize + (gridX - amtVisibleSquaresToCenterW);
    curMatrix.y =
      e.path[0].offsetTop / cellSize + (gridY - amtVisibleSquaresToCenterH);
    curMatrix.cMat = appendMatrix(curMatrix.mat, curMatrix.x, curMatrix.y);
  };
};

const snip = (e) => {
  let box = document.querySelector('div.snipBox');
  box.style.display = 'block';
  box.style.width = 0;
  box.style.height = 0;

  box.style.left = e.clientX + 'px';
  box.style.top = e.clientY + 'px';
  box.onmousedown = select;
  let ogX = e.clientX;
  let ogY = e.clientY;

  // let xOnCanvas = ogX - canvasX;
  // let yOnCanvas = ogY - canvasY;
  window.onmousemove = (ev) => {
    let bW = ev.clientX - ogX;
    let bH = ev.clientY - ogY;
    box.style.width = Math.abs(bW) + 'px';
    box.style.height = Math.abs(bH) + 'px';
    if (bW < 0) {
      box.style.left = ev.clientX + 'px';
    }
    if (bH < 0) {
      box.style.top = ev.clientY + 'px';
    }
  };
  window.onmouseup = (ev) => {
    window.onmousemove = null;
    window.onmouseup = null;
    let [matrix, clear, x, y] = [...getMatrix()];
    if (matrix.every((val) => val.every((val1) => val1 === 0))) {
      box.style.display = 'none';
      box.style.width = '0px';
      box.style.height = '0px';
    } else {
      curMatrix.mat = matrix;
      curMatrix.cMat = clear;
      curMatrix.x = x;
      curMatrix.y = y;
    }
  };
};

const paintOnGrid = (e) => {
  updateHistory();
  let ogX = e.clientX;
  let ogY = e.clientY;
  let xOnCanvas = ogX - canvasX;
  let yOnCanvas = ogY - canvasY;
  let ogI, ogJ;
  if (
    xOnCanvas > 0 &&
    xOnCanvas < canvas.clientWidth &&
    yOnCanvas > 0 &&
    yOnCanvas < canvas.clientHeight
  ) {
    ogI = Math.floor(
      gridX - amtVisibleSquaresToCenterW + (ogX - canvasX - 1) / cellSize
    );
    ogJ = Math.floor(
      gridY - amtVisibleSquaresToCenterH + (ogY - canvasY - 1) / cellSize
    );
    grid[ogI][ogJ] = currentPaintColor;
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
      // if (Math.abs(ogI - i) > 1 || Math.abs(ogJ - j) > 1) {
      drawLine(ogI, ogJ, i, j);
      // }
      ogI = i;
      ogJ = j;
    }
    ogX = newX;
    ogY = newY;
  };
  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

const drawLine = (x1, y1, x2, y2) => {
  // y = mx + b;
  let dx = x2 - x1;
  let dy = y2 - y1;
  if (dx === 0) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      grid[x1][y] = currentPaintColor;
    }
  } else if (dy === 0) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      grid[x][y1] = currentPaintColor;
    }
  } else {
    let m = dy / dx;
    let b = (m * x1 - y1) * -1;
    if (Math.abs(dy) >= Math.abs(dx)) {
      let calc = (y) => (y - b) / m;
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        let x = calc(y);
        grid[Math.round(x)][Math.round(y)] = currentPaintColor;
      }
    } else {
      let calc = (x) => m * x + b;
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        let y = calc(x);
        grid[Math.round(x)][Math.round(y)] = currentPaintColor;
      }
    }
  }
};

const fill = (e) => {
  updateHistory();
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
    let x = Math.floor(
      gridX - amtVisibleSquaresToCenterW + (ogX - canvasX - 1) / cellSize
    );
    let y = Math.floor(
      gridY - amtVisibleSquaresToCenterH + (ogY - canvasY - 1) / cellSize
    );
    try {
      recursiveFill(x, y, grid[x][y]);
    } catch (e) {
      console.error('you tried to fill too big of an area');
    }
  }
};

const recursiveFill = (i, j, whatToFill) => {
  grid[i][j] = currentPaintColor;
  if (grid[i][j - 1] === whatToFill) {
    recursiveFill(i, j - 1, whatToFill);
  }
  if (grid[i][j + 1] === whatToFill) {
    recursiveFill(i, j + 1, whatToFill);
  }
  if (grid[i - 1][j] === whatToFill) {
    recursiveFill(i - 1, j, whatToFill);
  }
  if (grid[i + 1][j] === whatToFill) {
    recursiveFill(i + 1, j, whatToFill);
  }
};

window.onkeydown = (e) => {
  if (e.ctrlKey) {
    switch (e.key) {
      case 'z':
        setTool('undo');
        break;
      case 'y':
        setTool('redo');
        break;
    }
  }
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
  let box = document.querySelector('div.snipBox');
  box.style.display = 'none';
};

const setFrame = (index) => {
  if (index < 0 || index > everyFrame.length) {
    console.error(
      `No frame exists for index ${index}. There are ${everyFrame.length} frames`
    );
  } else {
    currentFrame = index;
    grid = everyFrame[currentFrame];
  }
};

const setTool = (tool) => {
  switch (tool) {
    case 'move':
      document.body.style.cursor = 'grab';
      nullifyUsedEventListeners();
      window.onmousedown = moveGrid;

      toolbar.onmousedown = () => {
        window.onmousedown = null;
        window.onmouseup = () => {
          window.onmousedown = moveGrid;
          window.onmouseup = null;
        };
      };
      lastTool = 'move';
      break;
    case 'paint':
      document.body.style.cursor = 'auto';
      currentPaintColor = savePaintColor;
      nullifyUsedEventListeners();
      window.onmousedown = paintOnGrid;

      toolbar.onmousedown = () => {
        window.onmousedown = null;
        window.onmouseup = () => {
          window.onmousedown = paintOnGrid;
          window.onmouseup = null;
        };
      };
      lastTool = 'paint';
      break;
    case 'erase':
      document.body.style.cursor = 'auto';
      nullifyUsedEventListeners();
      currentPaintColor = 0;
      window.onmousedown = paintOnGrid;
      toolbar.onmousedown = () => {
        window.onmousedown = null;
        window.onmouseup = () => {
          window.onmousedown = paintOnGrid;
          window.onmouseup = null;
        };
      };
      lastTool = 'erase';
      break;
    case 'snip':
      nullifyUsedEventListeners();
      window.onmousedown = snip;
      toolbar.onmousedown = () => {
        window.onmousedown = null;
        window.onmouseup = () => {
          window.onmousedown = snip;
          window.onmouseup = null;
        };
      };
      lastTool = 'snip';
      break;
    case 'fill':
      currentPaintColor = savePaintColor;
      nullifyUsedEventListeners();
      window.onmousedown = fill;
      lastTool = 'fill';
      break;
    case 'undo':
      undo();
      setTool(lastTool);
      break;
    case 'redo':
      redo();
      setTool(lastTool);
      break;
    case 'newFrame':
      grid = JSON.parse(JSON.stringify(emptyFrame));
      everyFrame.push(grid);
      setTool(lastTool);
      currentFrame++;
      break;
    case 'nextFrame':
      if (currentFrame < everyFrame.length - 1) {
        currentFrame++;
        setFrame(currentFrame);
      }
      break;
    case 'prevFrame':
      if (currentFrame > 0) {
        currentFrame--;
        setFrame(currentFrame);
      }
      break;
    default:
      savePaintColor = tool;
      setTool('paint');
      break;
  }
};

let DRAW_GRID = setInterval(() => {
  clearGrid();
  drawGrid(gridX, gridY, cellSize >= 15 && gridLines);
}, 1);

setTool('paint');
