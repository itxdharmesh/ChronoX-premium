import { showToast } from './utils.js';

function sendNotification(type, data) {
    switch(type) {
        case 'follow': showToast(`${data.username} started following you!`); break;
        case 'message': showToast(`New message from ${data.username}`); break;
        case 'achievement': showToast(`🏆 Achievement: ${data.achievement}`); break;
    }
}

export { sendNotification };
