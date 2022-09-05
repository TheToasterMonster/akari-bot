import { Message } from "discord.js";

module.exports = {
    name: 'uwu',
    execute(message: Message, args: any[]) {
        message.reply('uwu');
    }
}