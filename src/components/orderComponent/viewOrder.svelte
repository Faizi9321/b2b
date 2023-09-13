<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Card from '@smui/card/src/Card.svelte';
	import tabSeparator from '../../assets/icons/tab-sep.png';
	import Product from '../products.svelte';
	import { beforeUpdate, onMount } from 'svelte';
	import { GET, POST } from '../../routes/apiService';
	import { appConfig } from '../../config';
	import address from '../../assets/icons/address.png';
	import SummaryTable from '../summaryTable.svelte';
	import placeHolder from '../../assets/images/default-placeholder.png';
	import { goto } from '$app/navigation';
	import PaymentDetails from '../payment-details.svelte';
	import print from '../../assets/icons/print-invoice.png';
	import AskingAlert from '../asking-alert.svelte';
	import Alerts from '../alerts.svelte';
	import { _ } from 'svelte-i18n';

	export let formObj: any;
	let details: any;
	let isProducts: boolean = true;
	let isSummary: boolean = false;
	let payment: boolean = false;
	let products: any[] = [];
	let subTotal: number = 0;
	let deliveryCharges: number = 0;
	let vatTotal: number = 0;
	let orderPaymentDetail: any;
	let view = formObj.view;
	let topBtnText: string = '';
	let open: boolean = false;
	let askingAlertData: any;
	let reCallAlert: any;
	let alertData: any;
	let openAlerts: boolean = false;
	let reCallAlerts: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		getData();
		getPayment();
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
	});

	const getPayment = async () => {
		let url = `Order/ViewPaymentProof?orderId=${formObj.id}`;
		await GET(url).then((result) => {
			if (result.succeeded) {
				orderPaymentDetail = result.data;
			}
		});
	};

	let getData = async () => {
		let url =
			formObj.view === 'view-rfq'
				? `RFQ/GetById?Id=${formObj.id}`
				: `Order/GetById?Id=${formObj.id}`;
		await GET(url).then((result) => {
			(formObj.view === 'view-rfq' ? result.data.rfqDetails : result.data.orderDetails).forEach(
				(element: any) => {
					element.retailPrice = element.unitPrice == null ? 0 : element.unitPrice;
					element.vat = element.vatAmount == undefined ? element.vat : element.vatAmount;
					element.enName = element.productName == undefined ? element.enName : element.productName;
					element.qty = element.quantity;
					element.totalUnitPrice =
						formObj.view === 'view-rfq'
							? element.quantity * (element.unitPrice == null ? 0 : element.unitPrice) + element.vat
							: element.quantity * (element.unitPrice == null ? 0 : element.unitPrice);
				}
			);
			details = result.data;
			products = formObj.view === 'view-rfq' ? result.data.rfqDetails : result.data.orderDetails;
			subTotal =
				formObj.view === 'view-rfq'
					? result.data.totalRFQPrice == null
						? 0
						: result.data.totalRFQPrice
					: result.data.totalOrderPrice == null
					? 0
					: result.data.totalOrderPrice;
			vatTotal = result.data.totalVATAmount == null ? 0 : result.data.totalVATAmount;
			deliveryCharges =
				result.data.deliveryCharges == null || result.data.status == 'Pending Submission'
					? 0
					: result.data.deliveryCharges;
		});

		if (details?.status == 'Pending Submission') {
			topBtnText = 'Send RFQ';
		} else {
			topBtnText = 'Submit Order';
		}

		if (
			details?.status == 'Delivered' ||
			details?.status == 'Completed' ||
			details?.status == 'In-Transit'
		) {
			isProducts = false;
			isSummary = false;
			payment = true;
			topBtnText = 'Print Invoice';
		}
	};

	let onChangeBlock = (type: string) => {
		if (type == 'products') {
			isProducts = true;
			isSummary = false;
			payment = false;
		} else if (type == 'summary') {
			isProducts = false;
			isSummary = true;
			payment = false;
		} else if (type == 'payment') {
			isProducts = false;
			isSummary = false;
			payment = true;
		}
	};

	let onContinue = (val: any) => {
		if (val === 'isSummary') {
			isProducts = false;
			isSummary = true;
			payment = false;
		} else {
			isProducts = false;
			isSummary = false;
			payment = true;
		}
	};

	let onSubmit = () => {
		if (details?.status == 'Pending Submission') {
			open = true;
			reCallAlert();
			askingAlertData = {
				heading: 'Send RFQ!',
				message: 'Are you sure you want to send your RFQ',
				leftButtonText: 'Send',
				rightButtonText: 'Cancel'
			};
		} else if (details?.status == 'Opened') {
			open = true;
			reCallAlert();
			askingAlertData = {
				heading: 'Submit Order!',
				message: 'Are you sure you want to Submit your order.',
				leftButtonText: 'Submit',
				rightButtonText: 'Cancel'
			};
		} else if (
			details?.status == 'In-Transit' ||
			details?.status == 'Delivered' ||
			details?.status == 'Completed'
		) {
			let url = `Order/GetOrderInvoiceById?Id=${formObj.id}`;
			GET(url).then((result) => {
				if (result.succeeded) {
					if (result.data != '' && result.data != null && result.data != undefined) {
						window.open(`${appConfig.file_base_url}${result.data.customerInvoicePath}`);
					}
				} else {
					openAlerts = true;
					alertData = {
						heading: 'Error',
						message: lang =='en'? result.message:result.arMessage,
						type: 'error'
					};
					reCallAlerts();
				}
			});
		}
	};

	let onClickAction = (ev: any) => {
		if (details?.status == 'Pending Submission' || details?.status == 'Opened') {
			if (view == 'view-rfq') {
				if (ev.detail.status) {
					let url = 'RFQ/SubmitRFQ';
					let data = {
						rfqId: parseInt(formObj.id)
					};
					POST(url, data).then((result) => {
						if (result.succeeded) {
							goto('/main/rfqs');
							openAlerts = true;
							alertData = {
								heading: 'Success',
								message: lang =='en'? result.message:result.arMessage,
								type: 'success'
							};
							reCallAlerts();
						} else {
							openAlerts = true;
							alertData = {
								heading: 'Error',
								message: lang =='en'? result.message:result.arMessage,
								type: 'error'
							};
							reCallAlerts();
						}
					});
				}
			} else {
				if (ev.detail.status) {
					let url = 'Order/SubmitOrder';
					let data = {
						orderId: parseInt(formObj.id)
					};
					POST(url, data).then((result) => {
						if (result.succeeded) {
							goto('/main/orders');
							openAlerts = true;
							alertData = {
								heading: 'Success',
								message: lang =='en'? result.message:result.arMessage,
								type: 'success'
							};
							reCallAlerts();
						} else {
							openAlerts = true;
							alertData = {
								heading: 'Error',
								message: lang =='en'? result.message:result.arMessage,
								type: 'error'
							};
							reCallAlerts();
						}
					});
				}
			}
		}
	};
