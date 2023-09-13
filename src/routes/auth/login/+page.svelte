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
	let password = '';
	let forgotMessage = '';
	let visibilityIcon = false;
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
	});

	let onSubmit = () => {
		let url = 'Auth/Login';
		let data = {
			email,
			password
		};
		if (email && password != '') {
			postWithoutToken(url, data).then((result) => {
				if (result.succeeded) {
					if (result.data.isAuthSuccessful) {
						localStorage.setItem('token', result.data.token);
						goto('/main/dashboard');
					} else if (result.data.is2StepVerificationRequired) {
						goto(`/auth/otp/${email}`);
					} else if (result.data.passwordExpired) {
						goto('/auth/expiredpassword');
						openAlerts = true;
						alertData = {
							heading: 'Error',
							message: lang == 'en' ? result.message : result.arMessage,
							type: 'error'
						};
						reCallAlerts();
					}
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

<div class="auth-form" style="height:80vh">
	<div style="display:flex;flex-direction:column;margin-top: 70px;">
		<div style="font-size: 24px; margin-bottom: 8px;" class="ff-poppins-semibold">
			{$_('Sign in')}
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
			bind:value={password}
			type={visibilityIcon ? 'text' : 'password'}
			label={$_('Password')}
			noLabel={true}
			required
			style="margin-top:14px;"
		>
			<img
				src={visibilityIcon ? hidePWD : showPWD}
				alt="icon"
				height="24px"
				width="24px"
				style="cursor: pointer;"
				slot="trailingIcon"
				on:click={() => (visibilityIcon = !visibilityIcon)}
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
			<Label>{$_('Sign in')}</Label>
		</Button>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span
			class="forgot-password ff-poppins"
			style="margin-top:20px"
			on:click={() => goto('/auth/forgot')}>{$_('Forgot Password?')}</span
		>
	</div>
	<div class="ff-poppins" style="display: flex;place-content:center;align-items:center">
		<span style="color: #868686;">{$_("Don't have an account?")}&nbsp;</span>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span style="color: #1879B8; cursor: pointer;" on:click={() => goto('/auth/signup')}
			>{$_('Sign up here!')}</span
		>
	</div>
</div>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
