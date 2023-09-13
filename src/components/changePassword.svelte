<script lang="ts">
	import Dialog, { Actions } from '@smui/dialog';
	import { _ } from 'svelte-i18n';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import showPWD from '../assets/icons/show-password.png';
	import hidePWD from '../assets/icons/pwd-visible.png';
	import { beforeUpdate, onMount } from 'svelte';
	import Alerts from './alerts.svelte';
	import { POST } from '../routes/apiService';

	export let email: any;
	export let open: boolean;
	let currentPassword: string = '';
	let newPassword: string = '';
	let confirmPassword = '';
	let visibilityCurrentPWD: boolean = false;
	let visibilityConfirmPWD: boolean = false;
	let visibilityNewPWD: boolean = false;
	let lang: string = 'en';
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;

	onMount(() => {
		lang = localStorage.getItem('language')!;
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
	});

	export const reCallPWD = () => {
		open = !open;
	};

	let actionHandler = (e: CustomEvent<{ action: string }>) => {
		switch (e.detail.action) {
			case 'close':
				break;
		}
	};

	let onSubmit = () => {
		let url = 'BCUser/ChangePassword';
		let data = {
			email,
			currentPassword,
			newPassword,
			confirmPassword
		};

		if (currentPassword != '' && newPassword != '' && confirmPassword != '') {
			POST(url, data).then((result: any) => {
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

<main>
	<Dialog
		bind:open
		class="changePWDDialog"
		aria-labelledby="default-focus-title"
		aria-describedby="default-focus-content"
		on:SMUIDialog:closed={actionHandler}
	>
		<div class="ff-poppins" style="background: white;padding: 40px 54px;border-radius: 10px;">
			<h3 class="ff-poppins-semibold" style="font-size: 16px; margin-top: 0px;">
				{$_('Update Password')}
			</h3>
			<div>
				<div class="input-field">
					<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Current Password')}*</p>
					<Textfield
						class="shaped-outlined"
						variant="outlined"
						bind:value={currentPassword}
						label={$_('Password')}
						noLabel={true}
						ripple={false}
						type={visibilityCurrentPWD ? 'text' : 'password'}
						style="width: 100%;"
					>
						<img
							src={visibilityCurrentPWD ? hidePWD : showPWD}
							alt="icon"
							height="24px"
							width="24px"
							style="cursor: pointer;align-self: center;margin-inline: 10px;"
							slot="trailingIcon"
							on:click={() => (visibilityCurrentPWD = !visibilityCurrentPWD)}
							on:keypress={() => {}}
						/>
					</Textfield>
				</div>
				<div class="input-field">
					<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('New Password')}*</p>
					<Textfield
						class="shaped-outlined"
						variant="outlined"
						bind:value={newPassword}
						label={$_('Password')}
						noLabel={true}
						ripple={false}
						type={visibilityNewPWD ? 'text' : 'password'}
						style="width: 100%;"
					>
						<img
							src={visibilityNewPWD ? hidePWD : showPWD}
							alt="icon"
							height="24px"
							width="24px"
							style="cursor: pointer;align-self: center;margin-inline: 10px;"
							slot="trailingIcon"
							on:click={() => (visibilityNewPWD = !visibilityNewPWD)}
							on:keypress={() => {}}
						/></Textfield
					>
				</div>
			</div>
			<div class="input-field">
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Confirm Password')}*</p>
				<Textfield
					class="shaped-outlined"
					variant="outlined"
					bind:value={confirmPassword}
					label={$_('Password')}
					noLabel={true}
					ripple={false}
					type={visibilityConfirmPWD ? 'text' : 'password'}
					style="width: 100%;"
					><img
						src={visibilityConfirmPWD ? hidePWD : showPWD}
						alt="icon"
						height="24px"
						width="24px"
						style="cursor: pointer;align-self: center;margin-inline: 10px;"
						slot="trailingIcon"
						on:click={() => (visibilityConfirmPWD = !visibilityConfirmPWD)}
						on:keypress={() => {}}
					/></Textfield
				>
			</div>
			<Actions>
				<div style="margin-top: 8%;display:flex;grid-gap:10px;">
					<Button
						on:click={onSubmit}
						class="btn ff-poppins"
						variant="raised"
						style={lang == 'ar' ? 'font-size:12px;width:118px;' : 'font-size:12px;width:154px;'}
					>
						<Label>{$_('Update Password')}</Label>
					</Button>

					<Button
						class="btn ff-poppins"
						variant="raised"
						style=" background: rgb(149, 152, 154); font-size:12px;width:122px;place-content: center;"
						action="close"
					>
						<Label>{$_('Cancel')}</Label>
					</Button>
				</div>
			</Actions>
		</div>
	</Dialog>
</main>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />

<style>
	:global(.btn) {
		height: 42px;
	}
</style>
