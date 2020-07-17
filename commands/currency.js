const {currency, DBFile, prefix} = require('../config.json');
const Sequelize = require('sequelize');
const MentionHandler = require('../mentionHandler.js');
const mh = new MentionHandler();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DBFile, 
    logging: false
});

const Banks = sequelize.define('banks', 
{
    user: 
    {
        type: Sequelize.TEXT,
        unique: true
    },

    currency: 
    {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
});

Banks.sync();
//Banks.sync({force: true}); //Force recreating the database each time

/*
Takes a userID value and retrieves the currency of that user in the database, or adds them with a default of 0 if they are not already present
*/
async function getUserCurrency(userID)
{
    //Retrieve a user's bank
    console.log(`getting ${userID}'s bank`);
    const bank = await Banks.findOne({where: {user: userID}});

    if(bank)
    {
        return bank.currency;
    }else
    {
        //Create a bank for a user if one doesn't exist
        try
        {
            newBank = await Banks.create({
                user: userID,
                currency: 0
            });
            return 0;
        }catch(e)
        {
            if (e.name === 'SequelizeUniqueConstraintError') 
            {
                console.log('Error while attempting to add new user: that tag already exists. This shouldn\'t occur.');
                return -1;
            }

            console.log('Something went wrong when attempting to add a new user.');
        }
    }
}

//Sets a user's currency amount, or adds that user with the appropriate amount if they are not already in the database
async function setUserCurrency(userID, value)
{
    console.log(`setting ${userID} wealth to ${value}`);
    const affectedRows = await Banks.update({currency: value}, {where: {user: userID}});

    if(affectedRows <= 0)
    {
        //Create a bank for a user if one doesn't exist
        try
        {
            newBank = await Banks.create({
                user: userID,
                currency: value
            });
            return;
        }catch(e)
        {
            if (e.name === 'SequelizeUniqueConstraintError') 
            {
                console.log('Error while attempting to add new user: that tag already exists. This shouldn\'t occur.');
                return;
            }

            console.log('Something went wrong when attempting to add a new user.');
        }
    }
}

module.exports = 
{
    //To do: possibly rewrite to check how much currency another user has?
    amount: 
    {
        name: 'amount',
        aliases: ['$', 'muns'],
        argc: 0,
        usage: `${prefix}amount`,
        description: `Gets how many ${currency} you have.`,

        async execute(message, args)
        {
            const userWealth = await getUserCurrency(message.author.id);
            message.reply(`you have ${userWealth} ${currency}`)
        }
    },

    award:
    {
        name: 'award',
        aliases: [],
        argc: 2,
        usage: `${prefix}award <@User> <amount>`,
        description: `grants a user an amount of ${currency} (Mods Only).`,
        
        async execute(message, args)
        {
            const usr = message.channel.guild.member(message.author);
            if(!usr.hasPermission('ADMINISTRATOR') && !usr.hasPermission('KICK_MEMBERS'))
                return;
            const amount = parseInt(args[1]);

            if(isNaN(amount))
            {
                message.channel.send(`Correct usage: ${this.usage}`);
                console.log(typeof(args[1]));
                return;
            }
    
            const giftedUser = mh.getUserFromMention(args[0], message.client);

            if(!giftedUser || typeof giftedUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            const userWealth = await getUserCurrency(giftedUser.id);
            await setUserCurrency(giftedUser.id, userWealth + amount);
            message.channel.send(`Awarded ${giftedUser} ${amount} ${currency}`);
        }
    },

    give:
    {
        name: 'give',
        aliases: [],
        argc: 2,
        usage: `${prefix}give <@user> <amount>`,
        description: `gives a user an amount of your ${currency}.`,

        async execute(message, args)
        {
            const usr = message.author.id;
            const amount = parseInt(args[1]);

            if(isNaN(amount))
            {
                message.channel.send(`Correct usage: ${this.usage}`);
                console.log(typeof(args[1]));
                return;
            }

            if(amount < 1)
            {
                message.channel.send("Nice try.");
                return;
            }

            const giftedUser = mh.getUserFromMention(args[0], message.client);

            if(!giftedUser || typeof giftedUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            const gifterWealth = await getUserCurrency(usr);
            if(gifterWealth < amount)
            {
                message.reply(`you only have ${gifterWealth} ${currency}`);
                return;
            }

            await setUserCurrency(usr, gifterWealth - amount);
            const giftedWealth = await getUserCurrency(giftedUser.id);
            await setUserCurrency(giftedUser.id, giftedWealth + amount);
            message.channel.send(`Gave ${giftedUser} ${amount} ${currency}`);            
        }
    }
}