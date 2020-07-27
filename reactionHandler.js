const {DBFile} = require('./config.json');
const Sequelize = require('sequelize');
const RoleHandler = require('./roleHandler.js');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DBFile, 
    logging: false
});

const MsgReacts = sequelize.define('msgreacts',
{
    message:
    {
        type: Sequelize.TEXT,
        unique: true
    },

    //describes what should be done if a reaction to this message is received 
    reactType:
    {
        type: Sequelize.TEXT,
        allowNull: false
    }
})

//MsgReacts.sync();
MsgReacts.sync({force: true}); //force recreating the database each time

module.exports = class ReactionHandler
{
    static async processReaction(reaction, user)
    {          
        const msg = await MsgReacts.findOne({where: {message: reaction.message.id}});
        const member = await reaction.message.guild.members.fetch(user);

        if(msg)
        {
            switch(msg.reactType)
            {
                case "role":
                    RoleHandler.roleFromReact(reaction.message, reaction.emoji.name, member);
                    return;
                default:
                    return;
            }
        }
    }

    static async newReactionTrigger(message, type)
    {
        try
        {
            await MsgReacts.create({
                message: message,
                reactType: type
            });
        }catch(e)
        {
            console.log(`Error when adding new reaction trigger: ${e}`);
        }
    }

    static async getReactType(message)
    {
        const reactLookup = await MsgReacts.findOne({where: {message: message}});

        if(reactLookup)
        {
            return reactLookup.reactType;
        }else
        {
            return "none";
        }
    }
}