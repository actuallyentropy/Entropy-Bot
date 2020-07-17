//Manage the bot while live
const fs = require('fs');
const Discord = require('discord.js');
const {prefix} = require('../config.json');

module.exports = 
{
    reloadscripts: 
    {
        name: 'reloadscripts',
        aliases: [],
        argc: -1,
        usage: `${prefix}reloadscripts (OPTIONAL) <script1> <script2> ...`,
        description: 'Reloads specified command files, or all scripts if no scripts are named (Mods Only).',

        execute(message, args)
        {
            let usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;

            let client = message.client;

            //reload all scripts
            if(args.length === 0)
            {
                client.commands = new Discord.Collection();
                const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

                for(const file of commandFiles)
                {
                    try
                    {
                        delete require.cache[require.resolve(`./${file}`)];
                    }catch(err) {}

                    const commandSet = require(`./${file}`);

                    for(const cmd in commandSet)
                    {
                        client.commands.set(commandSet[cmd].name, commandSet[cmd]);
                    }
                }
            }else
            {
                for(let arg in args)
                {
                    try
                    {
                        delete require.cache[require.resolve(`./${args[arg]}`)]
                    }catch(err) {}

                    const commandSet = require(`./${args[arg]}`);

                    for(const cmd in commandSet)
                    {
                        client.commands.set(commandSet[cmd].name, commandSet[cmd]);
                    }
                }
            }

            console.log("scripts reloaded");
            message.reply("reload complete");
        }
    },

    help:
    {
        name: 'help',
        aliases: ['commands'],
        argc: -1,
        usage: `${prefix}help (OPTIONAL) <command>`,
        description: 'returns a list of commands, or information about a specific command.',

        execute(message, args)
        {
            if(args.length > 1)
            {
                message.channel.send("Please limit requests to one command at a time.");
                return;
            }

            if(args.length === 0)
            {
                let commands = message.client.commands.array();
                let results = "";

                for(let i in commands)
                {
                    results += commands[i].name + ", ";
                }

                message.channel.send(results.substr(0, results.length - 2));
                return;
            }

            let command = message.client.commands.get(args[0]) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

            if(!command)
            {
                message.channel.send("command with name " + args[0] + " wasn't found");
                return;
            }

            let results = command.name + " ";

            if(command.aliases.length != 0)
            {
                results += "(";

                for(let i in command.aliases)
                {
                    results += command.aliases[i] + ", ";
                }

                results = results.substr(0, results.length - 2) + ")";
            }

            results += `\n${command.description}\n`;
            results += `usage: ${command.usage}\n`;

            message.channel.send(results);
        }
    }
}