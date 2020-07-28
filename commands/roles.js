const {prefix} = require('../config.json');
const ReactionHandler = require('../reactionHandler.js');
const RoleHandler = require('../roleHandler.js');
const emojiRegex = require('emoji-regex');

module.exports = 
{
    newRoleMenu: 
    {
        name: 'newrolemenu',
        aliases: ['newmenu'],
        argc: 0,
        usage: `${prefix}newrolemenu`,
        description: 'Creates a new empty role menu (Mods Only).',

        async execute(message, args)
        {
            const usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;

            const menuMessage = await message.channel.send('No roles yet!');
            ReactionHandler.newReactionTrigger(menuMessage.id, "role");
            message.author.send(`A new role menu was created! you can add a reaction to it using the ${prefix}addrolereact command with ` +
            `the menu message ID (${menuMessage.id}), followed by an emoji to react, a description, and the role that should be added.\nEx: ` +
            `${prefix}addrolereact ${menuMessage.id} :smile: "role name" "role description"`);
            message.delete();
        }
    },
    
    addrolereact:
    {
        name: 'addrolereact',
        aliases: [],
        argc: 4,
        usage: `${prefix}addrolereact <role menu ID> <emoji> <"role name"> <"description">`,
        description: `Adds a role react option to an existing role menu (Mods Only).`,

        async execute(message, args)
        {
            await message.delete();
            const usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;

            const reactType = await ReactionHandler.getReactType(args[0]);
            if(reactType != "role")
            {
                console.log(`Message is not a role menu: ${reactType}`);
                return;
            }
            
            let menuMsg;
            try
            {
                menuMsg = await message.channel.messages.fetch(args[0]);
            }catch(e)
            {
                console.log(`failed to retrieve menu message: ${e}`);
                return;
            }

            console.log(args[1].length);
            let match = emojiRegex().exec(args[1]);
            //for unicode emoji
            if(match)
            {
                const role = message.guild.roles.cache.find(role => role.name === args[2]);

                if(!role)
                {
                    const errMsg = await message.channel.send(`Invalid role: ${args[2]}`);
                    await errMsg.delete({timeout: 3000});
                    return;
                }

                RoleHandler.addRoleToMenu(menuMsg, role, args[1], message.author);

                if(menuMsg.content === 'No roles yet!')
                {
                    await menuMsg.edit(`${args[1]} ${args[3]}`);
                }else
                {
                    await menuMsg.edit(`${menuMsg.content}\n${args[1]} ${args[3]}`);
                }
                
                menuMsg.react(args[1]);
                return;
            }

            if(args[1].length < 3)
            {
                const errMsg = await message.channel.send(`Invalid emoji`);
                errMsg.delete({timeout: 5000});
                return;
            }

            const emojiParts = args[1].split(':');            
            if(emojiParts.length != 3)
            {
                const errMsg = await message.channel.send(`Invalid emoji`);
                errMsg.delete({timeout: 5000});
                return;
            }

            const emojiName = emojiParts[1];
            console.log(`validating ${emojiName}`);
            const emojiValidate = message.guild.emojis.cache.find(emoji => emoji.name === emojiName);

            if(!emojiValidate)
            {
                const errMsg = await message.channel.send(`Invalid emoji`);
                errMsg.delete({timeout: 5000});
                return;
            }

            const role = message.guild.roles.cache.find(role => role.name === args[2]);

            if(!role)
            {
                const errMsg = await message.channel.send(`Invalid role: ${args[2]}`);
                await errMsg.delete({timeout: 3000});
                return;
            }

            RoleHandler.addRoleToMenu(menuMsg, role, emojiName, message.author);

            if(menuMsg.content === 'No roles yet!')
            {
                await menuMsg.edit(`${args[1]} ${args[3]}`);
            }else
            {
                await menuMsg.edit(`${menuMsg.content}\n${args[1]} ${args[3]}`);
            }

            menuMsg.react(emojiValidate);
        }
    }
}