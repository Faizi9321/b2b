<script lang="ts">
	import DashboardWidgets from './../../../components/dashboardWidgets.svelte';
	import TableComponent from '../../../components/tableComponent/tableComponent.svelte';
	import { GET, POST } from '../../apiService';
	import Button, { Label } from '@smui/button';
	import { beforeUpdate, onMount, afterUpdate, tick } from 'svelte';
	import add from '../../../assets/icons/add.png';
	import opened from '../../../assets/icons/bi_cart-plus-fill.png';
	import submitted from '../../../assets/icons/bi_cart-fill.png';
	import approved from '../../../assets/icons/bag-tick.png';
	import AdvanceSearch from '../../../components/advancedSearch/advanced-search.svelte';
	import rejected from '../../../assets/icons/bi_cart-x-fill.png';
	import { profile, langChange, detectNotification } from '../../../store';
	import { goto } from '$app/navigation';
	import Alerts from '../../../components/alerts.svelte';
	import { _ } from 'svelte-i18n';
	import dropdownStatus from '../../../assets/icons/status.png'
	import viewAction from '../../../assets/icons/view.png'
	import editAction from '../../../assets/icons/edit.png'
	import cancelAction from '../../../assets/icons/cancel.png'
	import trashAction from '../../../assets/icons/trash.png'

	let columnHeaders = {
		id: 'Order ID',
		bcName: 'Company Name',
		createdBy: 'Created By',
		orderDate: 'Order Date',
		deliveryDate: 'Delivery Date',
		status: 'Status',
		paymentStatus: 'Payment Status',
		totalAmount: 'Total Amount',
		action: 'Action'
	};
	let pageNumber = 1;
	let pageSize = 10;
	let pagination = {
		currentPage: 0,
		perPage: 0,
		totalPages: 0,
		totalCount: 0,
		paginationText: 'Orders'
	};
	let dataSource: any;
	let search = '';
	let status: '';
	let startDate: any;
	let endDate: any;
	let cardArray: any[] = [];
	let BcId: any;
	let tableData: any[] = [];
	let priceVisibilityAllowed: boolean = true;
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let lang: string = 'en';
	let actionButtons = [
		{
			buttonLabel: 'View',
			buttonRoute: 'view',
			type: 'view',
			iconSrc: viewAction
		},
		{
			buttonLabel: 'Edit',
			buttonRoute: '#',
			type: 'edit',
			iconSrc: editAction
		},
		{
			buttonLabel: 'Cancel Order',
			buttonRoute: '#',
			type: 'cancel',
			iconSrc: cancelAction
		},
		{
			buttonLabel: 'Delete',
			buttonRoute: '#',
			type: 'delete',
			iconSrc: trashAction
		}
	];
	let statusOptions = [
		{
			id: 'All',
			name: 'All'
		},
		{
			id: 'Opened',
			name: 'Opened'
		},
		{
			id: 'Submitted',
			name: 'Submitted'
		},
		{
			id: 'Confirmed',
			name: 'Confirmed'
		},
		{
			id: 'Cancelled',
			name: 'Cancelled'
		},
		{
			id: 'In-Transit',
			name: 'In-Transit'
		},
		{
			id: 'Delivered',
			name: 'Delivered'
		},
		{
			id: 'Completed',
			name: 'Completed'
		}
	];

	let advanceSearchConfig = {
		searchLabel: 'Search By Order ID, Company Name...',
		dropdowns: [
			{
				placeholder: 'Date Range',
				iconPath: 'assets/icons/date-range.png',
				options: ['option1', 'option2']
			},
			{
				placeholder: 'Status',
				iconPath: dropdownStatus,
				options: statusOptions
			}
		]
	};

	onMount(() => {
		lang = localStorage.getItem('language')!;
		profile.subscribe((val: any) => {
			if (val != '') {
				priceVisibilityAllowed = val.priceVisibilityAllowed;
				BcId = val.bcId;
			}
		});
		getTableData();
		cardsData();
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		if ($langChange) {
			getTableData();
			langChange.set(false);
		}
		if($detectNotification){
			getTableData();
			detectNotification.set(false)
		}
	});

	let getTableData = async () => {
		let url = `Order/GetAll`;
		let data = {
			pageNumber: pageNumber,
			pageSize: pageSize,
			sortColumn: 'id',
			sortOrder: 'z',
			search: search != null ? search : null,
			title: null,
			status: status == '' || status == 'All' || status == null ? [] : [status],
			date: startDate != null || endDate != null ? 'string' : null,
			dateFrom: startDate !== undefined || null ? startDate : null,
			dateTo: endDate !== undefined || null ? endDate : null
		};
		await POST(url, data).then((result) => {
			if (result.succeeded) {
				result.data.forEach((element: any) => {
					if (element.expDeliveryDay != 0) {
						let newDate = new Date(element.orderDate);
						newDate.setDate(newDate.getDate() + element.expDeliveryDay).toString();
						element.deliveryDate = newDate.toLocaleString();
					} else {
						element.deliveryDate = '';
					}
					element.bcName = lang == 'ar' ? element.arBCName : element.bcName;
				});
				tableData = result.data;
				afterList();
				dataSource = result.data;
				pagination.currentPage = result.pageNumber;
				pagination.perPage = result.pageSize;
				pagination.totalPages = result.totalPages;
				pagination.totalCount = result.totalRecords;
			}
		});
	};

	let afterList = () => {
		tableData.forEach((item: any) => {
			if (item.status == 'Opened') {
				item['view'] = true;
				item['edit'] = true;
				item['cancel'] = true;
			} else if (item.status == 'Submitted') {
				item['view'] = true;
			} else if (item.status == 'Confirmed') {
				item['view'] = true;
			} else if (item.status == 'In-Transit') {
				item['view'] = true;
			} else if (item.status == 'Delivered') {
				item['view'] = true;
			} else if (item.status == 'Completed') {
				item['view'] = true;
			} else if (item.status == 'Cancelled') {
				item['view'] = true;
			}
		});
	};

	let cardsData = async () => {
		let url = `Order/GetOrderCards?bcId=${BcId}`;
		await GET(url).then((result) => {
			cardArray = result.data;
		});
	};

	let onTableActionClick = (event: any) => {
		if (event.detail.type == 'view') {
			goto(`/main/orders/view/${event.detail.data.id}`);
		} else if (event.detail.type == 'edit') {
			goto(`/main/orders/edit/${event.detail.data.id}`);
		} else if (event.detail.type == 'cancel') {
			let url = 'Order/CancelOrder';
			let data = {
				orderId: event.detail.data.id,
				remarks: ''
			};
			POST(url, data).then((result) => {
				if (result.succeeded) {
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: result.message,
						type: 'success'
					};
					reCallAlerts();
					getTableData();
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
		}
	};

	let onChangePage = (ev: any) => {
		pageNumber = ev.detail;
		getTableData();
	};

	let handleSearchRecord = (ev: any) => {
		getTableData();
	};

	let handleSearchByStatus = (ev: any) => {
		status = ev.detail.option;
		getTableData();
	};

	let handleSearchByDate = (ev: any) => {
		(startDate = ev.detail.date.startDate), (endDate = ev.detail.date.endDate), getTableData();
	};

	let onClickOrderCreate = () => {
		if (priceVisibilityAllowed) {
			goto('/main/orders/create');
		} else {
			openAlerts = true;
			alertData = {
				heading: 'Error',
				message:
					'Your Order creation is disabled by B2B Admin. Please create RFQ to place your order.',
				type: 'error'
			};
			reCallAlerts();
		}
	};
</script>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />

<div class="main">
	<div class="headingSection">
		<h2 style="font-size: 20px;" class="ff-poppins">{$_('Manage Orders')}</h2>
		<Button
			variant="unelevated"
			class="btn topBtn ff-poppins"
			on:click={onClickOrderCreate}
			style={lang == 'en' ? 'width:170px' : 'width:126px'}
		>
			<img src={add} height="18px" width="18px" alt="" />
			<Label>{$_('Create Order')}</Label>
		</Button>
	</div>
	<div class="cards">
		{#each cardArray as card, index}
			<DashboardWidgets
				order={cardArray[index]?.name}
				orderValue={cardArray[index]?.count}
				percentageValue={cardArray[index]?.percentage.toFixed(2)}
				previousMonthName={cardArray[index]?.previousMonthName}
				icon={card.name == 'Opened'
					? opened
					: card.name == 'Submitted'
					? submitted
					: card.name == 'Completed'
					? approved
					: rejected}
			/>
		{/each}
	</div>
	<AdvanceSearch
		{advanceSearchConfig}
		bind:searchVal={search}
		on:searchText={handleSearchRecord}
		on:dropdown={handleSearchByStatus}
		on:datepicker={handleSearchByDate}
	/>
	<TableComponent
		{columnHeaders}
		{dataSource}
		{actionButtons}
		{pagination}
		on:onClickAction={onTableActionClick}
		on:onClickPagination={onChangePage}
	/>
</div>

<style>
	.headingSection {
		display: flex;
		place-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	* :global(.topBtn) {
		height: 40px;
		display: flex;
		place-content: space-between;
		align-items: center;
	}

	.cards {
		display: grid;
		grid-template-columns: 2fr 2fr 2fr 2fr;
		grid-gap: 18px;
		margin-bottom: 26px;
	}
</style>
