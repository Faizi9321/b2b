<!--* Script -->
<script lang="ts">
	import Button, { Label } from '@smui/button';
	import add from '../../../assets/icons/add.png';
	import TableComponent from '../../../components/tableComponent/tableComponent.svelte';
	import { POST } from '../../apiService';
	import { beforeUpdate, onMount } from 'svelte';
	import AdvanceSearch from '../../../components/advancedSearch/advanced-search.svelte';
	import { goto } from '$app/navigation';
	import Alerts from '../../../components/alerts.svelte';
	import AskingAlert from '../../../components/asking-alert.svelte';
	import { _ } from 'svelte-i18n';
	import { langChange } from '../../../store';
	import dropdownStatus from '../../../assets/icons/status.png'
	import viewAction from '../../../assets/icons/view.png'
	import editAction from '../../../assets/icons/edit.png'

	let alertData: any;
	let openAlerts: boolean = false;
	let reCallAlerts: any;
	let columnHeaders = {
		id: 'Id',
		enFullName: 'Manager Name',
		phoneNumber: 'Mobile Number',
		email: 'Email Address',
		createdOn: 'Created Date',
		activeStatus: 'Status',
		role: 'Role',
		action: 'Action'
	};
	let pageNumber = 1;
	let pageSize = 10;
	let pagination = {
		currentPage: 0,
		perPage: 0,
		totalPages: 0,
		totalCount: 0,
		paginationText: 'Companies'
	};
	let currentId: number = 0;
	let currentStatus: boolean;
	let tableData: any[] = [];
	let actionButtons = [
		{
			buttonLabel: 'View',
			buttonRoute: 'view',
			type: 'view',
			iconSrc: viewAction
		},
		{
			buttonLabel: 'Edit',
			buttonRoute: 'edit',
			type: 'edit',
			iconSrc: editAction
		}
	];

	let dataSource: any;
	let search = '';
	let status: boolean;
	let startDate: any;
	let endDate: any;
	let open: boolean = false;
	let askingAlertData: any;
	let reCallAlert: any;
	let lang: string = 'en';
	let advanceSearchConfig = {
		searchLabel: 'Search Name, Mobile Number...',
		dropdowns: [
			{
				placeholder: 'Date Range',
				iconPath: 'assets/icons/date-range.png',
				options: ['option1', 'option2']
			},
			{
				placeholder: 'Status',
				iconPath: dropdownStatus,
				options: [
					{ id: 'All', name: 'All' },
					{ id: true, name: 'Active' },
					{ id: false, name: 'In Active' }
				]
			}
		]
	};

	onMount(() => {
		lang = localStorage.getItem('language')!;
		getTableData();
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		if ($langChange) {
			getTableData();
			langChange.set(false);
		}
	});

	let getTableData = async () => {
		let url = `BCUser/GetAll`;
		let data = {
			pageNumber: pageNumber,
			pageSize: pageSize,
			sortColumn: 'id',
			sortOrder: 'z',
			search: search != null ? search : null,
			name: null,
			status: status == false ? false : status == true ? true : null,
			date: startDate != null || endDate != null ? 'string' : null,
			dateFrom: startDate !== undefined || null ? startDate : null,
			dateTo: endDate !== undefined || null ? endDate : null
		};
		await POST(url, data).then((result) => {
			if (result.succeeded) {
				result.data.forEach((element: any) => {
					element.enFullName = lang == 'ar' ? element.arFullName : element.enFullName;
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

	let onChangePage = (ev: any) => {
		pageNumber = ev.detail;
		getTableData();
	};

	let onTableActionClick = (event: any) => {
		if (event.detail.type == 'view') {
			goto(`/main/customers/view/${event.detail.data.id}`);
		} else {
			goto(`/main/customers/edit/${event.detail.data.id}`);
		}
	};

	let afterList = () => {
		tableData.forEach((item: any) => {
			item['view'] = true;
			item['edit'] = true;
		});
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

	let onToggleBtn = (ev: any) => {
		open = true;
		currentId = ev.detail.id;
		currentStatus = ev.detail.status;
		askingAlertData = {
			heading: 'Confirm',
			message: ev.detail.status ? 'Do you want to Active ?' : 'Do you want to In Active ?',
			leftButtonText: 'Yes',
			rightButtonText: 'No'
		};
		reCallAlert();
	};

	let onAlertActions = (ev: any) => {
		if (ev.detail.status) {
			let url = `BCUser/ChangeUserStatus`;
			let data = {
				id: currentId,
				status: currentStatus
			};
			POST(url, data).then((result) => {
				if (result.succeeded) {
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: lang == 'en' ? result.message:result.arMessage,
						type: 'success'
					};
					reCallAlerts();
					getTableData();
				} else {
					openAlerts = true;
					alertData = {
						heading: 'Error',
						message: lang == 'en' ? result.message:result.arMessage,
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

<!--* Template -->
<main class="main">
	<div class="headingSection">
		<h2 class="ff-poppins">{$_('User Management')}</h2>
		<Button
			variant="unelevated"
			class="btn topBtn ff-poppins"
			on:click={() => goto('/main/customers/create')}
			style={lang == 'en' ? 'width:230px' : 'width:150px'}
		>
			<img src={add} alt="" />
			<Label class="label" style="padding:0">{$_('Add Company Manager')}</Label>
		</Button>
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
		on:toggleObj={onToggleBtn}
	/>
</main>

<Alerts {alertData} {openAlerts} bind:reCallAlerts />

<AskingAlert {open} {askingAlertData} bind:reCallAlert on:onClickAertAction={onAlertActions} />

<!--* Style -->
<style>
	.headingSection {
		display: flex;
		place-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	* :global(.mdc-button .mdc-button__label) {
		font-family: poppins;
		text-transform: capitalize;
		font-size: 12px;
	}

	.headingSection h2 {
		font-size: 20px;
	}

	* :global(.topBtn) {
		height: 40px;
		display: flex;
		place-content: space-between;
		align-items: center;
	}

	.headingSection img {
		height: 15px;
		width: 15px;
	}
</style>
