const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d');

const sideCanvas = document.getElementById('side-canvas')
const sideCanvasCtx = sideCanvas.getContext('2d');


// ----------------- CONSTANTS -----------------
const SHAPES = {
    // I
    'I':
        [
            [1, 1, 1, 1],
        ],
    // L
    'L':
        [
            [0, 0, 1],
            [1, 1, 1],
        ],
    // J
    'J':
        [
            [1, 1, 1],
            [0, 0, 1],
        ],
    // O
    'O':
        [
            [1, 1],
            [1, 1],
        ],
    // S
    'S':
        [
            [0, 1, 1],
            [1, 1, 0],
        ],
    //Z
    'Z':
        [
            [1, 1, 0],
            [0, 1, 1],
        ],
    // T
    'T':
        [
            [0, 1, 0],
            [1, 1, 1],
        ]
}

const COLORS = {
    'I': '#C6E2E7',
    'L': '#F89C74',
    'J': '#ADE1EF',
    'O': '#FAEDCB',
    'S': '#CDE5D9',
    'T': '#DFCFF3',
    'Z': '#F68BA2',
};

const CELL_SIZE = 40;

const ROWS = 20;
const COLS = 10;

const SIDEBAR_ROWS = 4;
const SIDEBAR_COLS = 6;

const STARTING_ROW = 0;

const CANVAS_WIDTH = COLS * CELL_SIZE;
const CANVAS_HEIGHT = ROWS * CELL_SIZE;

const SIDEBAR_WIDTH = SIDEBAR_COLS * CELL_SIZE;
const SIDEBAR_HEIGHT = SIDEBAR_ROWS * CELL_SIZE;


canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

sideCanvas.width = SIDEBAR_WIDTH;
sideCanvas.height = SIDEBAR_HEIGHT;

// ----------------- GAME STATE -----------------
let rand = Object.keys(SHAPES).at(getRandomIntInclusive(0, Object.keys(SHAPES).length - 1))
let randNext = Object.keys(SHAPES).at(getRandomIntInclusive(0, Object.keys(SHAPES).length - 1))

let currentShape = {
    shape: SHAPES[rand],
    color: COLORS[rand],
    row: STARTING_ROW,
    col: 5,
}

let nextShape = {
    shape: SHAPES[randNext],
    color: COLORS[randNext],
}

let gravityDt = 0;
let moveDt = 0;
let rotateDt = 0;
let gravitySpeed = 600;
let moveSpeed = 150;
let rotateSpeed = 200;

let score = 0;
let speed = 10;

let gameOver = false;

let keys = {};
// let dx = 0
// let dy = 1


let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let sidebarGrib = Array.from({ length: SIDEBAR_ROWS }, () => Array(SIDEBAR_COLS).fill(0));


// ----------------- HELPERS -----------------
function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function lockPiece() {
    for (let row = 0; row < currentShape.shape.length; row++) {
        for (let col = 0; col < currentShape.shape[row].length; col++) {
            if (currentShape.shape[row][col] === 0) continue;
            let r = row + currentShape.row
            let c = col + currentShape.col
            if (r <= 0) gameOver = true;
            grid[r][c] = currentShape.color;
        }
    }
}

function getRandomPiece() {
    // next is current
    let newCurrent = nextShape;
    //generate next random piece
    let randNext = Object.keys(SHAPES).at(getRandomIntInclusive(0, Object.keys(SHAPES).length - 1))
    nextShape = {
        shape: SHAPES[randNext],
        color: COLORS[randNext],
    }

    return {
        shape: newCurrent.shape,
        color: newCurrent.color,
        row: STARTING_ROW,
        col: 5,
    }
}

function isColliding(currentShape, direction = null) {
    for (let row = 0; row < currentShape.shape.length; row++) {
        for (let col = 0; col < currentShape.shape[row].length; col++) {
        
            if (currentShape.shape[row][col] === 0) continue;
            let r = row + currentShape.row
            let c = col + currentShape.col
            if (r < 0) continue

            if (r + 1 >= ROWS) {
                return true
            }
            if (grid[r + 1][c] !== 0) {
                return true
            }
            // MOVING RIGHT
            if (direction === 'right' && !(c + 1 >= COLS) && grid[r][c + 1] !== 0) {
                return true;
            }
            // MOVING LEFT
            if (direction === 'left' && !(c - 1 <= -1) && grid[r][c - 1] !== 0) {
                return true
            }
        }
    }
}

function handleCompletedRows() {
    for (let row = 0; row < grid.length; row++) {
        let allClear = true;
        grid[row].forEach(col => {
            if (col === 0) allClear = false
        });
        if (allClear) {
            grid.splice(row, 1);
            grid.unshift(Array(COLS).fill(0))
        }
    }
}

