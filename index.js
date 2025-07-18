const boxes = document.querySelectorAll(".box");
const gameInfo = document.querySelector(".game-info");
const newGameBtn = document.querySelector(".btn");
const modeButtons = document.querySelectorAll(".mode-btn");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const difficultySelector = document.querySelector(".difficulty-selector");
const wrapper = document.querySelector(".wrapper");

let currentPlayer;
let gameGrid;
let gameMode = "player"; // "player" or "computer"
let difficulty = "easy"; // "easy", "medium", "hard"

const winningPositions = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

// Mode selection
modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        modeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        gameMode = btn.dataset.mode;
        
        if (gameMode === "computer") {
            difficultySelector.classList.add("active");
            wrapper.classList.add("computer-mode");
        } else {
            difficultySelector.classList.remove("active");
            wrapper.classList.remove("computer-mode");
        }
        
        initGame();
    });
});

// Difficulty selection
difficultyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        difficultyButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        difficulty = btn.dataset.difficulty;
        initGame();
    });
});

function initGame() {
    currentPlayer = "X";
    gameGrid = ["","","","","","","","",""];
    
    boxes.forEach((box, index) => {
        box.innerText = "";
        boxes[index].style.pointerEvents = "all";
        box.classList = `box box${index+1}`;
    }); 
    
    newGameBtn.classList.remove("active");
    
    if (gameMode === "player") {
        gameInfo.innerText = `Current Player - ${currentPlayer}`;
    } else {
        gameInfo.innerText = `Your Turn - ${currentPlayer}`;
    }
}

function swapTurn() {
    if(currentPlayer === "X") {
        currentPlayer = "O";
    } else {
        currentPlayer = "X";
    }
    
    if (gameMode === "player") {
        gameInfo.innerText = `Current Player - ${currentPlayer}`;
    } else {
        gameInfo.innerText = `Your Turn - ${currentPlayer}`;
    }
}

function checkGameOver() {
    let answer = "";

    winningPositions.forEach((position) => {
        if( (gameGrid[position[0]] !== "" || gameGrid[position[1]] !== "" || gameGrid[position[2]] !== "" )
        && (gameGrid[position[0]] === gameGrid[position[1]] ) && (gameGrid[position[1]] === gameGrid[position[2]] ))  {
            if(gameGrid[position[0]] === "X")
                answer = "X";
            else
                answer = "O";

            boxes.forEach((box) => {
                box.style.pointerEvents = "none";
            })

            boxes[position[0]].classList.add("win");
            boxes[position[1]].classList.add("win");
            boxes[position[2]].classList.add("win");
        }
    });

    if(answer !== "" ) {
        if (gameMode === "computer") {
            gameInfo.innerText = answer === "X" ? "You Win!" : "Computer Wins!";
        } else {
            gameInfo.innerText = `Winner Player - ${answer}`;
        }
        newGameBtn.classList.add("active");
        return true;
    }

    let fillCount = 0;
    gameGrid.forEach((box) => {
        if(box !== "" )
            fillCount++;
    }); 

    if(fillCount === 9) {
        gameInfo.innerText = "Game Tied !";
        newGameBtn.classList.add("active");
        return true;
    }

    return false;
}

function getEmptyBoxes() {
    return gameGrid.map((box, index) => box === "" ? index : null).filter(val => val !== null);
}

function minimax(grid, depth, isMaximizing) {
    // Check for terminal states
    let result = checkWinner(grid);
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (getEmptyBoxes().length === 0) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (grid[i] === "") {
                grid[i] = "O";
                let score = minimax(grid, depth + 1, false);
                grid[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (grid[i] === "") {
                grid[i] = "X";
                let score = minimax(grid, depth + 1, true);
                grid[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(grid) {
    for (let position of winningPositions) {
        if (grid[position[0]] !== "" && 
            grid[position[0]] === grid[position[1]] && 
            grid[position[1]] === grid[position[2]]) {
            return grid[position[0]];
        }
    }
    return null;
}

function computerMove() {
    gameInfo.innerText = "Computer is thinking...";
    
    setTimeout(() => {
        let move;
        
        if (difficulty === "easy") {
            // Easy: Random move
            const emptyBoxes = getEmptyBoxes();
            move = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
        } else if (difficulty === "medium") {
            // Medium: 70% optimal, 30% random
            if (Math.random() < 0.7) {
                move = getBestMove();
            } else {
                const emptyBoxes = getEmptyBoxes();
                move = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
            }
        } else {
            // Hard: Always optimal
            move = getBestMove();
        }
        
        if (move !== undefined) {
            gameGrid[move] = "O";
            boxes[move].innerText = "O";
            boxes[move].style.pointerEvents = "none";
            
            if (!checkGameOver()) {
                swapTurn();
            }
        }
    }, 500);
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    
    for (let i = 0; i < 9; i++) {
        if (gameGrid[i] === "") {
            gameGrid[i] = "O";
            let score = minimax(gameGrid, 0, false);
            gameGrid[i] = "";
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function handleClick(index) {
    if(gameGrid[index] === "" ) {
        boxes[index].innerHTML = currentPlayer;
        gameGrid[index] = currentPlayer;
        boxes[index].style.pointerEvents = "none";
        
        if (!checkGameOver()) {
            swapTurn();
            
            if (gameMode === "computer" && currentPlayer === "O") {
                computerMove();
            }
        }
    }
}

boxes.forEach((box, index) => {
     box.addEventListener("click", () => {
        if (gameMode === "player" || (gameMode === "computer" && currentPlayer === "X")) {
            handleClick(index);
        }
     })
});

newGameBtn.addEventListener("click", initGame);

// Initialize game
initGame();