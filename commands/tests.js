const {prefix} = require('../config.json');

module.exports = 
{
    ping: 
    {
        name: 'ping',
        alises: [],
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
        description: 'Tests arguments.',

        execute(message, args)
        {
            let response = "";

            for(let i in args)
            {
                response += i + " " + args[i] + " ";
            }

            message.channel.send(response);
        }
    }
}