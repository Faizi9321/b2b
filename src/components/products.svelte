<script lang="ts">
	import Card from '@smui/card/src/Card.svelte';
	import { beforeUpdate, createEventDispatcher, onMount } from 'svelte';
	import arrowIcon from '../assets/icons/arrow.png';
	import productImage from '../assets/images/illustration.png';
	import { appConfig } from '../config';
	import Modal from './modal.svelte';
	import { _ } from 'svelte-i18n';

	export let data: any;
	export let disabledFiedls: boolean = false;
	export let index = 0;
	let open = false;
	let modalData: any;
	let reRender = true;
	let reRenderProduct = true;
	let qty: number = 0;
	let output = createEventDispatcher();
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
	});

	if (data) {
		qty = data.qty;
	}

	let onDecreaseQuantity = () => {
		let dataObj = {
			element: data,
			index,
			type: 'dec'
		};
		output('quantityClick', dataObj);
		if (data) {
			qty = data.qty;
		}
	};

	let onIncreaseQuantity = () => {
		let dataObj = {
			element: data,
			index,
			type: 'inc'
		};
		output('quantityClick', dataObj);
		if (data) {
			qty = data.qty;
		}
	};

	let onQuantityChange = () => {
		let dataObj = {
			quantity: qty,
			index,
			element: data,
			type: 'change'
		};
		output('quantityChangeInput', dataObj);
	};

	let onDelete = (id: number) => {
		output('deleteProduct', id);
		reRenderProduct = false;
		setTimeout(() => (reRenderProduct = true), 0);
	};
</script>

<main>
	{#if !data.deleted && reRenderProduct}
		<Card class="product-card">
			<div
				style="display: flex; justify-content:space-between; align-items:center; position:absolute; width:90%;height:8%;"
			>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<p class="delete-error" on:click={() => onDelete(data.id)}>
					<i
						class="mi mi-delete"
						style={disabledFiedls ? 'padding-top:4px;pointer-events:none;' : 'padding-top:4px;'}
					/>
				</p>
				<p class="delete-error" style="margin-right: 4px;">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<img
						src={arrowIcon}
						alt=""
						on:click={() => ((open = !open), (modalData = data?.productImages))}
						style="cursor:pointer"
					/>
				</p>
			</div>
			<img
				src={data?.productImages?.length > 0
					? appConfig.file_base_url + data?.productImages[0]?.path
					: productImage}
				alt=""
				style="height:170px; width:170px"
			/>
			<p class="product-name">
				SAR {data.retailPrice == null ? 0 : data.retailPrice}
				{$_('(Per unit)')}
			</p>
			<p class="value-name" style="margin: 0;">
				{data?.enName == undefined
					? lang == 'en'
						? data?.productName
						: data?.arProductName
					: data?.enName}
			</p>
			<p class="capacity">
				{$_('UoM')}: <span style="font-weight: 400;">{lang == 'en' ? data?.uomName : data?.arUOMName}</span>
			</p>
			<p class="product-type">{lang == 'en' ? data?.categoryName : data?.arCategoryName}</p>
			<div style="display: flex;">
				<p class="capacity">{$_('Qty')}:</p>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<p
					class="sub-btn"
					style={disabledFiedls ? 'pointer-events:none;' : ''}
					on:click={() => onDecreaseQuantity()}
				>
					-
				</p>
				{#if reRender}
					<input
						bind:value={qty}
						type="number"
						style="width: 60px; height:20px; border-radius:12px; margin-top:9px; text-align: center;border:1px solid;"
						disabled={disabledFiedls}
						on:input={onQuantityChange}
					/>
				{/if}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<p
					class="sub-btn"
					style={disabledFiedls
						? 'color: white; background:#1779B8;pointer-events:none;'
						: 'color: white; background:#1779B8'}
					on:click={() => onIncreaseQuantity()}
				>
					+
				</p>
			</div>
		</Card>
	{/if}
	<Modal {open} {modalData} />
</main>

<style>
	:global(.product-card) {
		padding: 15px;
		width: 208px;
		height: 400px;
	}

	.product-name {
		font-family: 'Poppins';
		font-weight: 600;
		font-size: 15px;
		line-height: 22px;
		letter-spacing: 0.01em;
		color: #0c0c0d;
	}

	.value-name {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 600;
		font-size: 14px;
		line-height: 15px;
		letter-spacing: 0.29442px;
		color: #252733;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.capacity {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 600;
		font-size: 12px;
		line-height: 18px;
		letter-spacing: 0.01em;
		color: #404040;
	}

	.product-type {
		border-radius: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Poppins';
		font-weight: 500;
		font-size: 10px;
		line-height: 15px;
		letter-spacing: 0.01em;
		color: #120000;
		min-width: 100px;
		max-width: fit-content;
		padding: 6px 10px;
		background: #f1f1f1;
	}

	.sub-btn {
		background: rgba(118, 118, 128, 0.12);
		border-radius: 50%;
		height: 30px;
		width: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 7px;
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 500;
		font-size: 17px;
		line-height: 22px;
		text-align: center;
		letter-spacing: -0.408px;
		color: #000000;
		cursor: pointer;
	}

	.delete-error {
		height: 30px;
		width: 30px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid rgba(23, 121, 184, 0.13);
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
		background-color: #ffffff;
	}
	.mi-delete:before {
		color: #1779b8;
		font-size: 20px;
		cursor: pointer;
	}

	:global(.mdc-dialog .mdc-dialog__content) {
		padding: 10px 10px 5px;
	}
</style>
