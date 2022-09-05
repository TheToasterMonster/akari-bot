import { Message } from "discord.js";

const fs = require('fs')

const answers: string[] =
    fs.readFileSync('resources/wordle/answers.txt', 'utf8')
    .split('\r').join(',')
    .split('\n').join(',')
    .split(',')
    .filter((i: any) => i);
const valid: string[] =
    fs.readFileSync('resources/wordle/guesses.txt', 'utf8')
    .split('\r').join(',')
    .split('\n').join(',')
    .split(',')
    .concat(answers)
    .filter((i: any) => i).sort();

function search(arr: any[], val: any) {
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

function update(guesses: number) {
    return `You have ${guesses} guesses left.`;
}

function print(previous_guesses: string[]) {
    return "Your previous guesses:\n" + previous_guesses.join("\n");
}

function letters(yellow: Set<string>, grey: Set<string>, unused: Set<string>) {
    return "Word contains: " + Array.from(yellow).join(' ') + '\n'
         + "Word does not contain: " + Array.from(grey).join(' ') + '\n'
         + "Not guessed: " + Array.from(unused).join(' ');
}

module.exports = {
    name: 'wordle',
    execute(message: Message, args: any[]) {
        let guesses: number = 6;
        const answer: string = answers[Math.floor(Math.random() * answers.length)];
        console.log(answer);
        
        let prev: string[] = [];
        let yellow: Set<string> = new Set();
        let grey: Set<string> = new Set();
        let unused: Set<string> = new Set('abcdefghijklmnopqrstuvwxyz'.toUpperCase());

        message.channel.send("Starting game...");
        message.channel.send(update(guesses));
        
        const filter = (m: Message) => {
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
                    yellow.add(m.content[i].toUpperCase());
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

            // message.channel.send(print(prev));
            message.channel.send(letters(yellow, grey, unused));
            message.channel.send(update(guesses));
        });
    }
}