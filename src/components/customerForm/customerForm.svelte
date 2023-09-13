<!--* Script -->
<script lang="ts">
	import Card from '@smui/card';
	import Textfield from '@smui/textfield';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import { beforeUpdate, onMount } from 'svelte';
	import Button, { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import { GET, POST } from '../../routes/apiService';
	import { page } from '$app/stores';
	import { appConfig } from '../../config';
	import './customerForm.scss';
	import '../../global.scss';
	import { profile } from '../../store';
	import Alerts from '../alerts.svelte';
	import { _ } from 'svelte-i18n';
	import history from '../../assets/icons/history.png';
	import ChangePassword from '../changePassword.svelte';
	import placeHolder from '../../assets/images/default-placeholder.png';

	let paramsId: any = $page.params.id;
	export let formObj: any;
	let emailDisabled: any;
	let allDisabled: any;
	let cancel: any = 'Cancel';
	let btnText = formObj.view == 'create' ? 'Save Information' : 'Update Information';
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;

	if (formObj.view == 'edit' || formObj.view == 'view') {
		emailDisabled = true;
	}

	if (formObj.view == 'view') {
		allDisabled = true;
	}

	let id: any = null;
	let enFullName = '';
	let arFullName = '';
	let email = '';
	let phoneNumber = '+966';
	let primaryBcUser = false;
	let whatsAppNumber = '+966';
	let password = '';
	let confrimPassword = '';
	let bcId: any;
	let bcName: any;
	let passwordExpired = false;
	let role = '';
	let lang: string = 'en';
	let open: boolean = false;
	let reCallPWD: any;
	let currentEmail: any;

	onMount(() => {
		lang = localStorage.getItem('language')!;
		profile.subscribe((val: any) => {
			if (val != '') {
				bcId = val.bcId;
				bcName = val.bcName;
				currentEmail = val.email;
			}
		});
		if (paramsId) {
			let url = `BCUser/GetByIdAsync?Id=${paramsId}&BcId=${2}`;
			GET(url).then((response) => {
				enFullName = response.data.enFullName;
				arFullName = response.data.arFullName;
				email = response.data.email;
				phoneNumber = response.data.phoneNumber;
				whatsAppNumber = response.data.whatsAppNumber;
				avatar =
					response.data.profileImagePath == null
						? placeHolder
						: `${appConfig.file_base_url}${response.data.profileImagePath}`;
			});
		}
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
	});

	function onSubmit() {
		if (formObj.view == 'create') {
			let url = `BCUser/CreateBCUser`;
			let data = {
				id,
				enFullName,
				arFullName,
				email,
				phoneNumber,
				primaryBcUser,
				whatsAppNumber,
				password,
				confrimPassword,
				bcId,
				bcName,
				passwordExpired
			};
			if (
				enFullName != '' &&
				arFullName != '' &&
				email != '' &&
				phoneNumber != '' &&
				whatsAppNumber != '' &&
				password != '' &&
				confrimPassword != ''
			) {
				POST(url, data).then((result) => {
					if (result.succeeded) {
						goto('/main/customers');
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
		}

		if (formObj.view == 'edit') {
			let url = `BCUser/UpdateBCUser`;
			let data = {
				id: paramsId,
				enFullName,
				arFullName,
				email,
				phoneNumber,
				primaryBcUser,
				whatsAppNumber,
				bcId,
				bcName,
				role
			};
			if (
				enFullName != '' &&
				arFullName != '' &&
				email != '' &&
				phoneNumber != '' &&
				whatsAppNumber != ''
			) {
				POST(url, data).then((result) => {
					if (result.succeeded) {
						goto('/main/customers');
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
		}
	}

	let avatar: any, fileinput: any;
	const onFileSelected = async (e: any) => {
		const image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e: any) => {
			avatar = e.target.result;
		};
		let url = 'BCUser/UpdateProfileImage';
		let data = {
			profilePicture: image,
			userId: paramsId
		};
		POST(url, data, true).then((result) => {
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

	function deleteImg() {
		let url = `BCUser/DeleteMyProfileImage?userId=${paramsId}`;
		let data = {};
		POST(url, data).then((result) => {
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
	}

	let onClickChangePWD = () => {
		open = true;
		reCallPWD();
	};
</script>

<!--* Template -->
<main class="main customers">
	{#if formObj.view != 'create' && email == currentEmail}
		<div style="align-self: end;">
			<Button
				variant="unelevated"
				class="btn topBtn ff-poppins"
				style={lang == 'ar' ? 'width:154px' : 'width:206px'}
				on:click={onClickChangePWD}
			>
				<img src={history} height="20px" width="20px" alt="" />
				<Label>{$_('Change Password')}</Label>
			</Button>
		</div>
	{/if}
	<Card style="padding:24px;">
		<form>
			<h4 style="font-size: 16px;margin:0" class="ff-poppins-semibold">{$_('Manager Details')}</h4>
			<div style="display: grid; grid-template-columns: 2fr 2fr; grid-gap: 20px;">
				<div class={formObj.view == 'create' ? 'three_columns' : 'two_columns'}>
					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Manager Name')}*</p>
						<Textfield
							class="shaped-outlined"
							disabled={allDisabled}
							variant="outlined"
							bind:value={enFullName}
							label="{$_('Manager Name')} [English]"
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">
							{$_('Manager Name')} [العربية]*
						</p>
						<Textfield
							class="shaped-outlined arabic-field"
							disabled={allDisabled}
							variant="outlined"
							style="text-align: right;"
							bind:value={arFullName}
							label="{$_('Manager Name')} [العربية]"
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Email Address')}*</p>
						<Textfield
							class="shaped-outlined"
							disabled={emailDisabled}
							variant="outlined"
							bind:value={email}
							label="example@email.com"
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Mobile Number')}*</p>
						<Textfield
							class="shaped-outlined"
							disabled={allDisabled}
							variant="outlined"
							bind:value={phoneNumber}
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">
							{$_('WhatsApp Number')}*
						</p>
						<Textfield
							class="shaped-outlined"
							disabled={allDisabled}
							variant="outlined"
							bind:value={whatsAppNumber}
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div>
						<div style="width: 265px; margin-top:50px; color: #606060" class="ff-poppins">
							<FormField>
								<Checkbox bind:value={primaryBcUser} disabled={allDisabled} style="margin: 0px" />
								{$_('Primary Company User')}
							</FormField>
						</div>
					</div>
				</div>

				<div>
					{#if formObj.view == 'edit' || formObj.view == 'view'}
						<div class="ff-poppins" style="font-size:13px; color: #606060">
							<p>{$_('Profile Image')}</p>
						</div>

						<div class="profile-image" style="position:relative">
							{#if avatar}
								<img class="profile_image" src={avatar} alt="" width="90px;" height="90px" />
							{:else}
								<img class="profile_image" src={placeHolder} alt="" width="90px;" height="90px" />
							{/if}
							<div class={formObj.view == 'view' ? 'profile-btns-disabled ' : 'profile-img-btns'}>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i
									class="mi mi-camera"
									on:click={() => {
										fileinput.click();
									}}
									style="cursor: pointer"
								/>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i
									class="mi mi-delete"
									on:click={() => (avatar = '') && (fileinput = '')}
									on:click={deleteImg}
									style="cursor: pointer"
								/>
							</div>
						</div>
						<input
							style="display:none"
							type="file"
							accept=".jpg, .jpeg, .png"
							on:change={(e) => onFileSelected(e)}
							bind:this={fileinput}
						/>
						<div />
					{/if}
				</div>
			</div>
		</form>
	</Card>

	{#if formObj.view == 'create'}
		<Card style="padding:24px;">
			<h4 style="font-size: 16px;margin:0" class="ff-poppins-semibold">{$_('Set Password')}</h4>
			<form>
				<div style="display: grid; grid-template-columns: 2fr 2fr 2fr;">
					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Password')}*</p>
						<Textfield
							class="shaped-outlined"
							variant="outlined"
							bind:value={password}
							label={$_('New Password')}
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">
							{$_('Confirm Password')}*
						</p>
						<Textfield
							class="shaped-outlined"
							variant="outlined"
							bind:value={confrimPassword}
							label={$_('Confirm Password')}
							noLabel={true}
							ripple={false}
						/>
					</div>
				</div>

				<div>
					<div style="margin-top:15px">
						<FormField>
							<Checkbox bind:value={passwordExpired} />
							{$_('Require this user to change their password when they first sign in.')}*
						</FormField>
					</div>
				</div>
			</form></Card
		>
	{/if}

	{#if formObj.view != 'view'}
		<div class="button-block">
			<Button on:click={onSubmit} class="btn ff-poppins-semibold" variant="raised">
				<Label>{$_(btnText)}</Label>
			</Button>

			<Button
				on:click={() => goto('/main/customers')}
				class="btn ff-poppins-semibold"
				variant="raised"
				style=" background: rgb(149, 152, 154); width:165px"
			>
				<Label>{$_(cancel)}</Label>
			</Button>
		</div>
	{/if}
</main>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
<ChangePassword {open} {email} bind:reCallPWD />