</script>

<main>
	<div class="main">
		{#if details?.status == 'Pending Submission' || details?.status == 'Opened' || details?.status == 'In-Transit' || details?.status == 'Delivered' || details?.status == 'Completed'}
			<div class="top-btn-div">
				<Button
					variant="unelevated"
					class={topBtnText == 'Print Invoice'
						? 'btn ff-poppins-semibold printBtn'
						: 'btn ff-poppins-semibold'}
					on:click={onSubmit}
					style="height:46px"
				>
					{#if topBtnText == 'Print Invoice'}
						<img src={print} alt="" width="20px" />
					{/if}
					<Label>{$_(topBtnText)}</Label>
				</Button>
			</div>
		{/if}
		<div class="main-edit-detail">
			<div style="display: flex; flex-direction:column">
				<Card class="detail-card">
					<p class="card-heading">{view == 'view-rfq' ? $_('RFQ Details') : $_('Order Details')}</p>
					<div class="all-details-div">
						<div>
							<p class="value-type">{view == 'view-rfq' ? $_('RFQ Date') : $_('Order Date')}</p>
							<p class="value-name">{new Date(details?.createdOn).toLocaleString()}</p>
						</div>
						<div>
							<p class="value-type">{$_('Delivery Type')}</p>
							<p class="value-name" style="color: rgba(255, 0, 0, 1);">
								{lang == 'en' ? details?.deliveryType : details?.arDeliveryType}
							</p>
						</div>
						<div>
							<p class="value-type">{$_('Delivery Charges')}</p>
							<p class="value-name">
								SAR {details?.status == 'Pending Submission' ? '00' : details?.deliveryCharges}
							</p>
						</div>
						<div>
							<p class="value-type">{view == 'view-rfq' ? $_('RFQ Status') : $_('Order Status')}</p>
							<p class="value-name" style="color: rgba(23, 121, 184, 1);">
								{$_(details?.paymentStatus)}
							</p>
						</div>
						<!-- <div>
							<p class="value-type">Dark Store</p>
							<p class="value-name">{details?.storeName}</p>
						</div> -->
						<div>
							<p class="value-type">{$_('Payment Status')}</p>
							<p class="value-name" style="color: rgba(248, 183, 17, 1);">{$_(details?.status)}</p>
						</div>
						{#if view != 'view-rfq'}
							<div>
								<p class="value-type">{$_('Expected Delivery (Days)')}</p>
								<p class="value-name">{details?.expDeliveryDay}</p>
							</div>
						{/if}
					</div>
				</Card>
				<div class="tab-section">
					<div class="tab-card div-backgorund">
						<Button
							class="tab-btn ff-poppins-semibold"
							style={isProducts ? 'color:#1779B8;pointer-events:none;' : 'color:#B3B3B3;'}
							on:click={() => onChangeBlock('products')}
						>
							<Label>{$_('Products')}</Label>
						</Button>
						<img
							src={tabSeparator}
							width="24px"
							height="55px"
							alt=""
							style={lang == 'ar' ? 'transform:rotate(180deg)' : ''}
						/>
						<Button
							class="tab-btn ff-poppins-semibold"
							style={isSummary ? 'color:#1779B8;pointer-events:none;' : 'color:#B3B3B3;'}
							on:click={() => onChangeBlock('summary')}
						>
							<Label>{$_('Summary')}</Label>
						</Button>
						{#if details?.status == 'Delivered' || details?.status == 'Completed' || details?.status == 'In-Transit'}
							<img
								src={tabSeparator}
								width="24px"
								height="55px"
								alt=""
								style={lang == 'ar' ? 'transform:rotate(180deg)' : ''}
							/>
							<Button
								class="tab-btn ff-poppins-semibold"
								style={payment ? 'color:#1779B8;pointer-events:none;' : 'color:#B3B3B3;'}
								on:click={() => onChangeBlock('payment')}
							>
								<Label>{$_('Payment')}</Label>
							</Button>
						{/if}
					</div>
				</div>
			</div>
			<Card>
				<div class="customer-info">
					<Card class="customer-info-card">
						<p class="card-heading ">{$_('Customer Information')}</p>
						<div class="customer-info-content">
							<Card style="box-shadow: 0px 20px 60px rgba(0, 0, 0, 0.05);">
								<img
									src={details?.bcLogo == undefined
										? placeHolder
										: appConfig.file_base_url + details?.bcLogo}
									style="width: 70px; height: 70px"
									alt=""
									class="customer-info-img"
								/>
							</Card>
							<p class="customer-name">{lang == 'en' ? details?.bcName : details?.arBCName}</p>
							{#if view != 'view-rfq'}
								<p class="customer-email">{details?.bcEmail}</p>
								<p class="customer-phone">{details?.bcContactNo}</p>
							{/if}
							<p />
						</div>
					</Card>
					<div class="delivery-address">
						<hr style="color: rgba(0, 0, 0, 1);" />
						<div style="display: flex; justify-content:space-between; align-items: center;  ">
							<p class="delivery-address-heading">{$_('Delivery Address')}</p>
							<a href={details?.googleMapLink} target="_blank" rel="noreferrer">
								<img src={address} style="height: 40px; width:40px" alt="" />
							</a>
						</div>
						<p class="customer-address">{details?.locationAddress}</p>
					</div>
				</div>
			</Card>
		</div>
		{#if isProducts}
			<div class="products-block">
				{#if details?.rfqDetails !== undefined}
					{#each details?.rfqDetails as rfqdetail}
						<Product data={rfqdetail} disabledFiedls={true} />
					{/each}
				{:else if details?.orderDetails !== undefined}
					{#each details?.orderDetails as orderdetail}
						<Product data={orderdetail} disabledFiedls={true} />
					{/each}
				{/if}
			</div>
			<Button
				variant="unelevated"
				class="btn ff-poppins-semibold"
				style="font-size: 14px;width: 156px;margin: 40px 0 20px;"
				on:click={() => onContinue('isSummary')}
			>
				<Label>{$_('Continue')}</Label>
			</Button>
		{/if}
		<!-- invoice block  -->
		{#if isSummary}
			<div style="margin-top: 40px;">
				<SummaryTable {products} {subTotal} {deliveryCharges} {vatTotal} />

				{#if details?.status == 'Delivered' || details?.status == 'Completed' || details?.status == 'In-Transit'}
					<Button
						variant="unelevated"
						class="btn ff-poppins-semibold"
						style="font-size: 14px;width: 156px;margin: 40px 0 20px;"
						on:click={() => onContinue('payment')}
					>
						<Label>{$_('Continue')}</Label>
					</Button>
				{/if}
			</div>
		{/if}

		{#if payment}
			<div style="margin-top: 40px;">
				<PaymentDetails
					{orderPaymentDetail}
					order_id={formObj.id}
					disableBtn={details?.status == 'Completed' ? true : false}
				/>
			</div>
		{/if}
	</div>
</main>
<Alerts {alertData} {openAlerts} bind:reCallAlerts />
<AskingAlert {open} {askingAlertData} bind:reCallAlert on:onClickAertAction={onClickAction} />

<style>
	.products-block {
		margin-top: 30px;
		display: grid;
		grid-template-columns: 2fr 2fr 2fr 2fr;
		row-gap: 30px;
	}
	.top-btn-div {
		display: flex;
		justify-content: end;
	}
	.main-edit-detail {
		display: grid;
		grid-template-columns: 7fr 4fr;
		column-gap: 30px;
		margin-top: 15px;
	}

	* :global(.detail-card) {
		padding: 25px;
		height: 300px;
	}

	.all-details-div {
		display: grid;
		grid-template-areas: '1 1 1';
		row-gap: 5px;
	}

	.card-heading {
		font-family: 'Poppins';
		font-weight: 600;
		font-size: 18px;
		color: #252733;
		margin-top: 0px;
	}

	.value-type {
		font-family: 'Poppins';
		font-weight: 400;
		font-size: 12.2195px;
		line-height: 18px;
		letter-spacing: 0.01em;
		color: #606060;
	}

	.value-name {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 600;
		font-size: 14px;
		line-height: 21px;
		letter-spacing: 0.29442px;
		color: #252733;
	}

	.customer-info {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	* :global(.customer-info-card) {
		margin: 15px;
		padding: 15px;
	}

	.customer-info-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 30px;
	}

	.customer-name {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 700;
		font-size: 16px;
		line-height: 24px;
		letter-spacing: 0.29442px;
		color: #252733;
		margin-bottom: 0px;
	}

	.customer-email {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 400;
		font-size: 14px;
		line-height: 21px;
		letter-spacing: 0.29442px;
		color: #38a7ee;
		margin: 0;
	}

	.customer-phone {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 500;
		font-size: 14px;
		line-height: 21px;
		letter-spacing: 0.29442px;
		color: #252733;
		margin: 0;
	}

	.delivery-address {
		margin: 15px;
	}

	.delivery-address-heading {
		font-family: 'Poppins';
		font-weight: 600;
		font-size: 14px;
		line-height: 21px;
		letter-spacing: -0.01em;
		color: #000000;
		opacity: 0.9;
		margin: 15px;
	}

	.customer-address {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 400;
		font-size: 14px;
		line-height: 21px;
		letter-spacing: 0.29442px;
		color: #252733;
		margin-left: 15px;
	}

	* :global(.mdc-button__ripple) {
		display: none;
	}

	.tab-section {
		padding: 40px 0;
		display: flex;
		place-content: space-between;
		align-items: center;
	}

	.tab-card {
		border: 1px solid #efeeeb;
		background: #ffffff;
		box-shadow: 0px 20px 60px rgba(0, 0, 0, 0.05);
		border-radius: 70px;
		padding: 14px;
		height: 26px;
		display: flex;
		place-content: center;
		align-items: center;
	}
	* :global(.tab-btn) {
		text-transform: capitalize;
	}
	.customer-info-img {
		background: #ffffff;
		border: 1px solid rgba(39, 15, 15, 0.06);
		box-shadow: 0px 4px 4px rgb(0 0 0 / 10%);
		border-radius: 10px;
		padding: 4px;
	}
	:global(.printBtn) {
		height: 46px;
		width: 170px;
		display: flex;
		place-content: space-between;
		align-items: center;
	}
</style>
