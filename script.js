const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d');


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

const CANVAS_WIDTH = COLS * CELL_SIZE;
const CANVAS_HEIGHT = ROWS * CELL_SIZE;


canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ----------------- GAME STATE -----------------
let rand = Object.keys(SHAPES).at(getRandomIntInclusive(0, Object.keys(SHAPES).length - 1))
// let Nextrand = Object.keys(SHAPES).at(getRandomIntInclusive(0, Object.keys(SHAPES).length))

let currentShape = {
    shape: SHAPES[rand],
    color: COLORS[rand],
    row: 0,
    col: 5,
}
let nextShape = {
}

let gravityDt = 0;
let moveDt = 0;
let gravitySpeed = 500;
let moveSpeed = 150;

let score = 0;
let speed = 10;
let isSpedUp = false;

let keys = {};
// let dx = 0
// let dy = 1


let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
console.log(grid)


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
            grid[r][c] = currentShape.color;
        }
    }
    console.log(grid)
}

function getRandomPiece() {
    let rand = Object.keys(SHAPES).at(getRandomIntInclusive(0, Object.keys(SHAPES).length - 1))
    return {
        shape: SHAPES[rand],
        color: COLORS[rand],
        row: 0,
        col: 5,
    }
}

function isColliding(direction = null) {
    for (let row = 0; row < currentShape.shape.length; row++) {
        for (let col = 0; col < currentShape.shape[row].length; col++) {
            if (currentShape.shape[row][col] === 0) continue;
            let r = row + currentShape.row
            let c = col + currentShape.col
            if (r + 1 >= ROWS) {
                return true
            }
            if (grid[r + 1][c] !== 0) {
                return true
            }
            // MOVING RIGHT
            if (direction = 'right' && !c + 1 >= COLS && grid[r][c + 1] !== 0) {
                return true
            }
            // MOVING LEFT
            if (direction = 'left' && !c - 1 <= -1 && grid[r][c - 1] !== 0) {
                return true
            }
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
    if (moveDt > moveSpeed && !isColliding('left')) {
        currentShape.col = Math.max(0, currentShape.col - 1)
        moveDt = 0;
    }
}

function moveRight() {
    if (moveDt > moveSpeed && !isColliding('right')) {
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
    }
}

// ----------------- UPDATE -----------------
function update(dt) {
    gravityDt += dt
    moveDt += dt
    handleKeys(dt)
    // CHECK COLLISION
    if (isColliding()) {
        //lock piece
        lockPiece()

        //create new current piece
        currentShape = getRandomPiece();
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
    // DRAW GRID
    ctx.fillStyle = 'white'
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === 0) {
                ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
            }
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