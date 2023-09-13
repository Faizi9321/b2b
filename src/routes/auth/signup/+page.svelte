<script lang="ts">
	import Textfield from '@smui/textfield';
	import { goto } from '$app/navigation';
	import Button, { Label } from '@smui/button';
	import { getWithoutToken, postWithoutToken } from '../../apiService';
	import Select, { Option } from '@smui/select';
	import { onMount } from 'svelte';
	import FormField from '@smui/form-field';
	import Checkbox from '@smui/checkbox';
	import Alerts from '../../../components/alerts.svelte';
	import { _ } from 'svelte-i18n';
	import showPWD from '../../../assets/icons/show-password.png';
	import hidePWD from '../../../assets/icons/pwd-visible.png';

	let categories: any[] = [];
	let id: any = null;
	let enName = '';
	let bcName = '';
	let email = '';
	let bcCategoryId = '';
	let password = '';
	let confrimPassword = '';
	let termsAndCondition = false;
	let btnDisabled = true;
	let visibilityPassword = false;
	let visibilityConfirmPassword = false;
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		let url = `BCUserRegister/GetAllBCCategory?SortColumn=name&PageNumber=1&PageSize=100&SortOrder=a`;
		getWithoutToken(url).then((result) => {
			categories = result.data;
		});
	});

	let onSubmit = () => {
		let url = `BCUserRegister/CreateUpdate`;
		let data = {
			id,
			enName,
			bcName,
			email,
			bcCategoryId,
			password,
			confrimPassword,
			termsAndCondition
		};
		if (enName && bcName && email && bcCategoryId && password && confrimPassword != '') {
			postWithoutToken(url, data).then((result) => {
				if (result.succeeded) {
					goto('/auth/congratulations');
					openAlerts = true;
					alertData = {
						heading: 'Error',
						message: lang == 'en' ? result.message : result.arMessage,
						type: 'error'
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
		} else {
			openAlerts = true;
			alertData = {
				heading: 'Error',
				message: 'Please fill all required fields',
				type: 'error'
			};
			reCallAlerts();
		}
	};

	let termsCondition = () => {
		termsAndCondition = !termsAndCondition;
		btnDisabled = !btnDisabled;
	};
</script>

<div class="auth-form">
	<div style="font-size: 24px; margin-bottom: 8px;margin-top:14px;" class="ff-poppins-semibold">
		{$_('Create Account')}
	</div>
	<Textfield
		bind:value={enName}
		type="text"
		label={$_('User Full Name')}
		noLabel={true}
		style="margin-top:14px;"
	/>
	<Textfield
		bind:value={bcName}
		type="text"
		label={$_('Company Name')}
		noLabel={true}
		style="margin-top:14px;"
	/>
	<Textfield
		bind:value={email}
		type="email"
		label={$_('Email Address')}
		noLabel={true}
		style="margin-top:14px;"
	/>
	<Select bind:value={bcCategoryId} class="ff-poppins" style="margin-top:14px;">
		<Option value="" disabled selected style="color: #868686;"
			>{$_('Select Company Category')}</Option
		>
		{#each categories as category}
			<Option value={category.id}>
				{lang == 'en' ? category.name : category.arName}
			</Option>
		{/each}
	</Select>
	<Textfield
		bind:value={password}
		type={visibilityPassword ? 'text' : 'password'}
		label={$_('Password')}
		noLabel={true}
		style="margin-top:14px;"
	>
		<img
			src={visibilityPassword ? hidePWD : showPWD}
			alt="icon"
			height="24px"
			width="24px"
			style="cursor: pointer;"
			slot="trailingIcon"
			on:click={() => (visibilityPassword = !visibilityPassword)}
			on:keypress={() => {}}
		/>
	</Textfield>
	<Textfield
		bind:value={confrimPassword}
		type={visibilityConfirmPassword ? 'text' : 'password'}
		label={$_('Confirm Password')}
		noLabel={true}
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
	<FormField style="margin-top:14px;">
		<Checkbox on:click={termsCondition} />
		<span slot="label"> {$_('Accept Terms & Conditions and Privacy Policy.')} </span>
	</FormField>
	<Button
		variant="unelevated"
		class="btn ff-poppins-semibold"
		style="margin-top:16px;"
		on:click={onSubmit}
		disabled={btnDisabled}
	>
		<Label>{$_('Create Account')}</Label>
	</Button>
	<div
		style="font-size: 14px;padding-bottom: 4%;margin-top:14px;text-align:center;"
		class="ff-poppins"
	>
		<span style="color: #868686;">{$_('Already have an account?')}&nbsp; </span>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span style="color: #1879B8; cursor: pointer;" on:click={() => goto('/auth/login')}
			>{$_('Sign in')}</span
		>
	</div>
</div>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
