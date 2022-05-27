import { getSession } from 'next-auth/react';

import { db } from '../../../lib/firebase';
import { doc, getDoc, collection } from 'firebase/firestore';

export default async (req, res) => {
    const session = await getSession({ req });

    if (session) {
        const userId = session.user.image.match('[0-9]+')[0];
        session.user.id = userId;
        const data = await (await getData(userId)).data();
        session.user.balance = data.balance;
        session.user.wallet = data.wallet;

        res.status(200);
        res.json(session);
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
