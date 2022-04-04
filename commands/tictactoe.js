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

            let coords = m.content.split(' ').map(s => parseInt(s.trim()));
            board[coords[0]][coords[1]] = X;
            fastBoard[coords[0]][coords[1]] = 1;
            showBoard();

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
            board[move[0]][move[1]] = O;
            fastBoard[move[0]][move[1]] = 2;
            showBoard();

            if (ai.terminal(fastBoard)) {
                if (ai.winner(fastBoard)) {
                    message.channel.send("You lost!");
                } else {
                    message.channel.send("Tie!");
                }
                collector.stop();
                return;
            }
        });
    }
}
