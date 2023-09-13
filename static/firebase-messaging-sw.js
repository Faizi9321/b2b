importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-messaging-compat.js');
// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
	apiKey: 'AIzaSyBfM21dho57zRAXa4hnoQAcgJZJVg_SXaU',
	authDomain: 'b2bcustomer-367206.firebaseapp.com',
	projectId: 'b2bcustomer-367206',
	storageBucket: 'b2bcustomer-367206.appspot.com',
	messagingSenderId: '287472265966',
	appId: '1:287472265966:web:363edeb8e5a63d1798a1ff',
	measurementId: 'G-E4QXMZ6T88'
};
firebase.initializeApp(firebaseConfig);
// Retrieve firebase messaging
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
	console.log('Received background message ', payload);
	const notificationTitle = payload.notification.title;
	const notificationOptions = { body: payload.notification.body };
	self.registration.showNotification(notificationTitle, notificationOptions);
});
