function initial_state() {
    return [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
}

function deepcopy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function player(board) {
    let x_count = 0;
    let o_count = 0;

    for (let row of board) {
        for (let square of row) {
            if (square == 1) {
                x_count++;
            } else if (square == 2) {
                o_count++;
            }
        }
    }

    if (x_count == o_count) {
        return 1;
    } else {
        return 2;
    }
}

function actions(board) {
    let squares = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] == 0) {
                squares.push([i, j]);
            }
        }
    }
    return squares;
}

function result(board, action) {
    let new_board = deepcopy(board);
    new_board[action[0]][action[1]] = player(board);
    return new_board;
}

function winner(board) {
    let potential_winner = player(board) == 2 ? 1 : 2;

    for (let n = 0; n < 3; n++) {
        let row = new Set();
        for (let j = 0; j < 3; j++) {
            row.add(board[n][j]);
        }
        if (row.size == 1 && !row.has(0)) {
            return potential_winner;
        }

        let column = new Set();
        for (let i = 0; i < 3; i++) {
            column.add(board[i][n]);
        }
        if (column.size == 1 && !column.has(0)) {
            return potential_winner;
        }
    }

    let diagonal1 = new Set([board[0][0], board[1][1], board[2][2]]);
    if (diagonal1.size == 1 && !diagonal1.has(0)) {
        return potential_winner;
    }
    let diagonal2 = new Set([board[0][2], board[1][1], board[2][0]]);
    if (diagonal2.size == 1 && !diagonal2.has(0)) {
        return potential_winner;
    }

    return 0;
}

function terminal(board) {
    if (winner(board)) {
        return true;
    }

    for (let row of board) {
        for (let square of row) {
            if (square == 0) {
                return false;
            }
        }
    }

    return true;
}

function utility(board) {
    let victor = winner(board);
    if (victor == 1) {
        return 1;
    } else if (victor == 2) {
        return -1;
    } else {
        return 0;
    }
}

function maximize(board, curr_lowest) {
    if (terminal(board)) {
        return utility(board);
    }

    let curr_max = -2;
    for (let action of actions(board)) {
        let new_score = minimize(result(board, action), curr_max);
        curr_max = Math.max(curr_max, new_score);

        if (new_score >= curr_lowest) {
            return new_score;
        }
    }

    return curr_max;
}

function minimize(board, curr_highest) {
    if (terminal(board)) {
        return utility(board);
    }

    let curr_min = 2;
    for (let action of actions(board)) {
        let new_score = maximize(result(board, action), curr_min);
        curr_min = Math.min(curr_min, new_score);

        if (new_score <= curr_highest) {
            return new_score;
        }
    }

    return curr_min;
}

function minimax(board) {
    let moves = actions(board);

    let curr_lowest = 2;
    let index = -1;
    for (let i = 0; i < moves.length; i++) {
        let val = maximize(result(board, moves[i]), 2);
        if (val < curr_lowest) {
            curr_lowest = val;
            index = i;
        }
    }

    return moves[index];
}

module.exports = {
    minimax,
    winner,
    terminal
};