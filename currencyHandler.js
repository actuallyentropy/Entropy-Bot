const {DBFile} = require('./config.json');
const Sequelize = require('sequelize');

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

module.exports = class CurrencyHandler
{
    /*
    Takes a userID value and retrieves the currency of that user in the database, or adds them with a default of 0 if they are not already present
    */
    async getUserCurrency(userID)
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
                console.log(`creating new bank for user ${userID}`);
                const newBank = await Banks.create({
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

                console.log(`Something went wrong when attempting to add a new user: ${e}`);
            }
        }
    }

    //Sets a user's currency amount, or adds that user with the appropriate amount if they are not already in the database
    async setUserCurrency(userID, value)
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
}