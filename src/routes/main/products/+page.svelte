<script lang="ts">
	import Button, { Label } from '@smui/button';
	import { profile } from '../../../store';
	import { beforeUpdate, onMount } from 'svelte';
	import AddProducts from '../../../components/addProducts.svelte';
	import { goto } from '$app/navigation';
	import Dialog, { Header, Title, Content, Actions } from '@smui/dialog';
	import IconButton from '@smui/icon-button';
	import { Delete, GET, POST } from '../../../routes/apiService';
	import product from '../../../assets/icons/products.png';
	import productSelected from '../../../assets/icons/products-blue.png';
	import edit from '../../../assets/icons/edit-normal.png';
	import del from '../../../assets/icons/del.png';
	import Textfield from '@smui/textfield';
	import Menu from '@smui/menu';
	import Alerts from '../../../components/alerts.svelte';
	import List, { Item, Separator, Text } from '@smui/list';
	import AskingAlert from '../../../components/asking-alert.svelte';
	import { _ } from 'svelte-i18n';

	let toggleTable: boolean = true;
	let topBtnText: string = 'Add to list';
	let addedProducts: any[] = [];
	let priceVisibilityAllowed: boolean = true;
	let open = false;
	let selectedProducts: number = 0;
	let favoriteProductList: any[] = [];
	let listIndex: number = 0;
	let selectedList: any[] = [];
	let name: string = '';
	let bcId: number = 0;
	let reCallAllProducts: any;
	let listCase: string = 'create';
	let createNewList: any;
	let menu: Menu;
	let openAskAlert: boolean = false;
	let askingAlertData: any;
	let reCallAlert: any;
	let openAlerts: boolean = false;
	let alertData: any;
	let reCallAlerts: any;
	let moreButtons: any[] = [
		{ name: 'Add More Products', icon: 'mi mi-add add' },
		{ name: 'Remove Selected Products', icon: 'mi mi-remove remove' },
		{ name: 'Delete Selected List', icon: 'mi mi-delete' }
	];
	let addMore: boolean = false;
	let currentlistId: number = 0;
	let currentId: number = 0;
	let lang: string = 'en';

	onMount(() => {
		profile.subscribe((value: any) => {
			if (value != '') {
				priceVisibilityAllowed = value.priceVisibilityAllowed;
				bcId = value.bcId;
			}
		});
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
	});

	let getFavoriteProductList = () => {
		let url =
			'BCMyProducts/GetFavouriteProduct?SortColumn=name&PageNumber=1&PageSize=100&SortOrder=a';
		GET(url).then((result) => {
			if (result.succeeded) {
				favoriteProductList = result.data;
			}
		});
	};

	let onProductList = (ev: any) => {
		selectedProducts = ev.detail.selectedProducts;
		if (ev.detail.addedProducts?.length > 0 && ev.detail.type == 'All Products') {
			addedProducts = ev.detail.addedProducts;
		} else if (ev.detail.addedProducts?.length > 0 && ev.detail.type == 'Our Products Lists') {
			addedProducts = ev.detail.addedProducts;
		}
	};

	let onCreateFavoriteList = () => {
		if (topBtnText == 'Create New List') {
			reCallAllProducts();
			topBtnText = 'Add to list';
		} else {
			open = true;
			getFavoriteProductList();
		}
	};

	let onChangeSection = (ev: any) => {
		currentlistId = ev.detail.listId;
		addedProducts = ev.detail.dataSource1;
		toggleTable = ev.detail.allProducts;
		if (toggleTable) {
			topBtnText = 'Add to list';
		} else {
			topBtnText = 'Create New List';
		}
	};

	let onSubmit = () => {
		if (priceVisibilityAllowed) {
			goto('/main/orders/create', { state: { products: addedProducts } });
		} else if (!priceVisibilityAllowed) {
			goto('/main/rfqs/create', { state: { products: addedProducts } });
		}
	};

	let actionHandler = (e: CustomEvent<{ action: string }>) => {
		switch (e.detail.action) {
			case 'close':
				break;
		}
	};

	let onClickListItem = (item: any, i: number) => {
		listIndex = i;
		if (item.id == undefined) {
			item.id = null;
		}
		let url = `BCMyProducts/GetFavouriteProductByHeadId?headId=${item.id}`;
		GET(url).then((result) => {
			if (result.succeeded) {
				selectedList = result.data;
			}
		});
	};

	let onAddproducts = () => {
		let finalArr: any[] = [];
		if (addMore) {
			addedProducts.forEach((element: any) => {
				if (element.headId == undefined) {
					element.headId = selectedList[0].id;
					element.categoryId = element.productCategoryId;
					element.productId = element.id;
					element.id = 0;
					element.quantity = element.qty;
					finalArr.push(element);
				} else if (element.headId != undefined) {
					finalArr.push(element);
				}
			});
		} else if (!addMore) {
			addedProducts.forEach((element: any) => {
				let data = {
					headId: 0,
					categoryId:
						element.productCategoryId == undefined ? element.categoryId : element.productCategoryId,
					productId: element.id,
					id: 0,
					productImages: [],
					quantity: element.qty
				};
				finalArr.push(data);
			});
		}
		let url = 'BCMyProducts/AddUpdate';
		let data = {
			id: listCase == 'edit' ? selectedList[0].id : 0,
			name,
			bcId,
			bcName: '',
			bcMyProductsDetail: finalArr
		};
		if (name != '' && bcId != 0) {
			POST(url, data).then((result) => {
				if (result.succeeded) {
					reCallAllProducts();
					addedProducts = [];
					name = '';
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

	let onClickIcons = (type: string, item: any) => {
		if (type == 'edit') {
			listCase = 'edit';
			name = item.name;
		} else if (type == 'delete') {
			currentId = item.id;
			openAskAlert = true;
			askingAlertData = {
				heading: 'Delete List!',
				message: 'Are you sure! you want to delete the selected list?',
				leftButtonText: 'Yes',
				rightButtonText: 'No',
				type: 'delete-list'
			};
			reCallAlert();
		}
	};

	let onClickMore = (item: any) => {
		if (item.name == 'Add More Products') {
			createNewList();
			addMore = true;
		} else if (item.name == 'Remove Selected Products') {
			openAskAlert = true;
			askingAlertData = {
				heading: 'Remove Products!',
				message: 'Are you sure! you want to remove selected products from list?',
				leftButtonText: 'Yes',
				rightButtonText: 'No',
				type: 'remove-selected-products'
			};
			reCallAlert();
		} else if (item.name == 'Delete Selected List') {
			openAskAlert = true;
			askingAlertData = {
				heading: 'Remove Products!',
				message: 'Are you sure! you want to remove selected products from list?',
				leftButtonText: 'Yes',
				rightButtonText: 'No',
				type: 'delete-selected-list'
			};
			reCallAlert();
		}
	};

	let onAlertActions = (ev: any) => {
		if (ev.detail.status) {
			if (ev.detail.type == 'delete-list') {
				let url = `BCMyProducts/DeleteById?Id=${currentId}`;
				Delete(url).then((result) => {
					if (result.succeeded) {
						getFavoriteProductList();
						listIndex = 0;
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
			} else if (ev.detail.type == 'remove-selected-products') {
				let url = 'BCMyProducts/DeleteSelectedItems';
				addedProducts.forEach((element) => {
					element.isDeleted = true;
				});
				POST(url, addedProducts).then((result) => {
					if (result.succeeded) {
						reCallAllProducts();
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
			} else if (ev.detail.type == 'delete-selected-list') {
				let url = `BCMyProducts/DeleteById?Id=${currentlistId}`;
				Delete(url).then((result) => {
					if (result.succeeded) {
						reCallAllProducts();
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
	};
</script>

<div class="main">
	<!-- header section -->
	<div class="ff-poppins topBtnSection">
		<h2 style="font-size: 20px" class="ff-poppins-semibold">{$_('Products')}</h2>
		<div class="topBtnSection" style={toggleTable ? '' : 'width: 220px;'}>
			<Button
				variant="unelevated"
				class="btn ff-poppins-semibold"
				style="height:42px;"
				disabled={selectedProducts == 0 && topBtnText != 'Create New List'}
				on:click={onCreateFavoriteList}
				ripple={false}
			>
				<Label>{$_(topBtnText)}</Label>
			</Button>
			{#if !toggleTable}
				<IconButton
					class="material-icons icon-btn"
					ripple={false}
					on:click={() => menu.setOpen(true)}
					style="background: #ffffff;border-radius: 7px;color: #1779b8;height: 42px;"
					>more_vert</IconButton
				>
				<Menu bind:this={menu}>
					<List style="font-size:14px;">
						{#each moreButtons as btn}
							<Item on:click={() => onClickMore(btn)}>
								<i
									class={btn.icon}
									style={lang == 'en'
										? 'margin-right: 12px;margin-top: 3px;'
										: 'margin-left: 12px;margin-top: 3px;'}
								/>
								<Text>{$_(btn.name)}</Text>
							</Item>
						{/each}
					</List>
				</Menu>
			{/if}
		</div>
	</div>
	<AddProducts
		productsBlocks={false}
		on:selectedProducts={onProductList}
		on:changeSection={onChangeSection}
		bind:refreshFucntion={reCallAllProducts}
		bind:onCreateNewList={createNewList}
	/>
	{#if !toggleTable}
		<Button
			variant="unelevated"
			class="btn ff-poppins-semibold"
			style="width: 184px;margin: 54px 0px 16px;"
			on:click={onSubmit}
			disabled={selectedProducts == 0}
		>
			<Label>{priceVisibilityAllowed ? $_('Create Order') : $_('Create RFQ')}</Label>
		</Button>
	{/if}
</div>

<!-- favorite list dialog -->
<Dialog class="dialog" bind:open on:SMUIDialog:closed={actionHandler}>
	<Header class="dialog-header header">
		<div>
			<div style="font-size: 20px;" class="ff-poppins-semibold">{$_('Add products to lists')}</div>
			<p style="font-size: 12.2195px;margin:0;" class="ff-poppins">
				{$_('You will update products in specific lists')}
			</p>
		</div>
		<IconButton action="close" class="material-icons">close</IconButton>
	</Header>
	<Content style="padding:0;overflow:hidden;">
		<div style="height:200px;overflow:auto;padding:0;width: 450px;">
			{#each favoriteProductList as item, index}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class={index == listIndex ? 'active-list list' : 'list'}
					on:click={() => onClickListItem(item, index)}
				>
					<div style="display:flex;">
						{#if index != listIndex}
							<img src={product} width="20px" height="20px" alt="" />
						{:else}
							<img src={productSelected} width="20px" height="20px" alt="" />
						{/if}
						<div style="font-size: 16px;" class="ff-poppins">{item.name}</div>
					</div>
					{#if index == listIndex}
						<div>
							<img
								src={edit}
								class="icon-image"
								width="20px"
								height="20px"
								alt=""
								style="pointer-events:auto"
								on:click={() => onClickIcons('edit', item)}
							/>
							<img
								src={del}
								class="icon-image"
								width="20px"
								height="20px"
								alt=""
								style="pointer-events:auto"
								on:click={() => onClickIcons('delete', item)}
							/>
						</div>
					{/if}
				</div>
			{/each}
		</div>
		<hr style="border: 1px black solid;border-bottom: none;opacity:0.2;margin: 0px -10px;" />
		<div style="margin-inline:24px;margin-bottom: 20px;" class="input-field">
			<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Create New List')}</p>
			<Textfield
				class="shaped-outlined"
				variant="outlined"
				bind:value={name}
				label={$_('Add List Name')}
				noLabel={true}
				ripple={false}
				disabled={addMore}
			/>
		</div>
		<hr style="border: 1px black solid;border-bottom: none;opacity:0.2;margin: 0px -10px;" />
	</Content>
	<Actions class="dialogAction-block">
		<Button
			class="btn ff-poppins-semibold"
			on:click={onAddproducts}
			style="height:40px;font-size:14px;width: 154px;"
		>
			<Label>{$_('Add Product')}</Label>
		</Button>
		<Button
			class="btn ff-poppins-semibold"
			on:SMUIDialog:closed={actionHandler}
			style="font-size:14px;background: #95989a; border-radius: 10px !important;height:40px;width: 154px;"
		>
			<Label>{$_('Cancel')}</Label>
		</Button>
	</Actions>
</Dialog>
<AskingAlert
	open={openAskAlert}
	{askingAlertData}
	bind:reCallAlert
	on:onClickAertAction={onAlertActions}
/>

<Alerts {openAlerts} {alertData} bind:reCallAlerts />

<style>
	.topBtnSection {
		display: flex;
		place-content: space-between;
		align-items: center;
	}

	:global(.header) {
		display: flex;
		place-content: space-between;
		align-items: center;
		padding: 24px;
		position: relative;
		top: auto;
		right: auto;
	}

	.active-list {
		background: linear-gradient(90deg, #ffffff 0%, #eaf3f8 100%);
		border: 1px solid #1779b8;
		box-shadow: 0px 20px 60px rgb(0 0 0 / 5%);
		border-radius: 114px;
		pointer-events: none;
	}

	.list {
		display: flex;
		place-content: space-between;
		align-items: center;
		margin-top: 20px;
		padding: 10px 22px 6px 12px;
		cursor: pointer;
		margin-inline: 24px;
	}

	:global(.shaped-outlined) {
		height: 38px;
		width: 265px;
	}

	:global(.dialogAction-block) {
		display: flex;
		place-content: center;
		align-items: center;
		grid-gap: 18px;
		padding: 15px 0 20px;
	}

	.mdc-menu-surface--open {
		left: auto !important;
		right: 0 !important;
		top: 42px !important;
		padding: 2px;
	}

	.mdc-deprecated-list-item {
		height: 34px;
	}

	.add {
		background: #4192c5;
		border-radius: 50%;
		color: white;
		line-height: 0;
		padding: 2px;
	}

	.remove {
		background: grey;
		border-radius: 50%;
		color: white;
		line-height: 0;
		padding: 2px;
	}

	.mi-delete:before {
		color: #1779b8;
		font-size: 20px;
		cursor: pointer;
	}
</style>
