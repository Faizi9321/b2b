<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Card from '@smui/card';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import HelperText from '@smui/textfield/helper-text';
	import { DateInput } from 'date-picker-svelte';
	import { POST } from '../routes/apiService';
	import { goto } from '$app/navigation';
	import Alerts from '../components/alerts.svelte';
	import { _ } from 'svelte-i18n';

	let date: any;
	let image: any;
	let fileinput: any;
	let fileList: any;
	let paymentRemarks = '';
	let alertData: any;
	let openAlerts: boolean = false;
	let reCallAlerts: any;
	export let orderPaymentDetail: any;
	export let order_id: any;
	export let disableBtn: boolean = false;

	if (orderPaymentDetail) {
		date = new Date(orderPaymentDetail?.paymentProofUploadedAt);
		image = orderPaymentDetail?.paymentProofPath.substring(62);
		paymentRemarks = orderPaymentDetail?.paymentProofRemarks;
	}

	const onSubmit = () => {
		let url = 'Order/UploadPaymentProof';
		let data = {
			paymentProof: fileList,
			obj: JSON.stringify({
				orderId: parseInt(order_id),
				paymentProofRemarks:
					paymentRemarks != undefined || paymentRemarks != null ? paymentRemarks : '',
				paymentProofUploadedAt: date == null ? null : date.toDateString()
			})
		};
		if (date != null && fileList != undefined) {
			POST(url, data, true).then((result: any) => {
				if (result.succeeded) {
					goto('/main/orders');
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: result.message,
						type: 'success'
					};
					reCallAlerts();
				} else {
					openAlerts = true;
					alertData = {
						heading: 'Error',
						message: result.message,
						type: 'error'
					};
					reCallAlerts();
				}
			});
		} else {
			openAlerts = true;
			alertData = {
				heading: 'Warning',
				message:
					'Payment proof already added. Please update any required fields to update the payment proof details.',
				type: 'error'
			};
			reCallAlerts();
		}
	};

	const onFileSelected = (e: any) => {
		fileList = e.target.files[0];
		image = fileList.name;
	};
</script>

<main>
	<Card class="payment-card">
		<p class="payment-heading">{$_('Payment Details')}</p>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="input-label">{$_('Payment Date')}*</label>
		<DateInput
			class="payment-input"
			placeholder="Payment Date"
			format="dd-MM-yyyy"
			bind:value={date}
		/>
		<p class="payment-heading" style="margin-top: 40px;">{$_('Add Attachments')}*</p>
		<div style="display: flex; justify-content: space-between; width:50%">
			<Button
				class="upload-btn"
				on:click={() => {
					fileinput.click();
				}}>{$_('Select file')}</Button
			>
			{#if image}
				<Button class="upload-btn">{image}</Button>
			{/if}
		</div>
		<input
			style="display:none"
			type="file"
			on:change={(e) => onFileSelected(e)}
			bind:this={fileinput}
		/>

		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="input-label" style="margin-top: 30px;">{$_('Payment Details')}</label>
		<Textfield
			variant="outlined"
			type="text"
			bind:value={paymentRemarks}
			label="{$_('Payment Details')}"
			noLabel={true}
		/>
	</Card>
	<div
		style="display:flex;grid-gap: 24px;place-content: baseline;align-items: baseline;"
	>
		<Button
			variant="unelevated"
			class="btn ff-poppins-semibold"
			style="font-size: 14px;width: 192px;margin: 40px 0 20px;"
			on:click={() => onSubmit()}
			disabled={disableBtn}
		>
			<Label>{$_('Add Payment Proof')}</Label>
		</Button>
		<Button
			on:click={() => goto('/main/orders')}
			class="btn ff-poppins-semibold"
			variant="raised"
			style="background: rgb(149, 152, 154); width:165px;place-content:center"
		>
			<Label>{$_('Cancel')}</Label>
		</Button>
	</div>
</main>
<Alerts {alertData} {openAlerts} bind:reCallAlerts />

<style>
	* :global(.payment-card) {
		padding: 25px;
	}

	.payment-heading {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 600;
		font-size: 16px;
		line-height: 24px;
		letter-spacing: -0.01em;
		color: #000000;
	}

	.input-label {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 400;
		font-size: 12.2195px;
		line-height: 18px;
		letter-spacing: 0.01em;
		color: #606060;
		margin-bottom: 5px;
	}

	* :global(.svelte-1bsxr9h) {
		font-family: 'Poppins';
		width: 302px;
		height: 44px;
		background: #ffffff;
		border: 1px solid #d9d9d9;
		border-radius: 12px;
	}

	* :global(.upload-btn) {
		width: 195px;
		height: 44px;
		background: #f1f1f1;
		border-radius: 10px;
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 600;
		font-size: 12px;
		line-height: 18px;
		letter-spacing: 0.29442px;
		color: #252733;
		text-transform: none;
	}

	* :global(.mdc-text-field--outlined) {
		width: 70%;
		border: 1px solid #d9d9d9;
		border-radius: 12px;
	}
</style>
