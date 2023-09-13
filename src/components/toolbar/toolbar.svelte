<script lang="ts">
	import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar';
	import { browser } from '$app/environment';
	import './toolbar.scss';
	import '../../global.scss';
	import Time from 'svelte-time';
	import BellOutline from 'svelte-material-icons/BellOutline.svelte';
	import Badge from '@smui-extra/badge';
	import placeHolder from '../../assets/images/default-placeholder.png';
	import { afterUpdate, beforeUpdate, createEventDispatcher, onMount } from 'svelte';
	import { appConfig } from '../../config';
	import { profile, detectNotification } from '../../store';
	import { _ } from 'svelte-i18n';
	import { getMessaging, getToken, onMessage } from 'firebase/messaging';
	import { initializeApp } from 'firebase/app';
	import { page } from '$app/stores';

	let topAppBar: TopAppBar;
	let date = new Date();
	let image: string = placeHolder;
	let name: string = '';
	let output = createEventDispatcher();

	export let size = '1.3em';
	export let width = size;
	export let height = size;
	export let color = 'black';
	export let viewBox = '0 0 24 24';
	let lang: string = 'en';
	let messaging: any;
	let FCMCount: number = 0;
	let greaterNine: string = `9<sup>+</sup>`;
	export let title = '';
	title = browser ? localStorage.getItem('title')! : title;

	onMount(() => {
		lang = localStorage.getItem('language')!;
		const app = initializeApp(appConfig.firebaseConfig);
		messaging = getMessaging(app);

		getToken(messaging, {
			vapidKey: appConfig.vapidKey
		})
			.then((token) => {
				console.log('token', token);
			})
			.catch((error) => {
				console.log('error', error);
			});
		onMessage(messaging, (payload: any) => {
			if (payload.notification) {
				detectNotification.set(true);
				if ($page.url.pathname != '/main/orders') {
					FCMCount++;
					localStorage.setItem('FCMCount', JSON.stringify(FCMCount));
				}
			}
		});
		if (localStorage.getItem('FCMCount') != null) {
			FCMCount = Number(localStorage.getItem('FCMCount'));
		}
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		profile.subscribe((value: any) => {
			if (value != '') {
				name = lang == 'en' ? value.enFullName : value.arFullName;
				image =
					value.profileImagePath == null
						? placeHolder
						: `${appConfig.file_base_url}${value.profileImagePath}`;
			}
		});
		if ($page.url.pathname == '/main/orders') {
			FCMCount = 0;
			localStorage.setItem('FCMCount', JSON.stringify(FCMCount));
		}
	});
</script>

<TopAppBar bind:this={topAppBar} variant="standard" style="justify-content: space-between">
	<Row>
		<Section>
			<Title class="title">{title == '' || title == null ? $_('Dashboard') : $_(title)}</Title>
		</Section>

		<Section align="end" style={lang == 'en' ? '' : 'padding-left:26px;'}>
			<Time class="time" timestamp={date} />
			<div>
				<span class="badge">
					<BellOutline {color} {size} {width} {height} {viewBox} />
					{#if FCMCount > 0}
						<Badge aria-label="unread count">{@html FCMCount > 9 ? greaterNine : FCMCount}</Badge>
					{/if}
				</span>
			</div>
			<img
				src={image}
				alt=""
				width="40px"
				height="40px"
				style="border-radius:50%;min-width:40px;"
			/>
			<span class="name">{name}</span>
		</Section>
	</Row>
</TopAppBar>
<AutoAdjust {topAppBar} />
