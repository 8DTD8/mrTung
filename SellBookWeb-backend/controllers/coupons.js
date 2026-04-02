let Coupon = require('../models/Coupon');

module.exports = {
    getAll: async function (page, size, active, search) {
        let query = {};

        if (active !== undefined) query.active = active === 'true';
        if (search) {
            query.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let coupons = await Coupon.find(query)
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(parseInt(size));

        let total = await Coupon.countDocuments(query);

        return {
            coupons,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                totalPages: Math.ceil(total / size)
            }
        };
    },

    getById: async function (id) {
        return await Coupon.findById(id);
    },

    getByCode: async function (code) {
        return await Coupon.findOne({ code: code.toUpperCase() });
    },

    create: async function (couponData) {
        let coupon = new Coupon(couponData);
        await coupon.save();
        return coupon;
    },

    update: async function (id, couponData) {
        return await Coupon.findByIdAndUpdate(
            id,
            couponData,
            { new: true, runValidators: true }
        );
    },

    delete: async function (id) {
        return await Coupon.findByIdAndDelete(id);
    },

    validate: async function (code, orderAmount) {
        let coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            throw new Error('Coupon not found');
        }

        if (!coupon.active) {
            throw new Error('Coupon is inactive');
        }

        if (coupon.startDate && new Date() < coupon.startDate) {
            throw new Error('Coupon is not yet valid');
        }

        if (coupon.endDate && new Date() > coupon.endDate) {
            throw new Error('Coupon has expired');
        }

        if (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage) {
            throw new Error('Coupon usage limit reached');
        }

        if (coupon.minimumAmount && orderAmount < coupon.minimumAmount) {
            throw new Error(`Minimum order amount is ${coupon.minimumAmount}`);
        }

        return { valid: true, coupon };
    }
};
