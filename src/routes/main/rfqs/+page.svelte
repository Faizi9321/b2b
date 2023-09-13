<script lang="ts">
	import DashboardWidgets from './../../../components/dashboardWidgets.svelte';
	import TableComponent from '../../../components/tableComponent/tableComponent.svelte';
	import { Delete, GET, POST } from '../../apiService';
	import Button, { Label } from '@smui/button';
	import { beforeUpdate, onMount } from 'svelte';
	import add from '../../../assets/icons/add.png';
	import pendingSubmission from '../../../assets/icons/bi_cart-plus-fill.png';
	import submitted from '../../../assets/icons/bi_cart-fill.png';
	import approved from '../../../assets/icons/bag-tick.png';
	import AdvanceSearch from '../../../components/advancedSearch/advanced-search.svelte';
	import rejected from '../../../assets/icons/bi_cart-x-fill.png';
	import { goto } from '$app/navigation';
	import { profile, langChange } from '../../../store';
	import AskingAlert from '../../../components/asking-alert.svelte';
	import Alerts from '../../../components/alerts.svelte';
	import { _ } from 'svelte-i18n';
	import dropdownStatus from '../../../assets/icons/status.png'
	import viewAction from '../../../assets/icons/view.png'
	import editAction from '../../../assets/icons/edit.png'
	import cancelAction from '../../../assets/icons/cancel.png'
	import trashAction from '../../../assets/icons/trash.png'

	let columnHeaders = {
		id: 'RFQ ID',
		bcName: 'Company',
		createdOn: 'RFQ Date',
		status: 'Status',
		action: 'Action'
	};
	let pageNumber = 1;
	let pageSize = 10;
	let pagination = {
		currentPage: 0,
		perPage: 0,
		totalPages: 0,
		totalCount: 0,
		paginationText: 'RFQs'
	};
	let dataSource: any;
	let cardArray: any[] = [];
	let BcId: any;
	let tableData: any[] = [];
	let search: '';
	let status: '';
	let startDate: any;
	let endDate: any;
	let priceVisibilityAllowed: boolean = true;
	let open: boolean = false;
	let askingAlertData: any;
	let reCallAlert: any;
	let currentId: number = 0;
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
			buttonLabel: 'Approve Quotation',
			buttonRoute: '#',
			type: 'Approve',
			iconSrc: editAction
		},
		{
			buttonLabel: 'Reject Quotation',
			buttonRoute: '#',
			type: 'reject',
			iconSrc: cancelAction
		},
		{
			buttonLabel: 'Delete',
			buttonRoute: '#',
			type: 'delete',
			iconSrc: trashAction
		}
	];

	const statusOptions = [
		{
			id: 'All',
			name: 'All'
		},
		{
			id: 'Quote Submitted',
			name: 'Quote Submitted'
		},
		{
			id: 'Submitted',
			name: 'Submitted'
		},
		{
			id: 'Pending Submission',
			name: 'Pending Submission'
		},
		{
			id: 'Approved',
			name: 'Approved'
		},
		{
			id: 'Rejected',
			name: 'Rejected'
		}
	];

	let advanceSearchConfig = {
		searchLabel: 'Search By RFQ ID, Company Name...',
		dropdowns: [
			{
				placeholder: 'Date Range',
				iconPath: 'assets/icons/date-range.png',
				options: ['option1', 'option2']
			},
			{
				placeholder: 'Status',
				iconPath: dropdownStatus,
				options: [...statusOptions]
			}
		]
	};

	onMount(() => {
		lang = localStorage.getItem('language')!;
		profile.subscribe((value: any) => {
			if (value != '') {
				priceVisibilityAllowed = value.priceVisibilityAllowed;
				BcId = value.bcId;
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
	});

	let getTableData = async () => {
		let url = `RFQ/GetAll`;
		let data = {
			pageNumber: pageNumber,
			pageSize: pageSize,
			sortColumn: 'id',
			sortOrder: 'z',
			search: search != null ? search : null,
			title: null,
			status: status == '' || status == 'All' ? null : status,
			date: startDate != null || endDate != null ? 'string' : null,
			dateFrom: startDate !== undefined || null ? startDate : null,
			dateTo: endDate !== undefined || null ? endDate : null
		};
		await POST(url, data).then((result) => {
			if (result.succeeded) {
				result.data.forEach((element: any) => {
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
			if (item.status == 'Pending Submission') {
				item['view'] = true;
				item['edit'] = true;
				item['delete'] = true;
			} else if (item.status == 'Submitted') {
				item['view'] = true;
			} else if (item.status == 'Quote Submitted') {
				item['view'] = true;
				item['Approve'] = true;
				item['reject'] = true;
			} else if (item.status == 'Approved') {
				item['view'] = true;
			} else if (item.status == 'Rejected') {
				item['view'] = true;
			}
		});
	};

	let cardsData = async () => {
		let url = `RFQ/GetRFQCards?bcId=${BcId}`;
		await GET(url).then((result) => {
			cardArray = result.data;
		});
	};

	let onTableActionClick = (event: any) => {
		if (event.detail.type == 'view') {
			goto(`/main/rfqs/view/${event.detail.data.id}`);
		} else if (event.detail.type == 'edit') {
			goto(`/main/rfqs/edit/${event.detail.data.id}`);
		} else if (event.detail.type == 'delete') {
			currentId = event.detail.data.id;
			open = true;
			askingAlertData = {
				heading: 'Confirm',
				message: 'Are you sure want to Delete.',
				leftButtonText: 'Yes',
				rightButtonText: 'No'
			};
			reCallAlert();
		} else if (event.detail.type == 'Approve') {
			let url = 'RFQ/ApproveRFQ';
			let data = {
				rfqId: parseInt(event.detail.data.id)
			};
			POST(url, data).then((result) => {
				if (result.succeeded) {
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: lang == 'en' ? result.message : result.arMessage,
						type: 'success'
					};
					reCallAlerts();
					getTableData();
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
		} else if (event.detail.type == 'reject') {
			let url = 'RFQ/RejectRFQ';
			let data = {
				rfqId: parseInt(event.detail.data.id)
			};
			POST(url, data).then((result) => {
				if (result.succeeded) {
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: lang == 'en' ? result.message : result.arMessage,
						type: 'success'
					};
					reCallAlerts();
					getTableData();
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

	let onClickRFQCreate = () => {
		if (!priceVisibilityAllowed) {
			goto('/main/rfqs/create');
		} else {
			openAlerts = true;
			alertData = {
				heading: 'Error',
				message:
					'Your RFQ creation is disabled by B2B Admin. You can create a direct order from order screen.',
				type: 'error'
			};
			reCallAlerts();
		}
	};

	let onAlertActions = (ev: any) => {
		if (ev.detail.status) {
			let url = `RFQ/DeleteById?Id=${currentId}`;
			Delete(url).then((result) => {
				if (result.succeeded) {
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: lang == 'en' ? result.message : result.arMessage,
						type: 'success'
					};
					reCallAlerts();
					getTableData();
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
		} else if (!ev.detail.status) {
			getTableData();
		}
	};
</script>

<main class="main">
	<div class="headingSection">
		<h2 style="font-size: 20px;" class="ff-poppins">{$_('Manage RFQs')}</h2>
		<Button
			variant="unelevated"
			class="btn topBtn ff-poppins"
			on:click={onClickRFQCreate}
			style={lang == 'ar' ? 'width:134px' : 'width:154px'}
		>
			<img src={add} height="18px" width="18px" alt="" />
			<Label>{$_('Create RFQ')}</Label>
		</Button>
	</div>
	<div class="cards">
		{#each cardArray as card, index}
			<DashboardWidgets
				order={cardArray[index]?.name}
				orderValue={cardArray[index]?.count}
				percentageValue={cardArray[index]?.percentage.toFixed(2)}
				previousMonthName={cardArray[index]?.previousMonthName}
				icon={card.name == 'Pending Submission'
					? pendingSubmission
					: card.name == 'Submitted'
					? submitted
					: card.name == 'Approved'
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
</main>
<AskingAlert {open} {askingAlertData} bind:reCallAlert on:onClickAertAction={onAlertActions} />
<Alerts {openAlerts} {alertData} bind:reCallAlerts />

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
		grid-template-columns: 2fr 2fr 2fr 2fr 2fr;
		grid-gap: 18px;
		margin-bottom: 26px;
	}
</style>
