import { browser } from '$app/environment';

function generateStableRandomNumber() {
	const userAgent = navigator.userAgent;
	const screenResolution = `${screen.width}x${screen.height}`;
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const uniqueString = `${userAgent}_${screenResolution}_${timezone}`;

	let hash = 0;
	for (let i = 0; i < uniqueString.length; i++) {
		const char = uniqueString.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}

	const randomNumber = Math.abs(hash % 100000);

	return randomNumber;
}

function createUserManager() {
	let username = $state('');

	if (browser) {
		username =
			localStorage.getItem('username') ??
			`ボカロリスナー${Math.floor(generateStableRandomNumber())}`;
	}

	return {
		get username() {
			return username;
		},
		set username(newUsername: string) {
			username = newUsername;
			if (browser) {
				localStorage.setItem('username', newUsername);
			}
		}
	};
}

export const userManager = createUserManager();
