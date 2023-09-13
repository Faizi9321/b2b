<script lang="ts">
	import Textfield from '@smui/textfield';
	import { goto } from '$app/navigation';
	import Button, { Label } from '@smui/button';
	import { postWithoutToken } from '../../apiService';
	import { _ } from 'svelte-i18n';

	let email = '';
	let forgotMessage = '';
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;

	let onSubmit = () => {
		let url = 'Auth/ForgotPassword';
		let data = {
			email
		};
		if (email != '') {
			postWithoutToken(url, data).then((result) => {
				if (result.message) {
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
	<div style="color: #2D2D2D; font-size: 24px" class="ff-poppins-semibold">
		{$_('Forgot Password?')}
	</div>
	<div style="font-size: 14px; color: #1E1D1D;margin-top:20px;" class="ff-poppins">
		{$_('Please enter the registered email to reset password')}
	</div>
	<Textfield
		bind:value={email}
		type="text"
		label={$_('Email Address')}
		noLabel={true}
		style="margin-top:20px;"
	/>
	<div style="color: red; text-align: center;margin-top:20px;" class="ff-poppins">
		{forgotMessage}
	</div>
	<Button
		variant="unelevated"
		class="btn ff-poppins-semibold"
		on:click={onSubmit}
		style="margin-top: 10px;"
	>
		<Label>{$_('Confirm')}</Label>
	</Button>
	<div
		style="text-align: center;font-size: 14px;color: #868686;margin-top:26px;"
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
