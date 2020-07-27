const {DBFile, currency} = require('./config.json');
const Sequelize = require('sequelize');
const CurrencyHandler = require('./currencyHandler.js');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DBFile, 
    logging: false
});

const RoleReacts = sequelize.define('roleReacts',
{
    //The message the item in this store belongs to
    message:
    {
        type: Sequelize.TEXT,
        allowNull: false
    },

    role:
    {
        type: Sequelize.TEXT,
        allowNull: false
    },

    //react used to trigger this role
    react:
    {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

const RoleStore = sequelize.define('roleStore',
{
    //Number used for displaying and buying roles
    roleNumber:
    {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    role:
    {
        type: Sequelize.TEXT,
        allowNull: false
    },

    price:
    {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

//RoleStore.sync();
RoleStore.sync({force: true}); //force recreating the database each time
//RoleReacts.sync();
RoleReacts.sync({force: true});

module.exports = class RoleHandler
{
    static async addRoleToStore(role, price, creator)
    {
        try
        {
            const roleNo = await RoleStore.max('roleNumber');

            await RoleStore.create({
               role: role.name,
               roleNumber: roleNo + 1,
               price: price
            });
        }catch(e)
        {
            creator.send(`Something went wrong when adding a role to the role store: ${e}`);
        }
    }

    static async addRoleToMenu(message, role, react, creator)
    {
        console.log(`Adding to role menu ${message.id} ${role.name} ${react}`);
        try
        {
            await RoleReacts.create({
            message: message.id,
            role: role.name,
            react: react
            });
        }catch(e)
        {
            creator.send(`Something went wrong when adding a role to the role menu: ${e}`);
        }
    }

    static async roleFromReact(message, react, member)
    {
        console.log(`Looking up role for ${message.id} with react ${react}`);
        const roleLookup = await RoleReacts.findOne({where: {message: message.id, react: react}});

        if(roleLookup)
        {
            console.log(`granting ${member.name} ${roleLookup.role}`);
            const role = message.guild.roles.cache.find(role => role.name === roleLookup.role);

            if(!role)
            {
                console.log(`Role does not exist: ${roleLookup.role}`);
                return;
            }

            member.roles.add(role);
        }else
        {
            console.log(`Request made for a react that isn't available: ${react}`);
        }
    }

    static async buyRole(roleNumber, message)
    {
        const roleLookup = await RoleStore.findOne({where: {roleNumber: roleNumber}});

        if(roleLookup)
        {
            const role = message.guild.roles.cache.find(role => role.name === roleLookup.role);

            if(!role)
            {
                console.log(`Role does not exist: ${roleLookup.role}`);
                return;
            }

            const usrCurrency = await CurrencyHandler.getUserCurrency(message.author.id);

            if(usrCurrency < roleLookup.price)
            {
                message.reply(`You don't have enough ${currency}`);
                return;
            }

            message.member.roles.add(role);
            await CurrencyHandler.setUserCurrency(message.author.id, usrCurrency - roleLookup.price);
        }
    }
}