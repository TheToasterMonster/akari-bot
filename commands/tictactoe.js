const ai = require('../resources/tictactoe/ai');

module.exports = {
    name: 'tictactoe',
    execute(message, args) {
        const X = ":regional_indicator_x:";
        const O = ":regional_indicator_o:";
        const EMPTY = ":blue_square:";

        let board = [
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY]
        ];

        // 0 - empty, 1 - X, 2 - O
        let fastBoard = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];

        const showBoard = () => {
            let msg = '';
            msg += board[0].join('') + '\n';
            msg += board[1].join('') + '\n';
            msg += board[2].join('');
            message.channel.send(msg);
        }

        showBoard();
        message.channel.send(
            "Welcome to Tic Tac Toe! The objective is to get 3 X's or O's in " +
            "a row, column, or diagonal. Move by inputting the column (1-3, " +
            "left-right) followed by the row (1-3, down-up) of the square you " +
            "wish to claim, separated by a space."
        );

        let acquiredMode = false;
        let isX = true;
        message.channel.send("Do you want to play as X or O?");

        const filter = m => {
            return m.author == message.author;
        }
        const collector = message.channel.createMessageCollector({ filter });
        collector.on('collect', m => {
            if (m.content == 'quit') {
                message.channel.send("Ending game...");
                collector.stop();
                return;
            }

            if (!acquiredMode) {
                if (m.content.toUpperCase() == 'O') {
                    isX = false;
                    message.channel.send("Thinking...");
                    let move = ai.minimax(fastBoard);
                    makeMove(move, 1);
                } else if (m.content.toUpperCase() != 'X') {
                    message.channel.send("That's not a valid choice.");
                    return;
                }
                message.channel.send("Your turn!");
                acquiredMode = true;
                return;
            }

            let coords = m.content.split(' ').map(s => parseInt(s.trim()) - 1);
            if (isNaN(coords[0]) || isNaN(coords[1])) {
                return;
            }
            convert(coords);
            if (coords[0] < 0 || coords[0] > 2 || coords[1] < 0 || coords[1] > 2) {
                message.channel.send("That's not a valid square.");
                return;
            }
            if (fastBoard[coords[0]][coords[1]] != 0) {
                message.channel.send("That square is already taken.");
                return;
            }
            makeMove(coords, isX ? 1 : 2);

            if (ai.terminal(fastBoard)) {
                if (ai.winner(fastBoard)) {
                    message.channel.send("You won!");
                } else {
                    message.channel.send("Tie!");
                }
                collector.stop();
                return;
            }

            message.channel.send("Thinking...");
            let move = ai.minimax(fastBoard);
            makeMove(move, isX ? 2 : 1);

            if (ai.terminal(fastBoard)) {
                if (ai.winner(fastBoard)) {
                    message.channel.send("You lost!");
                } else {
                    message.channel.send("Tie!");
                }
                collector.stop();
                return;
            }
            message.channel.send("Your turn!");
        });

        const makeMove = (move, player) => {
            board[move[0]][move[1]] = player == 1 ? X : O;
            fastBoard[move[0]][move[1]] = player;
            showBoard();
        }

        const convert = (input) => {
            let tmp = input[0];
            input[0] = 2 - input[1];
            input[1] = tmp;
        }
    }
}
