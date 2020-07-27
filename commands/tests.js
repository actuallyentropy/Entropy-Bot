const {prefix} = require('../config.json');
const MentionHandler = require('../mentionHandler.js');
const mentionHandler = new MentionHandler();


module.exports = 
{
    ping: 
    {
        name: 'ping',
        aliases: [],
        argc: 0,
        usage: `${prefix}ping`,
        description: 'Checks for bot responsiveness.',
        execute(message, args)
        {
            message.channel.send('Working as expected!');
        }
    },

    echo:
    {
        name: 'echo',
        aliases: [],
        argc: -1,
        usage: `${prefix}echo (OPTIONAL) <anything> <anything> ...`,
        description: 'Tests arguments (Mods Only).',

        execute(message, args)
        {
            const usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;

            let response = "";

            for(let i in args)
            {
                response += i + " " + args[i] + " ";
            }

            message.channel.send(response);
        }
    },

    /*
    addrole:
    {
        name: 'addrole',
        aliases: [],
        argc: 2,
        usage: `${prefix}addrole <@user> <"rolename">`,
        description: `Grants a role (Mods Only, intended for testing).`,

        async execute(message, args)
        {
            const usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;

            const role = message.guild.roles.cache.find(role => role.name === args[1]);

            if(!role)
            {
                const errMsg = await message.channel.send(`Invalid role: ${args[1]}`);
                await errMsg.delete({timeout: 3000});
                return;
            }

            const toRole = await mentionHandler.getUserFromMention(args[0], message.client);
            if(!toRole || typeof toRole == 'undefined')
            {
                const errMsg = await message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                await errMsg.delete({timeout: 3000});
                return;
            }
            message.guild.member(toRole).roles.add(role);
        }
    }*/
}