function rotateClockWise() {
    let transposed = {
        shape: [],
        row: currentShape.row,
        col: currentShape.col,
        color: currentShape.color,
    };
    let rows = currentShape.shape.length;
    let cols = currentShape.shape[0].length;
    // transpose shape
    for (let c = 0; c < cols; c++) {
        transposed.shape[c] = [];
        for (let r = 0; r < rows; r++) {
            transposed.shape[c][r] = currentShape.shape[r][c]
        }
    }
    // reverse  shape
    for (let r = 0; r < transposed.shape.length; r++) {
        transposed.shape[r].reverse();
    }

    //ensure no collision
    const initialCol = transposed.col;
    const possibilities = [0, -1, 1];
    for (let i = 0; i < possibilities.length; i++) {
        const possibility = possibilities[i];
        transposed.col = initialCol + possibility;
        if (!isColliding(transposed)) {
            currentShape = transposed;
            break;
        }
    }

    // if (!isColliding(transposed)) {
    //     currentShape.shape = transposed.shape;
    // } else {
    //     transposed.col -= 1
    //     if (!isColliding(transposed)) {
    //         currentShape = transposed;
    //     } else {
    //         transposed.col += 2
    //         if (!isColliding(transposed)) {
    //             currentShape = transposed;
    //         }
    //     }
    // }
}

function drawNexPiece() {
    sideCanvasCtx.fillStyle = 'gray'
    sideCanvasCtx.fillRect(0, 0, SIDEBAR_WIDTH, SIDEBAR_HEIGHT)

    // DRAW GRID
    sideCanvasCtx.fillStyle = 'white'
    for (let row = 0; row < sidebarGrib.length; row++) {
        for (let col = 0; col < sidebarGrib[row].length; col++) {
            sideCanvasCtx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
        }
    }

    // DRAW PIECE
    sideCanvasCtx.fillStyle = nextShape.color;
    for (let row = 0; row < nextShape.shape.length; row++) {
        for (let col = 0; col < nextShape.shape[row].length; col++) {
            if (nextShape.shape[row][col] === 0) continue;
            let r = row + 1
            let c = col + 1
            sideCanvasCtx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
        }
    }

}

// HADNLE KEYBOARD INPUT
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
})
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
})

function moveLeft() {
    if (moveDt > moveSpeed && !isColliding(currentShape, 'left')) {
        currentShape.col = Math.max(0, currentShape.col - 1)
        moveDt = 0;
    }
}

function moveRight() {
    if (moveDt > moveSpeed && !isColliding(currentShape, 'right')) {
        currentShape.col = Math.min(COLS - currentShape.shape[0].length, currentShape.col + 1)
        moveDt = 0;
    }
}

function handleKeys() {
    if (keys['ArrowLeft'] === true) {
        moveLeft();
    }
    if (keys['ArrowRight'] === true) {
        moveRight();
    }
    if (keys['ArrowUp'] === true) {
        //rotate
        if (rotateDt >= rotateSpeed) {
            rotateClockWise();
            rotateDt = 0;
        }
    }
}

// ----------------- UPDATE -----------------
function update(dt) {
    if (gameOver) return;
    gravityDt += dt
    moveDt += dt
    rotateDt += dt

    handleKeys(dt)
    handleCompletedRows();

    // CHECK COLLISION
    if (isColliding(currentShape)) {
        //lock piece
        lockPiece()
        //create new current piece
        currentShape = getRandomPiece();
        gravityDt -= 1
    }

    // MOVE PIECE
    let speed = keys['ArrowDown'] === true ? 50 : gravitySpeed;

    if (gravityDt >= speed) {
        //move down
        currentShape.row += 1;
        gravityDt = 0;
    }
}

// ----------------- DRAW -----------------
function draw() {

    ctx.fillStyle = 'gray'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    drawNexPiece();

    // DRAW GRID
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            ctx.fillStyle = grid[row][col] !== 0 ? grid[row][col] : 'white'
            ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
        }
    }

    let shadow = { ...currentShape }
    while (!isColliding(shadow)) {
        shadow.row += 1;
    }
    for (let row = 0; row < shadow.shape.length; row++) {
        for (let col = 0; col < shadow.shape[row].length; col++) {
            if (shadow.shape[row][col] === 0) continue;
            ctx.fillStyle = 'lightGray';
            let r = row + shadow.row
            let c = col + shadow.col
            ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
        }
    }
    // DRAW PIECE
    ctx.fillStyle = currentShape.color;
    for (let row = 0; row < currentShape.shape.length; row++) {
        for (let col = 0; col < currentShape.shape[row].length; col++) {
            if (currentShape.shape[row][col] === 0) continue;
            let r = row + currentShape.row
            let c = col + currentShape.col
            ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
        }
    }



}

// MAIN FUNCTION 
lt = 0
function loop(t) {
    let dt = (t - lt)
    lt = t;
    update(dt)
    draw();
    requestAnimationFrame(loop)
}
requestAnimationFrame(loop)