<script lang="ts">
	import Textfield from '@smui/textfield';
	import { goto } from '$app/navigation';
	import Button, { Label } from '@smui/button';
	import { postWithoutToken } from '../../apiService';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Alerts from '../../../components/alerts.svelte';
	import { _ } from 'svelte-i18n';
	import showPWD from '../../../assets/icons/show-password.png';
	import hidePWD from '../../../assets/icons/pwd-visible.png';

	let email: any = '';
	let token: any = '';
	let password = '';
	let confirmPassword = '';
	let forgotMessage = '';
	let visibilityNewPassword = false;
	let visibilityConfirmPassword = false;
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		email = $page.url.searchParams.get('amp;email');
		email = $page.url.searchParams.get('email');
		token = $page.url.searchParams.get('token');
	});

	let onSubmit = () => {
		let url = `Auth/ResetPassword`;
		let data = {
			email,
			token,
			password,
			confirmPassword
		};
		if (email && password && token && confirmPassword != '') {
			postWithoutToken(url, data).then((result) => {
				if (result.succeeded) {
					goto('/auth/login');
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: lang == 'en' ? result.message : result.arMessage,
						type: 'success'
					};
					reCallAlerts();
				} else {
					forgotMessage = result.message;
				}
			});
		} else {
			openAlerts = true;
			alertData = {
				heading: 'Warning',
				message: 'Please fill all required fields.',
				type: 'error'
			};
			reCallAlerts();
		}
	};
</script>

<div class="auth-form">
	<div style="font-size: 24px; margin-bottom: 8px;" class="ff-poppins-semibold">
		{$_('Reset Password')}
	</div>
	<Textfield
		bind:value={password}
		type={visibilityNewPassword ? 'text' : 'password'}
		label={$_('New Password')}
		noLabel={true}
		required
		style="margin-top:14px;"
	>
		<img
			src={visibilityNewPassword ? hidePWD : showPWD}
			alt="icon"
			height="24px"
			width="24px"
			style="cursor: pointer;"
			slot="trailingIcon"
			on:click={() => (visibilityNewPassword = !visibilityNewPassword)}
			on:keypress={() => {}}
		/>
	</Textfield>
	<Textfield
		bind:value={confirmPassword}
		type={visibilityConfirmPassword ? 'text' : 'password'}
		label={$_('Confirm Password')}
		noLabel={true}
		required
		style="margin-top:14px;"
	>
		<img
			src={visibilityConfirmPassword ? hidePWD : showPWD}
			alt="icon"
			height="24px"
			width="24px"
			style="cursor: pointer;"
			slot="trailingIcon"
			on:click={() => (visibilityConfirmPassword = !visibilityConfirmPassword)}
			on:keypress={() => {}}
		/>
	</Textfield>
	<div style="color: red; text-align: center;margin-top:10px;" class="ff-poppins">
		{forgotMessage}
	</div>
	<Button
		variant="unelevated"
		class="btn ff-poppins-semibold"
		style="margin-top: 30px;"
		on:click={onSubmit}
	>
		<Label>{$_('Confirm Password')}</Label>
	</Button>

	<div
		style="text-align: center;font-size: 14px;color: #868686;margin-top:16px;"
		class="ff-poppins"
	>
		{$_('or')}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span
			style="color: #1779B8; cursor: pointer;font-size: 14px;"
			on:click={() => goto('/auth/login')}
			>{$_('Go Back!')}
		</span>
	</div>
</div>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
