const {prefix} = require('../config.json');
const modes = ["sum", "hazelwood"];
var mode = "sum";

module.exports = 
{
    roll:
    {
        name: 'roll',
        aliases: ['dice'],
        argc: 1,
        usage: `${prefix}roll <X>d<Y>`,
        description: `rolls X dice with Y faces`,

        execute(message, args)
        {
            const diceParams = args[0].split('d');
            
            if(diceParams.length != 2)
            {
                message.channel.send(`Correct usage: ${this.usage}`);
                return;
            }

            let rolls = [];
            let numDice = parseInt(diceParams[0]);
            let numFaces = parseInt(diceParams[1]);

            if(isNaN(numDice) || isNaN(numFaces) || numDice < 1 || numFaces <= 1)
            {
                message.channel.send(`Correct usage: ${this.usage}`);
                return;
            }

            for(let i = 0; i < numDice; i++)
            {
                rolls.push(getRandomInt(numFaces) + 1);
            }

            message.channel.send(formatDice(rolls, mode));
        }
    },

    changemode:
    {
        name: 'mode',
        aliases: ['changemode'],
        argc: 1,
        usage: `${prefix}mode <mode>`,
        description: `Changes the dice rolling mode to the one provided`,

        execute(message, args)
        {
            let newMode = args[0].toLowerCase();

            if(!modes.includes(newMode))
            {
                let res = `No mode found for ${newMode}, possible options are: \n`;

                for(let i = 0; i < modes.length; i++)
                {
                    res += modes[i] + ", ";
                }

                res = res.slice(0, -2);
                message.channel.send(res);
                return;
            }

            mode = newMode;
            message.channel.send(`Okay, dice rolling mode set to ${mode}`);
        }
    }
}

function getRandomInt(max) 
{
    return Math.floor(Math.random() * Math.floor(max));
}

function formatDice(rolls, mode)
{
    switch(mode)
    {
        case "sum":
            return formatSum(rolls);
        case "hazelwood":
            return formatHazelwood(rolls);
        default: 
            return "No suitable format mode found!";
    }
}

function formatSum(rolls)
{
    var result = "";
    var sumTotal = 0;

    for(var i = 0; i < rolls.length; i++)
    {
        sumTotal += rolls[i];
        result += `${rolls[i]} + `;
    }

    result = result.slice(0, -2);

    result += `= ${sumTotal}`;
    return result;
}

function formatHazelwood(rolls)
{
    var result = "";
    var successes = 0;

    for(var i = 0; i < rolls.length; i++)
    {
        if(rolls[i] >= 5)
        {
            successes++;
            result += `Success (${rolls[i]}), `;
        }
        else if(rolls[i] == 1)
        {
            successes--;
            result += `Fizz! (${rolls[i]}), `;
        }else
        {
            result += `Mundane (${rolls[i]}), `;
        }
    }

    result += `**Spellpower: ${successes}**`;

    if(successes < 0)
    {
        result += `\nFizzle! Your fizzle roll is: ${getRandomInt(99) + 1}`
    }

    return result;
}