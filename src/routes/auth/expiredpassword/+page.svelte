<script lang="ts">
	import Textfield from '@smui/textfield';
	import { goto } from '$app/navigation';
	import Button, { Label } from '@smui/button';
	import { postWithoutToken } from '../../apiService';
	import Alerts from '../../../components/alerts.svelte';
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import showPWD from '../../../assets/icons/show-password.png';
	import hidePWD from '../../../assets/icons/pwd-visible.png';

	let email = '';
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let forgotMessage = '';
	let visibilityCurrentPassword = false;
	let visibilityNewPassword = false;
	let visibilityConfirmPassword = false;
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
	});

	let onSubmit = () => {
		let url = `Auth/ChangeExpiredPassword`;
		let data = {
			email,
			currentPassword,
			newPassword,
			confirmPassword
		};
		if (email && newPassword && currentPassword && confirmPassword != '') {
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
					openAlerts = true;
					alertData = {
						heading: 'Error',
						message: lang == 'en' ? result.message : result.arMessage,
						type: 'error'
					};
					reCallAlerts();
				}
			});
		} else {
			openAlerts = true;
			alertData = {
				heading: 'Error',
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
		bind:value={email}
		type="text"
		label={$_('Email Address')}
		noLabel={true}
		required
		style="margin-top:14px;"
	/>
	<Textfield
		bind:value={currentPassword}
		type={visibilityCurrentPassword ? 'text' : 'password'}
		label={$_('Current Password')}
		noLabel={true}
		required
		style="margin-top:14px;"
	>
		<img
			src={visibilityCurrentPassword ? hidePWD : showPWD}
			alt="icon"
			height="24px"
			width="24px"
			style="cursor: pointer;"
			slot="trailingIcon"
			on:click={() => (visibilityCurrentPassword = !visibilityCurrentPassword)}
			on:keypress={() => {}}
		/>
	</Textfield>
	<Textfield
		bind:value={newPassword}
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
		on:click={onSubmit}
		style="margin-top: 30px;"
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
		>
			{$_('Go Back!')}</span
		>
	</div>
</div>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
