<script lang="ts">
	import Button, { Label } from '@smui/button';
	import { page } from '$app/stores';
	import { getWithoutToken } from '../../apiService';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Alerts from '../../../components/alerts.svelte';
	import { _ } from 'svelte-i18n';

	let emailConfirmationEmail!: any;
	let emailConfirmationToken!: any;
	let emailVerified = false;
	let resendEmailMessage = '';
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		emailConfirmationEmail = $page.url.searchParams.get('amp;email');
		emailConfirmationEmail = $page.url.searchParams.get('email');
		emailConfirmationToken = $page.url.searchParams.get('token');

		let url = `Auth/EmailConfirmation?Email=${emailConfirmationEmail}&Token=${emailConfirmationToken}`;
		getWithoutToken(url).then((result) => {
			if (result.succeeded) {
				emailVerified = false;
				if (result.data.isEmailVerificationRequired) {
					emailVerified = true;
				}
				openAlerts = true;
				alertData = {
					heading: 'Success',
					message: lang == 'en' ? result.message : result.arMessage,
					type: 'success'
				};
				reCallAlerts();
			} else {
				resendEmailMessage = result.message;
				emailVerified = true;
				openAlerts = true;
				alertData = {
					heading: 'Error',
					message: lang == 'en' ? result.message : result.arMessage,
					type: 'error'
				};
				reCallAlerts();
			}
		});
	});

	let resendEmail = () => {
		let url = `Auth/ResendEmailConfirmation?email=${emailConfirmationEmail}`;
		getWithoutToken(url).then((result) => {
			if (result.succeeded) {
				openAlerts = true;
				alertData = {
					heading: 'Success',
					message: lang == 'en' ? result.message : result.arMessage,
					type: 'success'
				};
				reCallAlerts();
			} else {
				openAlerts = true;
				alertData = {
					heading: 'Error',
					message: lang == 'en' ? result.message : result.arMessage,
					type: 'error'
				};
				reCallAlerts();
			}
		});
	};
</script>

<div style="display: flex;flex-direction: column; width: 50%;">
	<div style="color: #2D2D2D; font-size: 24px" class="ff-poppins-semibold">
		{$_('Email Verification')}
	</div>
	<div style="font-size: 14px; color: #1E1D1D;" class="ff-poppins">{resendEmailMessage}</div>
	<Button
		variant="unelevated"
		class="btn ff-poppins-semibold"
		disabled={emailVerified}
		on:click={() => goto('/auth/login')}
		style="margin-top: 30px;"
	>
		<Label>{$_('Continue to Sign In')}</Label>
	</Button>
	{#if emailVerified}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span
			style="cursor: pointer;font-size: 14px; margin-top: 5%; text-align: center;color:#1879B8"
			class="ff-poppins"
			on:click={resendEmail}>{$_('Resend Email')}</span
		>
	{/if}
</div>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
