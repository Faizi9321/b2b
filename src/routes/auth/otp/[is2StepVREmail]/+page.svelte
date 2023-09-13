<script lang="ts">
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getWithoutToken, postWithoutToken } from '../../../apiService';
	import { goto } from '$app/navigation';
	import Alerts from '../../../../components/alerts.svelte';
	import { _ } from 'svelte-i18n';

	let otps: any;
	let otpsArray: any[] = [];
	let currentIndex = 0;
	let email = '';
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		email = $page.params.is2StepVREmail;

		otps = document.querySelectorAll('.otp-fields');
		otps[0].focus();
		otps.forEach((otp: any, index: any) => {
			otp.addEventListener('keydown', (e: any) => {
				if (e.key >= 0 && e.key <= 9) {
					if (index + 1 < otps.length) {
						setTimeout(() => otps[index + 1].focus(), 10);
					}
				} else if (e.key == 'Backspace') {
					currentIndex = index;
					if (index - 1 != -1) {
						setTimeout(() => otps[index - 1].focus(), 10);
					}
				}
			});
		});
	});

	let onEnterOTP = (ev: any) => {
		if (ev.data != null) {
			otpsArray.push(ev.data);
		}
	};

	let onClear = (ev: any) => {
		if (ev.key == 'Backspace') {
			otpsArray.splice(currentIndex, 1);
		}
	};

	let onConfirm = () => {
		let finalOTP = otpsArray.join('');
		let url = 'Auth/TwoStepVerification';
		let otpObj = {
			email: email,
			provider: 'Email',
			otpCode: finalOTP
		};
		if (finalOTP != '') {
			postWithoutToken(url, otpObj).then((result) => {
				if (result.succeeded) {
					localStorage.setItem('token', result.data.token);
					goto('/main/dashboard');
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

	let resendOTP = () => {
		let url = `Auth/ResendTwoFactorCode?email=${email}`;
		getWithoutToken(url).then((result: any) => {
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

<div style="width: 56%;">
	<div style="font-size: 24px; color: #2D2D2D;" class="ff-poppins-semibold">
		{$_('Verification Code')}
	</div>
	<div style="font-size: 13px; color: #1E1D1D;margin-top:14px;" class="ff-poppins">
		{$_('Please enter the verification code sent to')}
		{email}
	</div>
	<div style="margin-top: 14px;">
		<Textfield
			type="number"
			class="otp-fields"
			value=""
			ripple={false}
			on:input={onEnterOTP}
			on:keyup={onClear}
		/>
		<Textfield
			type="number"
			class="otp-fields"
			value=""
			ripple={false}
			on:input={onEnterOTP}
			on:keyup={onClear}
		/>
		<Textfield
			type="number"
			class="otp-fields"
			value=""
			ripple={false}
			on:input={onEnterOTP}
			on:keyup={onClear}
		/>
		<Textfield
			type="number"
			class="otp-fields"
			value=""
			ripple={false}
			on:input={onEnterOTP}
			on:keyup={onClear}
		/>
		<Textfield
			type="number"
			class="otp-fields"
			value=""
			ripple={false}
			on:input={onEnterOTP}
			on:keyup={onClear}
		/>
		<Textfield
			type="number"
			class="otp-fields"
			value=""
			ripple={false}
			on:input={onEnterOTP}
			on:keyup={onClear}
			style="margin-right:0px"
		/>
	</div>
	<Button
		variant="unelevated"
		class="btn ff-poppins-semibold"
		style="width:100%;margin-top:30px;"
		on:click={onConfirm}
	>
		<Label>{$_('Confirm Code')}</Label>
	</Button>
	<div
		style="text-align: center;font-size: 14px;color: #868686;margin-top:26px;"
		class="ff-poppins"
	>
		{$_('No code received?')}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span style="color: #14A3D8; cursor: pointer;font-size: 14px;" on:click={resendOTP}>
			{$_('Resend code')}</span
		>
	</div>
</div>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
