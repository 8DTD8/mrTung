let Bank = require('../models/Bank');

module.exports = {
    getAll: async function (active) {
        let query = {};
        if (active !== undefined) query.active = active === 'true' || active === true;
        
        let banks = await Bank.find(query).sort({ createdAt: -1 });
        return banks;
    },

    getById: async function (id) {
        return await Bank.findById(id);
    },

    create: async function (bankData) {
        let bank = new Bank(bankData);
        await bank.save();
        return bank;
    },

    update: async function (id, bankData) {
        return await Bank.findByIdAndUpdate(
            id,
            bankData,
            { new: true, runValidators: true }
        );
    },

    delete: async function (id) {
        return await Bank.findByIdAndDelete(id);
    },

    toggleActive: async function (id) {
        let bank = await Bank.findById(id);
        if (!bank) {
            throw new Error('Bank not found');
        }

        bank.active = !bank.active;
        await bank.save();

        return bank;
    }
};
