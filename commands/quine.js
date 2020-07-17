const {prefix} = require('../config.json');

module.exports = 
{
    quine:
    {
        name: 'quine',
        aliases: [],
        argc: 0,
        usage: `${prefix}quine`,
        description: `outputs the file this command is stored in.`,

        execute(message, args)
        {
            message.channel.send(`\`\`\`const {prefix} = require('../config.json');

module.exports = 
{
    quine:
    {
        name: 'quine',
        aliases: [],
        argc: 0,
        usage: \`\${prefix}quine\`,
         description: \`outputs the file this command is stored in.\`,

        ${arguments.callee.toString()}
    }
}\`\`\``);
        }
    }
}