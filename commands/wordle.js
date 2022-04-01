const fs = require('fs')

const answers = fs.readFileSync('resources/wordle/answers.txt', 'utf8').split('\r\n');
const valid = fs.readFileSync('resources/wordle/guesses.txt', 'utf8').split('\r\n').concat(answers);

function update(guesses) {
    return `You have ${guesses} guesses left.`;
}

module.exports = {
    name: 'wordle',
    execute(message, args) {
        let guesses = 6;
        const answer = answers[Math.floor(Math.random() * answers.length)];
        console.log(answer);

        message.channel.send("Starting game...");
        message.channel.send(update(guesses));
        
        const filter = m => {
            return m.author == message.author;
        }
        const collector = message.channel.createMessageCollector({ filter });

        collector.on('collect', m => {
            if (m.content == "quit") {
                message.channel.send("Ending game...");
                collector.stop();
                return;
            }

            if (m.content.length != 5) {
                message.channel.send("Please guess a 5-letter word.");
                return;
            }

            if (valid.findIndex(i => i.toLowerCase() == m.content.toLowerCase()) < 0) {
                message.channel.send("That is not a valid word.");
                return;
            }

            guesses--;

            let msg = '';
            for (let i = 0; i < 5; i++) {
                if (m.content[i] == answer[i]) {
                    msg += ":green_square:";
                } else if (answer.includes(m.content[i])) {
                    msg += ":yellow_square:";
                } else {
                    msg += ":white_large_square:";
                }
            }
            message.channel.send(msg);

            if (m.content == answer) {
                message.channel.send(`${answer} was the word!`);
                message.channel.send(`You got it in ${6 - guesses} guesses.`);
                message.channel.send("Ending game...");
                collector.stop();
                return;
            }

            if (guesses == 0) {
                message.channel.send("You ran out of guesses. Game over!");
                message.channel.send(`${answer} was the word.`);
                message.channel.send("Ending game...");
                collector.stop();
                return;
            }

            message.channel.send(update(guesses));
        })
    }
}