<script lang="ts">
	import Card from '@smui/card';
	import Textfield from '@smui/textfield';
	import Slider from '@smui/slider';
	import Select, { Option } from '@smui/select';
	import { beforeUpdate, onMount } from 'svelte';
	import { Delete, GET, POST } from '../../../routes/apiService';
	import { langChange, profile } from '../../../store';
	import { appConfig } from '../../../config';
	import placeHolder from '../../../assets/images/default-placeholder.png';
	import Button, { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import TableComponent from '../../../components/tableComponent/tableComponent.svelte';
	import add from '../../../assets/icons/add.png';
	import './bcprofile.scss';
	import Alerts from '../../../components/alerts.svelte';
	import AskingAlert from '../../../components/asking-alert.svelte';
	import { _ } from 'svelte-i18n';
	import viewAction from '../../../assets/icons/view.png'
	import editAction from '../../../assets/icons/edit.png'
	import trashAction from '../../../assets/icons/trash.png'

	let categories: any = [];
	let deliveryDays: any = [];
	let valueStart = 1;
	let valueEnd = 5;
	let emailDisabled: boolean = true;
	let id: number = 0;
	let enName: string = '';
	let arName: string = '';
	let bcEmail: string = '';
	let bcCategoryName: string = '';
	let bcDescription: string = '';
	let bcCategoryId: number = 0;
	let commercialRegistrationNumber: string = '';
	let mainContactPerson: string = '';
	let contactPersonMobileNo: string = '';
	let contactPersonWhatsappNo: string = '';
	let businessCustomerLogoPath: any = null;
	let commercialRegistrationPath: any = null;
	let showName: any;
	let openAlerts: boolean = false;
	let reCallAlerts: any;
	let bcId: any;
	let days: any = [
		{ id: 1, day: 'Monday', selected: false },
		{ id: 2, day: 'Tuesday', selected: false },
		{ id: 3, day: 'Wednesday', selected: false },
		{ id: 4, day: 'Thursday', selected: false },
		{ id: 5, day: 'Friday', selected: false },
		{ id: 6, day: 'Saturday', selected: false },
		{ id: 7, day: 'Sunday', selected: false }
	];
	let columnHeaders = {
		id: 'Id',
		address: 'Address',
		countryName: 'Country',
		createdOn: 'Created Date',
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
		paginationText: 'Locations'
	};
	let open: boolean = false;
	let alertData: any;
	let tableData: any[] = [];
	let askingAlertData: any;
	let reCallAlert: any;
	let currentId: number = 0;
	let currentStatus: boolean;
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
		},
		{
			buttonLabel: 'Delete',
			buttonRoute: 'delete',
			type: 'delete',
			iconSrc: trashAction
		}
	];
	let dataSource: any;
	let lang: string = 'en';
	let avatar: any, fileinput: any;
	let businessCustomerLogo = '';
	let file: any,
		fileSelect: any,
		fileName: string = '';
	let commercialRegistration = '';

	onMount(async () => {
		lang = localStorage.getItem('language')!;
		getTableData();
		getCategories();
		profile.subscribe(async (val: any) => {
			if (val != '') {
				id = val.bcId;
				let url = `BCProfile/GetById?id=${id}`;
				await GET(url).then((result) => {
					id;
					enName = result.data.enName;
					arName = result.data.arName;
					bcEmail = result.data.bcEmail;
					bcCategoryId = result.data.bcCategoryId;
					bcDescription = result.data.bcDescription;
					commercialRegistrationNumber = result.data.commercialRegistrationNumber;
					mainContactPerson = result.data.mainContactPerson;
					contactPersonMobileNo = result.data.contactPersonMobileNo;
					contactPersonWhatsappNo = result.data.contactPersonWhatsappNo;
					businessCustomerLogoPath = result.data.businessCustomerLogoPath;
					commercialRegistrationPath = result.data.commercialRegistrationPath;
					avatar =
						result.data.businessCustomerLogoPath == '' || null
							? placeHolder
							: `${appConfig.file_base_url}${result.data.businessCustomerLogoPath}`;

					file = `${result.data.commercialRegistrationPath}`;
					showName = result.data.commercialRegistrationPath.substring(93);
					deliveryDays = result.data.productDeliveryDay;
					let array = days.filter((daysList: any) => {
						deliveryDays.forEach((response: any) => {
							if (daysList.day == response.deliveryDay) {
								daysList.selected = true;
							}
						});
						return days;
					});
					days = [];
					days = array;
				});
			}
		});
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		if ($langChange) {
			getTableData();
			getCategories();
			langChange.set(false);
		}
	});

	let onTableActionClick = async (event: any) => {
		if (event.detail.type == 'edit') {
			goto(`/main/BCprofile/edit/${event.detail.data.id}`);
		} else if (event.detail.type == 'view') {
			goto(`/main/BCprofile/view/${event.detail.data.id}`);
		} else {
			currentId = event.detail.data.id;
			open = true;
			askingAlertData = {
				heading: 'Confirm',
				message: 'Are you sure want to delete ?',
				leftButtonText: 'Yes',
				rightButtonText: 'No',
				type: 'delete'
			};
			reCallAlert();
		}
	};

	let afterList = () => {
		tableData.forEach((item: any) => {
			item['view'] = true;
			item['edit'] = true;
			item['delete'] = true;
		});
	};

	let onChangePage = (ev: any) => {
		pageNumber = ev.detail;
		getTableData();
	};

	let getTableData = async () => {
		let url = `Location/GetAll`;
		let data = {
			pageNumber: pageNumber,
			pageSize: pageSize,
			sortColumn: 'id',
			sortOrder: 'a',
			name: null
		};
		await POST(url, data).then((result) => {
			if (result.succeeded) {
				result.data.forEach((element: any) => {
					element.countryName = lang == 'ar' ? element.arCountryName : element.countryName;
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

	let getCategories = () => {
		let url = `BCCategory/GetAll?SortColumn=name&PageNumber=1&PageSize=100&SortOrder=a`;
		GET(url).then((result) => {
			if (result.succeeded) {
				categories = result.data;
			}
		});
	};

	let goToImage = (link: any) => {
		window.open(link, '_blank');
	};

	let onClickDays = (item: any, index: number) => {
		let daysArr = [];
		if (item.selected) {
			daysArr = days.filter((day: any, i: number) => {
				if (i == index) {
					day.selected = false;
					deliveryDays.filter((day: any, i: number) => {
						if (day.deliveryDay == item.day) {
							deliveryDays.splice(i, 1);
						}
					});
				}
				return days;
			});
			days = [];
			days = daysArr;
		} else {
			daysArr = days.filter((day: any, i: number) => {
				if (i == index) {
					day.selected = true;
					profile.subscribe(async (val: any) => {
						bcId = val.bcId;
					});
					if ((day.selected = true)) {
						deliveryDays.push({
							id: 0,
							deliveryDay: day.day,
							startTime: '2022-08-31T12:05:38.944Z',
							endTime: '2022-08-31T12:05:38.944Z',
							bcProfileId: bcId
						});
					}
				}
				return days;
			});
			days = [];
			days = daysArr;
		}
	};

	let onFileSelected = async (e: any) => {
		if (e.target.files[0].size <= 512000) {
			const image = e.target.files[0];
			let reader = new FileReader();
			reader.readAsDataURL(image);
			reader.onload = (e: any) => {
				avatar = e.target.result;
			};
			businessCustomerLogo = image;
		} else {
			openAlerts = true;
			reCallAlerts();
			alertData = { type: 'error', heading: 'Error', message: 'Company Logo file size exceed' };
		}
	};

	let onSelectedFile = async (e: any) => {
		const fileChoose = e.target.files[0];
		fileName = e.target.files[0].name;

		let reader = new FileReader();
		reader.readAsDataURL(fileChoose);
		reader.onload = (e: any) => {
			file = e.target.result;
		};
		commercialRegistration = fileChoose;
	};

	let deleteImgLogo = () => {
		avatar = '';
		businessCustomerLogoPath = '';
	};

	let deleteImg = () => {
		file = '';
		fileName = '';
		commercialRegistrationPath = '';
	};

	let submit = async () => {
		let url = 'BCProfile/CreateUpdate';
		let data = {
			businessCustomerLogo,
			commercialRegistration,
			obj: JSON.stringify({
				id,
				enName,
				arName,
				bcCategoryId,
				bcEmail,
				bcCategoryName,
				bcDescription,
				commercialRegistrationNumber,
				mainContactPerson,
				contactPersonMobileNo,
				contactPersonWhatsappNo,
				activeStatus: true,
				approveCustomer: true,
				productDeliveryDay: deliveryDays,
				businessCustomerLogoPath,
				commercialRegistrationPath
			})
		};
		if (
			enName != '' &&
			arName != '' &&
			bcCategoryId != 0 &&
			mainContactPerson != '' &&
			contactPersonMobileNo != '' &&
			contactPersonWhatsappNo != ''
		) {
			POST(url, data, true).then((result: any) => {
				if (result.succeeded) {
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
				message: 'Please fill all required fields.',
				type: 'error'
			};
			reCallAlerts();
		}
	};

	let onToggleBtn = (ev: any) => {
		open = true;
		currentId = ev.detail.id;
		currentStatus = ev.detail.status;
		askingAlertData = {
			heading: 'Confirm',
			message: ev.detail.status ? 'Do you want to Active ?' : 'Do you want to In Active ?',
			leftButtonText: 'Yes',
			rightButtonText: 'No',
			type: 'active'
		};
		reCallAlert();
	};

	let onClickAction = (ev: any) => {
		if (ev.detail.type == 'active') {
			if (ev.detail.status) {
				let url = `Location/UpdateActiveLoctionStatus`;
				let data = {
					id: currentId,
					status: currentStatus
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
			} else if (!ev.detail.status) {
				getTableData();
			}
		} else if (ev.detail.type == 'delete') {
			if (ev.detail.status) {
				let url = `Location/DeleteById?Id=${currentId}`;
				Delete(url).then((result) => {
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
			} else if (!ev.detail.status) {
				getTableData();
			}
		}
	};
</script>

<!--* Template -->
<main class="main">
	<div style="font-family: poppins-semibold; font-size: 20px">{$_('Company Profile')}</div>
	<Card style="padding:20px;">
		<form>
			<h4 style="font-size: 16px;margin:0" class="ff-poppins-semibold">{$_('Company Details')}</h4>
			<div style="display: grid; grid-template-columns: 2fr 2fr; grid-gap: 20px;">
				<div class="two_columns">
					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">
							{$_('Company Name')}[English]*
						</p>
						<Textfield
							class="shaped-outlined"
							variant="outlined"
							bind:value={enName}
							label="{$_('Company Name')}[English]*"
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">
							{$_('Company Name')} [العربية]*
						</p>
						<Textfield
							class="shaped-outlined arabic-field"
							variant="outlined"
							style="text-align: right;"
							bind:value={arName}
							label="{$_('Company Name')} [العربية]*"
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Email')}*</p>
						<Textfield
							class="shaped-outlined"
							variant="outlined"
							disabled={emailDisabled}
							bind:value={bcEmail}
							label="example@email.com"
							noLabel={true}
							ripple={false}
						/>
					</div>

					<div class="input-field">
						<p class="ff-poppins" style="font-size:13px; color: #606060">
							{$_('Company Category')}*
						</p>
						<Select
							variant="filled"
							bind:value={bcCategoryId}
							label="{$_('Company Category')}*"
							noLabel={true}
							class="options"
						>
							{#each categories as type}
								<Option value={type.id}>{lang == 'en' ? type.name : type.arName}</Option>
							{/each}
						</Select>
					</div>
				</div>

				<div>
					<div class="ff-poppins" style="font-size:13px; color: #606060">
						<p>{$_('Profile Image')}</p>
					</div>

					<div class="image-profile" style="position:relative">
						{#if avatar}
							<img class="image_profile" src={avatar} alt="" width="90px;" height="90px" />
						{:else}
							<img
								class="image_profile"
								src={placeHolder}
								alt=""
								width="90px;"
								height="90px"
							/>
						{/if}
						<div class="profile-img-btns">
							<span>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i
									class="mi mi-camera"
									on:click={() => {
										fileinput.click();
									}}
									style="cursor: pointer"
								/>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<i class="mi mi-delete" on:click={deleteImgLogo} style="cursor: pointer" />
							</span>
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
				</div>
			</div>

			<div class="description">
				<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:23px">
					{$_('Company Description')}
				</p>
				<textarea class="text-area" bind:value={bcDescription} rows="4" />
			</div>

			<div style="display: grid; grid-template-columns: 3fr 2fr 4fr; grid-gap: 20px;">
				<div class="input-field">
					<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:23px">
						{$_('Commercial Registration Number (CR #)')}
					</p>
					<Textfield
						class="shaped-outlined"
						variant="outlined"
						bind:value={commercialRegistrationNumber}
						label={$_('Commercial Registration Number (CR #)')}
						noLabel={true}
						ripple={false}
					/>
				</div>

				<div class="input-field">
					<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:23px">
						{$_('Commercial Registration')}
					</p>
					<input
						style="display:none"
						type="file"
						accept=".jpg,.png,.jfif,.jpeg,.doc,.docx,.pdf"
						on:change={(e) => onSelectedFile(e)}
						bind:this={fileSelect}
					/>
					<div class="select">
						<button
							type="button"
							class="select_file"
							on:click={() => {
								if (file != '') {
									goToImage(appConfig.file_base_url + file);
								} else {
									fileSelect.click();
								}
							}}
						>
							{fileName == '' ? (file == '' ? $_('Select file') : showName) : fileName}
						</button>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						{#if file != ''}
							<i class="mi mi-close" on:click={deleteImg}></i>
						{/if}
					</div>
				</div>
				<!-- Change Margin -->
				<div>
					<p
						class="ff-poppins"
						style="font-size: 13px;
                         color: rgb(96, 96, 96);
                         margin-top: 54px;
                         margin-left: 9px
                         "
					>
						{$_('Add attachment')}
					</p>
					<p
						class="ff-poppins"
						style="font-size: 13px;
                         color: rgb(96, 96, 96); 
                         margin-top:-13px"
					>
						(pdf, png, jpg, docx)
					</p>
				</div>
			</div>
		</form>
	</Card>

	<Card style="padding:20px;">
		<form>
			<h4 style="font-size: 16px;margin:0;" class="ff-poppins-semibold">{$_('Contact Details')}</h4>
			<div style="display:grid; grid-template-columns: 2fr 2fr 2fr; grid-gap: 20px;">
				<div class="input-field">
					<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:23px">
						{$_('Main Person Name')}*
					</p>
					<Textfield
						class="shaped-outlined"
						variant="outlined"
						bind:value={mainContactPerson}
						label="{$_('Main Person Name')}*"
						noLabel={true}
						ripple={false}
					/>
				</div>
				<div class="input-field">
					<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:23px">
						{$_('Mobile Number')}*
					</p>
					<Textfield
						class="shaped-outlined"
						variant="outlined"
						bind:value={contactPersonMobileNo}
						label="{$_('Mobile Number')}*"
						noLabel={true}
						ripple={false}
					/>
				</div>
				<div class="input-field">
					<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:23px">
						{$_('WhatsApp Number')}*
					</p>
					<Textfield
						class="shaped-outlined"
						variant="outlined"
						bind:value={contactPersonWhatsappNo}
						label="{$_('WhatsApp Number')}*"
						noLabel={true}
						ripple={false}
					/>
				</div>
			</div>
		</form>
	</Card>

	<Card style="padding:20px;">
		<h4 style="font-size: 16px; margin:0;" class="ff-poppins-semibold">{$_('Delivery Details')}</h4>
		<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:15px">
			{$_('Delivery Days')}
		</p>
		<div>
			{#each days as item, index}
				<button
					class={item.selected ? 'color days' : 'days'}
					on:click={() => onClickDays(item, index)}
				>
					{$_(item.day)}
				</button>
			{/each}
		</div>

		<p class="ff-poppins" style="font-size:13px; color: #606060; margin-top:17px">
			{$_('Preferred Delivery Time')}
		</p>
		<div style="display:grid; grid-template-columns: 2fr 8fr; grid-gap: 10px;">
			<div>
				<p class="ff-poppins" style="font-size:14px; font-weight: bold; margin-top:17px">
					{$_('Select Time Range')}
				</p>
			</div>
			<div>
				<div class="slider_background">
					<p class="slider_start">{valueStart + ':00'}</p>
					<Slider
						class="slider"
						range
						bind:start={valueStart}
						bind:end={valueEnd}
						min={0}
						max={20}
						step={1}
						discrete
						input$aria-label="Range slider"
					/>
					<p class="slider_end">{valueEnd + ':00'}</p>
				</div>
			</div>
		</div>
	</Card>

	<div class="headingSection">
		<h2 class="ff-poppins-semibold" style="font-size: 20px;">{$_('Locations')}</h2>
		<Button
			variant="unelevated"
			class="btn ff-poppins"
			on:click={() => goto('/main/BCprofile/create')}
			style="height:42px"
		>
			<img src={add} alt="" />
			<Label class="labelButton">{$_('Add New')}</Label>
		</Button>
	</div>

	<TableComponent
		{columnHeaders}
		{dataSource}
		{actionButtons}
		{pagination}
		on:onClickAction={onTableActionClick}
		on:onClickPagination={onChangePage}
		on:toggleObj={onToggleBtn}
	/>

	<Button
		on:click={submit}
		class="btn ff-poppins-semibold"
		variant="raised"
		style="margin-left:24px;width:196px;"
	>
		{$_('Update Information')}
	</Button>
</main>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />
<AskingAlert {open} {askingAlertData} bind:reCallAlert on:onClickAertAction={onClickAction} />
