<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import { beforeUpdate, onMount, tick } from 'svelte';
	import { appConfig } from '../../config';
	import deafultImage from '../../assets/images/default-placeholder.png';
	import Time from 'svelte-time';
	import './tableComponent.scss';
	import { createEventDispatcher } from 'svelte';
	import Pagination from '../pagination/pagination.svelte';
	import Card from '@smui/card/src/Card.svelte';
	import Switch from '@smui/switch';
	import Checkbox from '@smui/checkbox';
	import notify from '../../assets/icons/notify.svg';
	import productChecked from '../../assets/icons/row-checked.png';
	import Modal from '../modal.svelte';
	import { _ } from 'svelte-i18n';

	export let dataSource: any[] = [];
	export let columnHeaders: any;
	export let actionButtons: any[] = [];
	export let pagination: any = {
		currentPage: 1,
		perPage: 0,
		totalPages: 0,
		totalCount: 0,
		paginationText: ''
	};
	export let isPagination = true;

	let currentPage = 0;
	let totalPages = 0;
	let objectKeys = Object.keys;
	let currentDropdownId: number;
	let output = createEventDispatcher();
	let reRender = true;
	let checked: boolean = false;
	let volumeID: number = 0;
	let displayVolumes: boolean = false;
	let open = false;
	let modalData: any;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		currentPage = pagination.currentPage;
		totalPages = pagination.totalPages;
	});

	let toggleMenu = (id?: any) => {
		currentDropdownId = id;
		let dropdown = document.getElementById('dropdown');
		if (dropdown?.classList.contains('hide')) {
			dropdown?.classList.remove('hide');
			dropdown?.classList.add('show');
		} else {
			dropdown?.classList.remove('show');
			dropdown?.classList.add('hide');
		}
	};

	let mouseOutDropdown = () => {
		let dropdown = document.getElementById('dropdown');
		if (dropdown?.classList.contains('hide')) {
			dropdown?.classList.remove('hide');
			dropdown?.classList.add('show');
		} else {
			dropdown?.classList.remove('show');
			dropdown?.classList.add('hide');
		}
	};

	let onClickActionButton = (data: any, type: string) => {
		let actionObject = { data: data, type: type };
		output('onClickAction', actionObject);
	};

	let currentPageNumber = (ev: any) => {
		output('onClickPagination', ev.detail);
	};

	let onCheckData = (data: any, id: number) => {
		dataSource.forEach((element) => {
			if (element.id == id) {
				if (element.checkbox) {
					element.checkbox = false;
				} else {
					element.checkbox = true;
				}
			}
		});
		reRender = false;
		setTimeout(() => {
			reRender = true;
		}, 0);
		output('onClickCheckbox', data);
	};

	let onCheckAll = () => {
		reRender = false;
		setTimeout(() => {
			reRender = true;
		}, 0);
		output('onClickAllCheck', { type: 'All', checked });
	};

	let decrementQTY = (qtyID: number) => {
		dataSource.find((val: any) => {
			if (val.id == qtyID) {
				if (val.qty != 0 && val.qty != 1) {
					val.qty = val.qty - 1;
					let value = {
						type: 'dec',
						data: val
					};
					output('quantityChange', value);
				} else if (val.qty == 1) {
					return;
				} else {
					val.qty = 0;
					let value = {
						type: 'dec',
						data: val
					};
					output('quantityChange', value);
				}
			}
		});
		reRender = false;
		setTimeout(() => {
			reRender = true;
		}, 0);
	};

	let incrementQTY = (qtyID: number) => {
		dataSource.find((val: any) => {
			if (val.id == qtyID) {
				val.qty = val.qty + 1;
				let value = {
					type: 'inc',
					data: val
				};
				output('quantityChange', value);
			}
		});
		reRender = false;
		setTimeout(() => {
			reRender = true;
		}, 0);
	};

	let onQuantityChangeInput = async (ev: any) => {
		output('quantityChangeInput', ev);
	};

	let onEnterMouse = (id: number) => {
		displayVolumes = true;
		volumeID = id;
	};

	let onLeaveMouse = (ev: any) => {
		displayVolumes = false;
	};

	let onClickToggle = (status: boolean, id: number) => {
		output('toggleObj', { status: !status, id });
	};
</script>

