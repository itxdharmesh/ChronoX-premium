import { db } from './config.js';
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function checkAchievements(uid) {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;
    const userData = userDoc.data();
    const currentBadges = userData.badges || [];
    const newBadges = [];
    if (userData.xp >= 100 && !currentBadges.includes('100_xp')) newBadges.push('100_xp');
    if (userData.xp >= 1000 && !currentBadges.includes('1k_xp')) newBadges.push('1k_xp');
    if ((userData.followers?.length || 0) >= 10 && !currentBadges.includes('10_followers')) newBadges.push('10_followers');
    if ((userData.coins || 0) >= 100 && !currentBadges.includes('100_coins')) newBadges.push('100_coins');
    if ((userData.streak || 0) >= 7 && !currentBadges.includes('7_day_streak')) newBadges.push('7_day_streak');
    if (newBadges.length > 0) await updateDoc(userRef, { badges: arrayUnion(...newBadges) });
}

export { checkAchievements };
