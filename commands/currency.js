const {currency, prefix} = require('../config.json');
const MentionHandler = require('../mentionHandler.js');
const mentionHandler = new MentionHandler();
const CurrencyHandler = require('../currencyHandler.js');
const currencyHandler = new CurrencyHandler();

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
            const userWealth = await currencyHandler.getUserCurrency(message.author.id);
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
    
            const giftedUser = mentionHandler.getUserFromMention(args[0], message.client);

            if(!giftedUser || typeof giftedUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            const userWealth = await currencyHandler.getUserCurrency(giftedUser.id);
            await currencyHandler.setUserCurrency(giftedUser.id, userWealth + amount);
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

            const giftedUser = mentionHandler.getUserFromMention(args[0], message.client);

            if(!giftedUser || typeof giftedUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            const gifterWealth = await currencyHandler.getUserCurrency(usr);
            if(gifterWealth < amount)
            {
                message.reply(`you only have ${gifterWealth} ${currency}`);
                return;
            }

            await currencyHandler.setUserCurrency(usr, gifterWealth - amount);
            const giftedWealth = await currencyHandler.getUserCurrency(giftedUser.id);
            await currencyHandler.setUserCurrency(giftedUser.id, giftedWealth + amount);
            message.channel.send(`Gave ${giftedUser} ${amount} ${currency}`);            
        }
    }
}