<Card class="table">
	<DataTable style="width: 100%;border: none;display:grid;">
		<Head>
			<Row>
				{#each objectKeys(columnHeaders) as headers}
					{#if headers == 'checkbox'}
						<Cell checkbox>
							<Checkbox on:click={onCheckAll} bind:checked />
						</Cell>
					{/if}
					{#if headers != 'checkbox'}
						<Cell style="color: #606060;font-size: 13px;" class="ff-poppins"
							>{$_(columnHeaders[headers])}</Cell
						>
					{/if}
				{/each}
			</Row>
		</Head>
		<Body>
			{#each dataSource as dataObj}
				<Row>
					{#each objectKeys(columnHeaders) as headers, even}
						{#if headers == 'checkbox'}
							<Cell>
								<Checkbox
									on:click={() => onCheckData(dataObj, dataObj.id)}
									bind:checked={dataObj.checkbox}
								/>
							</Cell>
						{/if}
						{#if headers == 'imgUrl'}
							<Cell style="position:relative">
								<img
									src={dataObj[headers] == undefined
										? deafultImage
										: appConfig.file_base_url + dataObj[headers]}
									alt=""
									style={dataObj.headId > 0
										? 'border-radius: 50%;width:70px;height:70px;margin:14px 0'
										: 'border-radius: 50%;width:40px;height:40px;margin: 10px 0px 5px;'}
								/>
								{#if dataObj.headId > 0}
									<IconButton
										class="material-icons expand-btn"
										on:click={() => ((open = !open), (modalData = dataObj.productImages))}
										>zoom_out_map</IconButton
									>
								{/if}
							</Cell>
						{/if}
						{#if headers != 'imgUrl' && headers != 'action' && headers != 'createdOn' && headers != 'status' && headers != 'orderDate' && headers != 'deliveryDate' && headers != 'paymentStatus' && headers != 'activeStatus' && headers != 'checkbox' && headers != 'qty' && headers != 'volumePricing' && headers != 'CategoryName' && headers != 'ProductName' && headers != 'icon' && headers != 'productvalue' && headers != 'retailPrice' && headers != 'totalAmount'}
							<Cell>{dataObj[headers]}</Cell>
						{/if}
						{#if headers == 'productvalue' || headers == 'retailPrice' || headers == 'totalAmount'}
							<Cell>
								{#if headers == 'totalAmount'}
									{dataObj[headers].toFixed(2).toLocaleString()}
								{:else}
									{'SAR ' + dataObj[headers].toFixed(2).toLocaleString()}
								{/if}
							</Cell>
						{/if}
						{#if headers == 'createdOn' || headers == 'orderDate' || headers == 'deliveryDate'}
							<Cell>
								{#if dataObj[headers] == ''}
									-
								{:else}
									<Time timestamp={dataObj[headers]} />
								{/if}
							</Cell>
						{/if}
						{#if headers == 'CategoryName'}
							<Cell>
								<div class="category-label ff-poppins category-name" style="margin:0 auto">
									{dataObj[headers]}
								</div>
							</Cell>
						{/if}
						{#if headers == 'ProductName'}
							<Cell>
								<div class="ff-poppins">
									<p style="font-size: 14px;color: #0C0C0D;margin-bottom: 0px;text-align: start;">
										{dataObj[headers]}
									</p>
									<div style="place-content: baseline;" class="volume-cell">
										<p class="color: #404040;">UoM:&nbsp;</p>
										<span style="color: #0C0C0D;">{dataObj.uomName}</span>
									</div>
								</div>
							</Cell>
						{/if}
						{#if headers == 'status' || headers == 'activeStatus'}
							<Cell>
								{#if dataObj[headers] == true || dataObj[headers] == false}
									<Switch
										bind:checked={dataObj[headers]}
										icons={false}
										on:click={() => onClickToggle(dataObj[headers], dataObj.id)}
									/>
								{:else}
									<div
										class="label"
										style={dataObj[headers] == 'Cancelled'
											? 'background:#FFE8E8'
											: dataObj[headers] == 'Submitted'
											? 'background:#D9FFDD'
											: dataObj[headers] == 'Opened'
											? 'background:#DCF1FF'
											: dataObj[headers] == 'In Transit'
											? 'background:#FFE1C6'
											: 'background:#FCE8FF'}
									>
										<span
											style={dataObj[headers] == 'Cancelled'
												? 'color:#C70000'
												: dataObj[headers] == 'Submitted'
												? 'color:#028C10'
												: dataObj[headers] == 'Opened'
												? 'color:#1779B8'
												: dataObj[headers] == 'In Transit'
												? 'color:#028C10'
												: 'color:#C300C7'}>{$_(dataObj[headers])}</span
										>
									</div>
								{/if}
							</Cell>
						{/if}
						{#if headers == 'paymentStatus'}
							<Cell>
								<div
									class="label"
									style={dataObj[headers] == 'Unpaid' ? 'background:#FFE8E8' : 'background:#D9FFDD'}
								>
									<span
										class="ff-poppins-semibold"
										style={dataObj[headers] == 'Unpaid' ? 'color:#C70000' : 'color:#028C10'}
									>
										{$_(dataObj[headers])}
									</span>
								</div>
							</Cell>
						{/if}
						{#if headers == 'qty'}
							<Cell>
								<div class="qty-block">
									<IconButton
										class="material-icons qty-icon"
										style="background: #7676801f;color: black;"
										on:click={() => decrementQTY(dataObj.id)}>remove</IconButton
									>
									{#if reRender}
										<input
											bind:value={dataObj[headers]}
											type="number"
											class="qty-input"
											on:keypress={() => onQuantityChangeInput(dataObj)}
										/>
									{/if}
									<IconButton
										class="material-icons qty-icon"
										style="background: #1779B8;"
										on:click={() => incrementQTY(dataObj.id)}>add</IconButton
									>
								</div>
							</Cell>
						{/if}
						{#if headers == 'volumePricing'}
							<Cell>
								<div class="volume-cell">
									{$_(dataObj[headers].label)}
									{#if dataObj[headers].label == 'Yes'}
										<img
											class="volume-img"
											src={notify}
											alt="Icon"
											on:mouseenter={() => onEnterMouse(dataObj.id)}
										/>
									{/if}
								</div>
								{#if dataObj.id == volumeID && displayVolumes}
									<div class="volume-dropdown">
										<p
											style="font-size: 12px;color: #252733;margin-left: 7%;"
											class="ff-poppins-semibold"
										>
											{$_('Volume Pricing')}
										</p>
										<div on:mouseleave={onLeaveMouse}>
											<div style="margin-inline: 10px;" class="ff-poppins volume-dropdown-content">
												<p>{$_('Qty Range')}</p>
												<p>{$_('Price (SAR)')}</p>
											</div>
											{#each dataObj[headers].data as item}
												<div class="ff-poppins volume-dropdown-content">
													<p style="margin-left: 10px;">
														{item.minQuantity}
														{item.maxQuantity == 0 ? '' : $_('to')}
														{item.maxQuantity == 0 ? '+' : item.maxQuantity}
													</p>
													<p style="margin-right: 10px;">{item.amount}</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</Cell>
						{/if}
						{#if headers == 'action'}
							<Cell>
								<IconButton class="material-icons" on:click={() => toggleMenu(dataObj.id)}
									>more_horiz</IconButton
								>
								{#if dataObj.id == currentDropdownId}
									<!-- svelte-ignore a11y-mouse-events-have-key-events -->
									<div class="action-dropdown" id="dropdown" on:mouseleave={mouseOutDropdown}>
										<ul class="btns-list">
											{#each actionButtons as btn}
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<li
													on:click={() => onClickActionButton(dataObj, btn.type)}
													style={dataObj[btn.type] == true ? 'display:flex' : 'display:none'}
												>
													<img
														src={btn.iconSrc}
														alt="Icon"
														style={lang == 'en' ? 'margin-right: 10px;' : 'margin-left:10px'}
														width="18px"
													/>
													<span>{$_(btn.buttonLabel)}</span>
												</li>
											{/each}
										</ul>
									</div>
								{/if}
							</Cell>
						{/if}
						{#if headers == 'icon'}
							<Cell style="position:relative">
								{#if dataObj.checkbox && reRender}
									<img
										src={productChecked}
										width="26px"
										style="position:absolute;top:0;right:0;"
										alt=""
									/>
								{/if}
							</Cell>
						{/if}
					{/each}
				</Row>
			{/each}
		</Body>
	</DataTable>
	{#if isPagination}
		<div style="display: flex;">
			<p class="total-count ff-poppins">
				{(pagination.currentPage - 1) * pagination.perPage + 1} - {pagination.totalCount <
				pagination.currentPage * pagination.perPage
					? pagination.totalCount
					: pagination.currentPage * pagination.perPage}
				{$_('of')}
				{pagination.totalCount}
				{$_(pagination.paginationText)}
			</p>
			<div style="width:50%;">
				<Pagination on:setPage={currentPageNumber} {currentPage} {totalPages} />
			</div>
		</div>
	{/if}
</Card>
<Modal {open} {modalData} />
