import Wallet from "../Models/Wallet.js";
import WalletTransaction from "../Models/WalletTransactions.js";
import mongoose from "mongoose";

const creditVigiCoins = async (customerId, amount, orderId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const walletAmount = amount * 0.1;
    walletAmount.toFixed(2);

    try {
        let wallet = await Wallet.findOne({ customerId: customerId }).session(session);

        if (!wallet) {
            wallet = await Wallet.create([{ customerId: customerId, balance: 0 }], { session });
            wallet = wallet[0];
        }

        wallet.balance += walletAmount;
        await wallet.save({ session });

        await WalletTransaction.create([{
            customerId: customerId,
            walletId: wallet._id,
            type: 'credit',
            amount: walletAmount,
            source: 'order',
            referenceId: orderId,
        }], { session });
        await session.commitTransaction();
        session.endSession();
        return wallet;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const redeemVigiCoins = async (customerId, redeemamount, orderId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const wallet = await Wallet.findOne({ customerId: customerId }).session(session);
        if (!wallet || wallet.balance < redeemamount) {
            throw new Error('Insufficient Vigi Coins');
        }
        wallet.balance -= redeemamount;
        await wallet.save({ session });

        await WalletTransaction.create([{
            customerId: customerId,
            walletId: wallet._id,
            type: 'debit',
            amount: redeemamount,
            source: 'order',
            referenceId: orderId,
        }], { session });
        await session.commitTransaction();
        session.endSession();
        return wallet;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export { creditVigiCoins, redeemVigiCoins };