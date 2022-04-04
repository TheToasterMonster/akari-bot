const fs = require('fs')

const answers = fs.readFileSync('resources/wordle/answers.txt', 'utf8').split('\r').join(',').split('\n').join(',').split(',').filter(i => i);
const valid = fs.readFileSync('resources/wordle/guesses.txt', 'utf8').split('\r').join(',').split('\n').join(',').split(',').concat(answers).filter(i => i).sort();

function search(arr, val) {
    let L = 0, R = arr.length - 1;
    while (R - L >= 0) {
        let mid = L + Math.floor((R - L) / 2);
        if (arr[mid] < val) {
            L = mid + 1;
        } else if (arr[mid] > val) {
            R = mid - 1;
        } else {
            return true;
        }
    }
    return false;
}

function update(guesses) {
    return `You have ${guesses} guesses left.`;
}

function print(previous_guesses) {
    return "Your previous guesses:\n" + previous_guesses.join("\n");
}

function letters(green, yellow, grey, unused) {
    return "Green: " + Array.from(green).join(' ') + '\n'
         + "Yellow: " + Array.from(yellow).join(' ') + '\n'
         + "Grey: " + Array.from(grey).join(' ') + '\n'
         + "Unused: " + Array.from(unused).join(' ');
}

module.exports = {
    name: 'wordle',
    execute(message, args) {
        let guesses = 6;
        const answer = answers[Math.floor(Math.random() * answers.length)];
        console.log(answer);
        
        let prev = [];
        let green = new Set();
        let yellow = new Set();
        let grey = new Set();
        let unused = new Set('abcdefghijklmnopqrstuvwxyz'.toUpperCase());

        message.channel.send("Starting game...");
        message.channel.send(update(guesses));
        
        const filter = m => {
            return m.author == message.author;
        }
        const collector = message.channel.createMessageCollector({ filter });

        collector.on('collect', m => {
            if (m.content == "quit") {
                message.channel.send(`The word was ${answer}.`);
                message.channel.send("Ending game...");
                collector.stop();
                return;
            }

            if (m.content.length != 5) {
                message.channel.send("Please guess a 5-letter word.");
                return;
            }

            if (!search(valid, m.content.toLowerCase())) {
                message.channel.send("That is not a valid word.");
                return;
            }

            guesses--;

            let msg = '';
            let guess_results = '';
            for (let i = 0; i < 5; i++) {
                if (m.content[i] == answer[i]) {
                    msg += ":green_square:";
                    guess_results += `**${m.content[i].toUpperCase()}** `;
                    green.add(m.content[i].toUpperCase());
                    yellow.delete(m.content[i].toUpperCase());
                } else if (answer.includes(m.content[i])) {
                    msg += ":yellow_square:";
                    guess_results += `${m.content[i].toUpperCase()} `;
                    yellow.add(m.content[i].toUpperCase());
                } else {
                    msg += ":white_large_square:";
                    guess_results += `~~${m.content[i].toUpperCase()}~~ `;
                    grey.add(m.content[i].toUpperCase());
                }
                unused.delete(m.content[i].toUpperCase());
            }
            prev.push(guess_results);
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
                message.channel.send(`The word was ${answer}.`);
                message.channel.send("Ending game...");
                collector.stop();
                return;
            }

            message.channel.send(update(guesses));
            // message.channel.send(print(prev));
            message.channel.send(letters(green, yellow, grey, unused));
        });
    }
}