import { getSession } from 'next-auth/react';

import { toTitleCase } from '../../_app';
import { db } from '../../../lib/firebase';
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    runTransaction,
    increment,
} from 'firebase/firestore';

export default async (req, res) => {
    const session = await getSession({ req });

    if (session) {
        const userId = session.user.image.match('[0-9]+')[0];
        session.user.id = userId;
        const data = await (await getData(userId)).data();
        session.user.balance = data.balance;

        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        const newBal =
            docSnap.data().balance - req.body.cPrice * req.body.amount;

        if (newBal >= 0) {
            updateDoc(docRef, {
                balance: newBal,
                [`wallet.${req.body.coin}.amount`]: increment(req.body.amount),
                [`wallet.${req.body.coin}.price`]: req.body.cPrice,
            });

            res.status(200);
            res.json({
                error: false,
                newBalance: newBal,
                msg: `Successfully bought ${req.body.amount} ${toTitleCase(req.body.coin)} for ${Math.round(req.body.cPrice * req.body.amount * 100) / 100} USDT.`,
            });
        }
        else {
            res.status(200);
            res.json({
                error: true,
                newBalance: null,
                msg: 'Insufficient balance.'
            });
        }
    } else {
        res.status(401);
    }
};

async function getData(userId) {
    const users = collection(db, 'users');
    const docRef = doc(users, userId);
    const q = await getDoc(docRef);
    return q;
}
