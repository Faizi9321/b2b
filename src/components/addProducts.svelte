<script lang="ts">
	import TableComponent from './tableComponent/tableComponent.svelte';
	import AdvancedSearch from './advancedSearch/advanced-search.svelte';
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import Button, { Label } from '@smui/button';
	import { GET, POST } from '../routes/apiService';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import { profile, langChange } from '../store';
	import { _ } from 'svelte-i18n';
	import dropdownCategory from '../assets/icons/category.png';

	export let productsBlocks: boolean = true;
	let addedProducts: any[] = [];
	let totalRecords: number = 0;
	let search: string = '';
	let categoryId: any = 0;
	let view = '';
	let currentId: number = 0;
	let selectedProducts: number = 0;
	let pageNumber = 1;
	let pageSize = 10;
	let pagination = {
		currentPage: 0,
		perPage: 0,
		totalPages: 0,
		totalCount: 0,
		paginationText: 'Products'
	};
	let toggleBtns: any[] = [
		{ name: 'All Products', selected: true },
		{ name: 'Our Products Lists', selected: false }
	];
	let allProducts: boolean = true;
	let favoriteList: any[] = [];
	let dataSource: any;
	let output = createEventDispatcher();
	let listId: number = 0;
	let advanceSearchConfig: any = {
		searchLabel: 'Search by Product ID, Product Name',
		dropdowns: [
			{
				placeholder: 'Category',
				iconPath: dropdownCategory,
				options: []
			}
		]
	};
	let columnHeaders: any = {};
	let columnHeaders1: any = {};
	let dataSource1: any[] = [];
	let totalRecordsFavoriteProduct: number = 0;
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		profile.subscribe((val: any) => {
			if (val != '') {
				if ($page.url.pathname == '/main/rfqs/add-products' || !val.priceVisibilityAllowed) {
					columnHeaders = {
						checkbox: 'checkbox',
						id: 'ID',
						imgUrl: '',
						enName: 'Product Name',
						qty: 'Quantity',
						uomName: 'UoM',
						categoryName: 'Category'
					};
				} else {
					columnHeaders = {
						checkbox: 'checkbox',
						id: 'ID',
						imgUrl: '',
						enName: 'Product Name',
						retailPrice: 'Retail Price (SAR)',
						volumePricing: 'Volume Pricing',
						qty: 'Quantity',
						uomName: 'UoM',
						categoryName: 'Category'
					};
				}
				if (val.priceVisibilityAllowed) {
					columnHeaders1 = {
						checkbox: 'checkbox',
						imgUrl: '',
						ProductName: 'Product Name',
						CategoryName: 'Category',
						retailPrice: 'Retail Price (SAR)',
						volumePricing: 'Volume Pricing',
						qty: 'Quantity',
						icon: ''
					};
				} else {
					columnHeaders1 = {
						checkbox: 'checkbox',
						imgUrl: '',
						ProductName: 'Product Name',
						CategoryName: 'Category',
						qty: 'Quantity',
						icon: ''
					};
				}
				getTableData();
				getFavoritelistTable();
			}
		});

		view = history.state.type;
		currentId = history.state.id;
		addedProducts = productsBlocks ? history.state.selectedProducts : [];
		getCategories();
		getFavouriteLists();
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		if ($langChange) {
			getTableData();
			getFavoritelistTable();
			getCategories();
			langChange.set(false);
		}
	});

	afterUpdate(() => {
		if (!productsBlocks) {
			if (allProducts) {
				output('selectedProducts', { addedProducts, type: 'All Products', selectedProducts });
			} else if (!allProducts) {
				output('selectedProducts', { addedProducts, type: 'Our Products Lists', selectedProducts });
			}
		}
	});

	export const refreshFucntion = () => {
		addedProducts = [];
		getTableData();
		getFavoritelistTable();
		getFavouriteLists();
		onChangeSection({ name: 'All Products', selected: false });
	};

	export const onCreateNewList = () => {
		onChangeSection({ name: 'All Products', selected: false });
		addedProducts = dataSource1;
	};

	let getCategories = () => {
		let url = `Product/GetProductCategories?SortColumn=name&PageNumber=1&PageSize=100&SortOrder=a`;
		GET(url).then((result) => {
			if (result.succeeded) {
				result.data.forEach((element: any) => {
					element.name = lang == 'en' ? element.name : element.arName;
				});
				advanceSearchConfig = {
					searchLabel: 'Search by Product ID, Product Name',
					dropdowns: [
						{
							placeholder: 'Category',
							iconPath: dropdownCategory,
							options: [
								{
									id: 'All',
									name: 'All'
								},
								...result.data
							]
						}
					]
				};
			}
		});
	};

	let getTableData = async () => {
		let url = `Product/GetAllProduct`;
		let data = {
			pageNumber: pageNumber,
			pageSize: pageSize,
			sortColumn: 'id',
			sortOrder: 'z',
			search: search != null ? search : null,
			productId: [],
			productName: null,
			categoryIds: categoryId == null || categoryId == 0 || categoryId == 'All' ? [] : [categoryId]
		};
		await POST(url, data).then((result) => {
			if (result.succeeded) {
				result.data.forEach((element: any) => {
					element.productPriceList.length > 0
						? (element.volumePricing = { label: 'Yes', data: element.productPriceList })
						: (element.volumePricing = { label: 'No', data: null });
					element.imgUrl =
						element.productImages.length > 0 ? element.productImages[0].path : undefined;
					element.qty = 0;
					element.checkbox = false;
					selectedProducts = addedProducts.length;
					addedProducts.forEach((element2: any, i: any) => {
						if (element2.id == element.id || element2.productId == element.id) {
							element.checkbox = true;
							if (element2.qty > 0) {
								element.qty = element2.qty;
								element.quantity = element2.quantity;
							} else {
								element.qty++;
							}
						}
					});
					element.enName = lang == 'ar' ? element.arName : element.enName;
					element.categoryName = lang == 'ar' ? element.arCategoryName : element.categoryName;
					element.uomName = lang == 'ar' ? element.arUOMName : element.uomName;
				});

				dataSource = result.data;
				pagination.currentPage = result.pageNumber;
				pagination.perPage = result.pageSize;
				pagination.totalPages = result.totalPages;
				pagination.totalCount = result.totalRecords;
				totalRecords = result.totalRecords;
			}
		});
	};

	let getFavoritelistTable = async () => {
		let url = `BCMyProducts/GetMyFavouriteProductList`;
		let data = {
			pageNumber: 1,
			pageSize: 100,
			sortColumn: 'id',
			sortOrder: 'a',
			search: search != null ? search : null,
			categoryIds: categoryId == null || categoryId == 0 || categoryId == 'All' ? [] : [categoryId],
			productListId: listId
		};
		if (listId != 0) {
			await POST(url, data).then((result) => {
				if (result.succeeded) {
					result.data.forEach((element: any) => {
						element.productPriceList.length > 0
							? (element.volumePricing = { label: 'Yes', data: element.productPriceList })
							: (element.volumePricing = { label: 'No', data: null });
						element.qty = element.quantity;
						element.checkbox = false;
						element.CategoryName = lang == 'en' ? element.categoryName : element.arCategoryName;
						element.ProductName = lang == 'en' ? element.productName : element.arProductName;
						element.uomName = lang == 'en' ? element.uomName : element.arUOMName;
						element.imgUrl =
							element.productImages != null && element.productImages.length > 0
								? element.productImages[0].path
								: undefined;
					});
					dataSource1 = result.data;
					totalRecordsFavoriteProduct = result.totalRecords;
				}
			});
		}
	};

	let getFavouriteLists = () => {
		let url = 'BCMyProducts/GetFavouriteProduct';
		GET(url).then((result) => {
			if (result.succeeded) {
				favoriteList = result.data;
				if (result.data.length > 0) {
					listId = favoriteList[0].id;
					onClickListItem(favoriteList[0].id);
					getFavoritelistTable();
				} else {
					dataSource1 = [];
				}
			}
		});
	};

	let onClickListItem = (id: number) => {
		listId = id;
		getFavoritelistTable();
	};

	let handleSearchRecord = (ev: any) => {
		if (allProducts) {
			getTableData();
		} else {
			getFavoritelistTable();
		}
	};

	let handleSearchByStatus = (ev: any) => {
		categoryId = ev.detail.option;
		if (allProducts) {
			getTableData();
		} else {
			getFavoritelistTable();
		}
	};

	let onChangePage = (ev: any) => {
		pageNumber = ev.detail;
		getTableData();
	};

	let onSelectProducts = (ev: any) => {
		if (ev.detail.type == 'All') {
			if (!ev.detail.checked) {
				(allProducts ? dataSource : dataSource1).forEach((element: any) => {
					element.checkbox = true;
					if (element.qty == 0) {
						element.qty++;
					}
					var bFound = false;
					addedProducts.forEach((element2: any, i: any) => {
						if (element2.id == element.id || element.productId == element.id) {
							addedProducts[i] = element;
							bFound = true;
						}
					});
					if (!bFound) {
						addedProducts.push(element);
					}
				});
				selectedProducts = addedProducts.length;
			} else {
				(allProducts ? dataSource : dataSource1).forEach((element: any) => {
					element.checkbox = false;
					element.qty = 0;
					addedProducts.forEach((element2: any, i: any) => {
						if (element2.id == element.id || element2.productId == element.id) {
							addedProducts.splice(i, 1);
						}
					});
				});
				selectedProducts = addedProducts.length;
			}
		} else {
			if (ev.detail.checkbox) {
				(allProducts ? dataSource : dataSource1).forEach((element: any) => {
					if (ev.detail.id == element.id) {
						element.checkbox = true;
						if (element.qty == 0) {
							element.qty++;
						}
					}
				});
				addedProducts.push(ev.detail);
				selectedProducts = addedProducts.length;
			} else {
				(allProducts ? dataSource : dataSource1).forEach((element: any, index: any) => {
					if (ev.detail.id == element.id) {
						element.qty = 0;
						element.checkbox = false;
					}
				});
				addedProducts.filter((val: any, index: any) => {
					if (val.id == ev.detail.id || val.productId == ev.detail.id) {
						addedProducts.splice(index, 1);
					}
				});
				selectedProducts = addedProducts.length;
			}
		}
	};

	let onQuantityChange = (ev: any) => {
		(allProducts ? dataSource : dataSource1).forEach((element: any) => {
			if (element.id == ev.detail.data.id) {
				if (ev.detail.data.qty == 0) {
					element.checkbox = false;
					addedProducts.forEach((element2: any, i: any) => {
						if (element2.id == ev.detail.data.id || element2.productId == ev.detail.data.id) {
							addedProducts.pop();
						}
					});
					selectedProducts = addedProducts.length;
				} else if (ev.detail.data.qty == 1 && !element.checkbox) {
					element.checkbox = true;
					addedProducts.push(ev.detail.data);
				}
				addedProducts.filter((val: any, index: any) => {
					if (val.id == ev.detail.data.id || val.productId == ev.detail.data.id) {
						val.qty = ev.detail.data.qty;
					}
				});
				selectedProducts = addedProducts.length;
			}
		});
	};

	let onInputQuantity = (ev: any) => {
		if (addedProducts.length == 0) {
			addedProducts.push(ev.detail);
			selectedProducts = addedProducts.length;
		} else {
			addedProducts.filter((element2: any, index) => {
				if (element2.id == ev.detail.id) {
					addedProducts.splice(index, 1);
				}
			});
			addedProducts.push(ev.detail);
			selectedProducts = addedProducts.length;
		}
	};

	let onContinue = () => {
		if (view == 'create-rfq') {
			goto('/main/rfqs/create', { state: { products: addedProducts } });
		} else if (view == 'edit-rfq') {
			goto(`/main/rfqs/edit/${currentId}`, { state: { products: addedProducts } });
		} else if (view == 'create-order') {
			goto('/main/orders/create', { state: { products: addedProducts } });
		} else if (view == 'edit-order') {
			goto(`/main/orders/edit/${currentId}`, { state: { products: addedProducts } });
		}
	};

	let onClearSelectection = () => {
		selectedProducts = 0;
		addedProducts = [];
		if (allProducts) {
			dataSource = [];
			getTableData();
		} else {
			dataSource1 = [];
			getFavoritelistTable();
		}
	};

	let onChangeSection = (btn: any) => {
		addedProducts = [];
		allProducts = !allProducts;
		if (!btn.selected) {
			let btns = toggleBtns.filter((element) => {
				btn.name == element.name ? (element.selected = true) : (element.selected = false);
				return toggleBtns;
			});
			toggleBtns = [];
			toggleBtns = btns;
		}
		allProducts ? getTableData() : getFavoritelistTable();
		output('changeSection', { allProducts, dataSource1, listId });
	};
