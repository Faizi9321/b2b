import { browser } from '$app/environment';
import { loader } from '../store';
import { appConfig } from '../config';

const baseUrl = appConfig.base_url;
let token: any;

export const GET = async (apiUrl: string) => {
	loader.update((x) => (x = true));
	token = browser ? localStorage.getItem('token') : null;
	const url = baseUrl + apiUrl;
	const resp = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + token
		}
	});
	if (resp.status == 200 || resp.status == 401) {
		setTimeout(() => {
			loader.update((x) => (x = false));
		}, 100);
	}
	const data = await resp.json();
	return data;
};

export const POST = async (apiUrl: string, formData: any, hasFile?: boolean) => {
	loader.update((x) => (x = true));
	token = browser ? localStorage.getItem('token') : null;
	const url = baseUrl + apiUrl;
	if (hasFile) {
		let fileData: any = formData;
		fileData = new FormData();
		for (var key in formData) {
			fileData.append(key, formData[key]);
		}
		const resp = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token
			},
			body: fileData
		});
		if (resp.status == 200 || resp.status == 401) {
			setTimeout(() => {
				loader.update((x) => (x = false));
			}, 100);
		}
		const data = await resp.json();
		return data;
	} else {
		const resp = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token
			},
			body: JSON.stringify(formData)
		});
		if (resp.status == 200 || resp.status == 401) {
			setTimeout(() => {
				loader.update((x) => (x = false));
			}, 100);
		}
		const data = await resp.json();
		return data;
	}
};

export const Delete = async (apiUrl: string) => {
	loader.update((x) => (x = true));
	token = browser ? localStorage.getItem('token') : null;
	const url = baseUrl + apiUrl;
	const resp = await fetch(url, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + token
		}
	});
	if (resp.status == 200 || resp.status == 401) {
		setTimeout(() => {
			loader.update((x) => (x = false));
		}, 100);
	}
	const data = await resp.json();
	return data;
};

export const postWithoutToken = async (apiUrl: string, formData: object) => {
	loader.update((x) => (x = true));
	const url = baseUrl + apiUrl;
	const resp = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(formData)
	});
	if (resp.status == 200 || resp.status == 401) {
		setTimeout(() => {
			loader.update((x) => (x = false));
		}, 100);
	}
	const data = await resp.json();
	return data;
};

export const getWithoutToken = async (apiUrl: string) => {
	loader.update((x) => (x = true));
	const url = baseUrl + apiUrl;
	const resp = await fetch(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	});
	if (resp.status == 200 || resp.status == 401) {
		setTimeout(() => {
			loader.update((x) => (x = false));
		}, 100);
	}
	const data = await resp.json();
	return data;
};
