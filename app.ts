import { Message } from "discord.js";

const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
    ]
});

// https://v12.discordjs.guide/command-handling/#reading-command-files
client.commands = new Discord.Collection();
const commandFiles: string[] = fs.readdirSync('./commands').filter((file: string) => file.endsWith('.ts'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

require('dotenv').config();



client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message: Message) => {
    if (!message.content.startsWith(process.env.PREFIX!) || message.author.bot) return;

    const args = message.content.slice(process.env.PREFIX!.length).trim().split(/ +/);
    const command = args.shift()!.toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

client.login(process.env.TOKEN);