</script>

<main class={!productsBlocks ? '' : 'main'}>
	<!-- header section -->
	<div class="heading-section">
		{#if productsBlocks}
			<div style="font-family: poppins-semibold; font-size: 20px">{$_('Add Products')}</div>
		{/if}
		{#if !productsBlocks}
			<div style="display: flex;grid-gap:20px">
				{#each toggleBtns as btn}
					<Button
						variant="unelevated"
						class="btnToggleTable ff-poppins"
						on:click={() => onChangeSection(btn)}
						style={btn.selected
							? 'pointer-events:none'
							: 'background:white;color:black !important;'}
						ripple={false}
					>
						<Label>{$_(btn.name)}</Label>
					</Button>
				{/each}
			</div>
		{/if}
		<div class="clear-section" style={lang == 'en' ? 'width:34%' : 'width:20%'}>
			<div style="font-size: 20px;" class="ff-poppins-semibold">
				{$_('Selected Products')}:
				{selectedProducts}
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span class="ff-poppins" on:click={onClearSelectection}>{$_('Clear Selection')}</span>
		</div>
	</div>
	<!-- advanced search section -->
	<div class="advancedSearch-section">
		<div class="totalProducts-section">
			<span style="font-family: 'poppins-semibold'; font-size: 16px;margin-bottom: 1%;"
				>{$_('Total Products')}:</span
			>
			<span style="font-family: 'poppins-semibold';margin-left: 10px;font-size: 20px;">
				{allProducts ? totalRecords : totalRecordsFavoriteProduct}</span
			>
		</div>
		<div style="width:75%">
			<AdvancedSearch
				{advanceSearchConfig}
				bind:searchVal={search}
				on:searchText={handleSearchRecord}
				on:dropdown={handleSearchByStatus}
			/>
		</div>
	</div>
	<!-- favorite list portion -->
	{#if !allProducts}
		<div>
			{#each favoriteList as btn}
				<Button
					variant="unelevated"
					class="btn btnToggleTable ff-poppins"
					on:click={() => onClickListItem(btn.id)}
					style={btn.id == listId
						? 'pointer-events:none;margin-left: 14px;width:160px;margin-bottom:26px;'
						: 'background:white;color:black !important;margin-left: 14px;width:160px;margin-bottom:26px;'}
					ripple={false}
				>
					<Label>{$_(btn.name)}</Label>
				</Button>
			{/each}
		</div>
	{/if}
	<!-- table section -->
	{#if allProducts}
		<TableComponent
			{columnHeaders}
			{dataSource}
			{pagination}
			on:onClickPagination={onChangePage}
			on:onClickCheckbox={onSelectProducts}
			on:onClickAllCheck={onSelectProducts}
			on:quantityChange={onQuantityChange}
			on:quantityChangeInput={onInputQuantity}
		/>
	{:else}
		<TableComponent
			columnHeaders={columnHeaders1}
			dataSource={dataSource1}
			on:onClickCheckbox={onSelectProducts}
			on:onClickAllCheck={onSelectProducts}
			on:quantityChange={onQuantityChange}
			on:quantityChangeInput={onInputQuantity}
			isPagination={false}
		/>
	{/if}
	{#if productsBlocks}
		<Button
			variant="unelevated"
			class="btn ff-poppins-semibold"
			style="width: 184px;margin: 54px 0px 16px;"
			on:click={onContinue}
			disabled={selectedProducts == 0}
		>
			<Label>{$_('Continue')}</Label>
		</Button>
	{/if}
</main>

<style>
	.heading-section {
		display: flex;
		place-content: space-between;
		align-items: baseline;
		margin: 30px 0px;
	}

	:global(.clear-section) {
		display: flex;
		place-content: space-between;
		align-items: center;
	}

	:global(.clear-section span) {
		font-size: 12.2195px;
		text-decoration-line: underline;
		color: #606060;
		cursor: pointer;
	}

	.advancedSearch-section {
		display: flex;
		place-content: space-between;
		align-items: baseline;
		grid-gap: 20px;
	}

	.totalProducts-section {
		background: white;
		box-shadow: 0px 20px 60px rgba(0, 0, 0, 0.05);
		border-radius: 10px;
		padding: 17px;
		width: 25%;
	}

	:global(.btnToggleTable) {
		box-shadow: 0px 20px 60px rgba(0, 0, 0, 0.05);
		border-radius: 73px;
		font-size: 16px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		height: 40px;
		padding-inline: 30px;
		background: linear-gradient(90.55deg, #1879b8 0.29%, #14a3d8 98.5%);
		color: white;
		text-transform: none;
	}
</style>
