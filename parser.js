const Discord = require('discord.js');
const fs = require('fs');

module.exports = class Parser
{
    //accepts a discord.js client, and a database directory to create a DBHandler with
    constructor(client, dbdirectory)
    {
        this.client = client;
        this.loadCommands(true);
    }

    //Expects a discord.js message object
    execute(message, prefix)
    {
        if(message.channel.type !== 'text')
        {
            message.channel.send("This bot doesn't accept DMs- sorry!");
        }

        const args = []; //message.content.slice(prefix.length).match(/\S+|"(?:\\"|[^"])+"/g);
        let inQuotes = false;
        var arg = "";
        
        //Get spaced arguments, or whole statements in quotation marks as a single argument
        for(let i = prefix.length; i < message.content.length; i++)
        {
            if(message.content.charAt(i) === ' ')
            {
                if(inQuotes)
                {
                    arg += ' ';
                }else
                {
                    if(arg !== '')
                    {
                        args.push(arg);
                        arg = "";
                    }
                }
            }else if(message.content.charAt(i) === '"')
            {
                inQuotes = !inQuotes;
            }else
            {
                arg += message.content.charAt(i);
            }
        }

        if(inQuotes)
        {
            message.channel.send("Message contains unclosed quotation marks.");
            return;
        }

        if(arg !== '')
        {
            args.push(arg);
        }

        if(args.length == 0)
            return;

        const commandName = args.shift().toLowerCase();

        const command = this.client.commands.get(commandName) || this.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if(!command)
        {
            console.log("command with name " + commandName + " wasn't found");
            return;
        }

        if(command.argc != -1 && args.length != command.argc)
        {
            console.log("improper arguments for " + command.name);
            message.channel.send(`Correct usage is: ${command.usage}`);
            return;
        }

        try
        {
            command.execute(message, args);
        } catch (error)
        {
            console.error(error);
            message.reply('Sorry, something went wrong. Please let Entropy know what happened.');
        }
    }

    loadCommands()
    {
        this.client.commands = new Discord.Collection();
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

        for(const file of commandFiles)
        {
            const commandSet = require(`./commands/${file}`);
            console.log(`opened file ${file}`);

            for(const cmd in commandSet)
            {
                console.log("got command " + commandSet[cmd].name);
                this.client.commands.set(commandSet[cmd].name, commandSet[cmd]);
            }
        }
    }
}