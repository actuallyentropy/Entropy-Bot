const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token, DBFile} = require('./config.json');

const Parser = require('./parser.js');
const parser = new Parser(client, DBFile);

client.login(token);

client.on('ready', () => 
{
    console.log(`logged in as ${client.user.tag}`);
});

client.on('message', message => 
{
    if(!message.content.startsWith(prefix) || message.content.length == prefix.length || message.author.bot)
        return;

    console.log("caught a command: " + message.content);
    parser.execute(message, prefix);
});