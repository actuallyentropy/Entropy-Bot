const {DBFile, prefix, strikeLimit} = require('../config.json');
const Sequelize = require('sequelize');
const MentionHandler = require('../mentionHandler.js');
const mentionHandler = new MentionHandler();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DBFile, 
    logging: false
});

const Strikes = sequelize.define('strikes', 
{
    user:
    {
        type: Sequelize.TEXT,
        allowNull: false
    },

    reason:
    {
        type: Sequelize.TEXT,
        allowNull: false
    },

    time:
    {
        type: Sequelize.INTEGER,
        default: 0,
        allowNull: false 
    },

    expiration:
    {
        type: Sequelize.INTEGER,
        default: 0,
        allowNull: false
    },
    
    giver:
    {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

Strikes.sync();
//Strikes.sync({force: true}); //force recreating the database for testing

async function addStrike(userID, reason, time, expiration, giver)
{
    console.log(`adding strike: ${userID} ${reason} ${time} ${expiration} ${giver}`);
    try
    {
        await Strikes.create({
            user: userID,
            reason: reason,
            time: time,
            expiration: expiration,
            giver: giver
        });

        return;
    }catch(e)
    {
        console.log(`An error occurred while logging an added strike with parameters: ${userID} ${reason} ${time} ${expiration} ${giver}`);
        return;
    }
} 

module.exports = 
{
    strike:
    {
        name: 'strike',
        aliases: [],
        argc: 2,
        usage: `${prefix}strike <@user> <"reason">`,
        description: 'Gives a user a strike for the provided reason (Mods Only).',

        async execute(message, args)
        {
            const usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;

            const struckUser = mentionHandler.getUserFromMention(args[0], message.client);
            if(!struckUser || typeof struckUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }
            
            let time = new Date();
            let expr = new Date(time.setMonth(time.getMonth() + 6));
            time = Date.now();

            await addStrike(struckUser.id, args[1], time, expr, usr.id);
            //clear expired strikes and get the user's active strike count
            await Strikes.destroy({where: {expiration: {$lte: expr}}});
            const strikeCount = await Strikes.count({where: {user: struckUser.id}});
            
            if(strikeCount >= strikeLimit)
            {
                message.guild.members.ban(struckUser);
                message.channel.send(`${struckUser} was banned for exceeding the strike limit.`);
            }else
            {
                message.channel.send(`Strike logged.`);
            }         
        }
    },

    getStrikes:
    {
        name: 'getstrikes',
        aliases: ['getstrike', 'strikes', 'checkstrikes', 'checkstrike'],
        argc: 1,
        usage: `${prefix}getstrikes <@user>`,
        description: `Retrieves a list of a user's strikes (Mods Only).`,

        async execute(message, args)
        {
            const usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;
            
            const struckUser = mentionHandler.getUserFromMention(args[0], message.client);
            if(!struckUser || typeof struckUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            //don't retrieve strikes that have expired
            await Strikes.destroy({where: {expiration: {$lte: new Date()}}});
            const strikes = await Strikes.findAll({where: {user: struckUser.id}, raw: true});
            
            let out = "";
            for(strike of strikes)
            {
                console.log(strike);
                out += `Given by: <@${strike.giver}>\nReason: ${strike.reason}\nTime given: ${new Date(strike.time)}\nExpires on: ${new Date(strike.expiration)}\n\n`;
            }

            if(strikes.length == 0)
                message.channel.send(`No strikes found!`);
            else
                message.channel.send(`${out}`);
        }
    },

    wipeStrikes:
    {
        name: 'wipestrikes',
        aliases: ['wipestrike', 'clearstrikes', 'clearstrike', 'removestrikes', 'removestrike'],
        argc: 1,
        usage: `${prefix}wipestrikes <@user>`,
        description: `Removes all strikes from a user (Mods Only).`,

        async execute(message, args)
        {
            let usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;
            
            const struckUser = mentionHandler.getUserFromMention(args[0], message.client);
            if(!struckUser || typeof struckUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            await Strikes.destroy({where: {user: struckUser.id}});
            message.channel.send(`Strike record wiped for ${struckUser}`);
        }
    }
}