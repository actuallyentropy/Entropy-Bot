const {currency, prefix} = require('../config.json');
const MentionHandler = require('../mentionHandler.js');
const CurrencyHandler = require('../currencyHandler.js');

module.exports = 
{
    //To do: possibly rewrite to check how much currency another user has?
    amount: 
    {
        name: 'amount',
        aliases: ['$', 'muns', 'money', 'cash'],
        argc: 0,
        usage: `${prefix}amount`,
        description: `Gets how many ${currency} you have.`,

        async execute(message, args)
        {
            const userWealth = await CurrencyHandler.getUserCurrency(message.author.id);
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
    
            const giftedUser = MentionHandler.getUserFromMention(args[0], message.client);

            if(!giftedUser || typeof giftedUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            const userWealth = await CurrencyHandler.getUserCurrency(giftedUser.id);
            await CurrencyHandler.setUserCurrency(giftedUser.id, userWealth + amount);
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

            const giftedUser = MentionHandler.getUserFromMention(args[0], message.client);

            if(!giftedUser || typeof giftedUser == 'undefined')
            {
                message.channel.send(`no user found: ${args[0]}. Please note you must mention a user in your message by typing @ and selecting their name.`);
                return;
            }

            const gifterWealth = await CurrencyHandler.getUserCurrency(usr);
            if(gifterWealth < amount)
            {
                message.reply(`you only have ${gifterWealth} ${currency}`);
                return;
            }

            await CurrencyHandler.setUserCurrency(usr, gifterWealth - amount);
            const giftedWealth = await CurrencyHandler.getUserCurrency(giftedUser.id);
            await CurrencyHandler.setUserCurrency(giftedUser.id, giftedWealth + amount);
            message.channel.send(`Gave ${giftedUser} ${amount} ${currency}`);            
        }
    },

    plant:
    {
        name: 'plant',
        aliases: [],
        argc: 1,
        usage: `${prefix}plant <amount>`,
        description: `Makes an amount of ${currency} available for other users to pick up.`,

        async execute(message, args)
        {
            const usr = message.author.id;
            const amount = parseInt(args[0]);

            if(isNaN(amount))
            {
                message.channel.send(`Correct usage: ${this.usage}`);
                console.log(typeof(args[0]));
                return;
            }

            if(amount < 1)
            {
                message.channel.send("Nice try.");
                return;
            }

            let planterWealth = await CurrencyHandler.getUserCurrency(usr);
            if(planterWealth < amount)
            {
                message.reply(`you only have ${planterWealth} ${currency}`);
                return;
            }
            await CurrencyHandler.setUserCurrency(usr, planterWealth - amount);

            const chnl = message.channel;
            message.delete();
            const plantMsg = await chnl.send(`${message.author} planted ${amount} ${currency}! type "pick" to pick it up!`);
            const filter = response => {return response.content.toLowerCase() === 'pick'};
            try
            {
                const claimer = await chnl.awaitMessages(filter, {max: 1, time: 3600000, errors: ['time']});
                plantMsg.delete();
                console.log(`pick claimed by ${claimer.first().author}`);
                const claimerWealth = await CurrencyHandler.getUserCurrency(claimer.first().author.id);
                await CurrencyHandler.setUserCurrency(claimer.first().author.id, claimerWealth + amount);
                const claimedMsg = await chnl.send(`${claimer.first().author} claimed ${amount} ${currency}`);
                //Cleanup
                claimer.first().delete();
                claimedMsg.delete({timeout: 3000}); 
            }catch(e)
            {
                plantMsg.delete();
                planterWealth = await CurrencyHandler.getUserCurrency(usr);
                await CurrencyHandler.setUserCurrency(usr, planterWealth + amount);
            }
        }
    }
}