<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import { profile } from '../store';
	import { beforeUpdate } from 'svelte';
	import Card from '@smui/card';
	import { _ } from 'svelte-i18n';

	export let subTotal: any = 0;
	export let deliveryCharges: any = 0;
	export let vatTotal: any = 0;
	export let products: any[] = [];
	let vat: number = 0;
	let lang: string = 'en';

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		profile.subscribe((val: any) => {
			if (val != '') {
				vat = val.vat;
			}
		});
	});
</script>

<Card style="padding: 16px 22px;" class="summary-table">
	<DataTable style="width: 100%;border: none;display:grid;">
		<Head>
			<Row>
				<Cell numeric>{$_('Line Item')} #</Cell>
				<Cell>{$_('Product')}</Cell>
				<Cell>{$_('Quantity')}</Cell>
				<Cell>{$_('Unit Price (SAR)')}</Cell>
				<Cell>{$_('VAT')} ({vat}%)</Cell>
				<Cell>{$_('Total Amount Incl. VAT')}</Cell>
			</Row>
		</Head>
		<Body>
			{#each products as product, index}
				{#if !product.deleted}
					<Row>
						<Cell>{index + 1}</Cell>
						<Cell
							>{product.enName == undefined
								? lang == 'en'
									? product.productName
									: product.arProductName
								: product.enName}</Cell
						>
						<Cell>{product.qty}</Cell>
						<Cell>SAR {product.unitPrice == null ? 0 : product.unitPrice}</Cell>
						<Cell>SAR {product.vat}</Cell>
						<Cell>SAR {product.totalUnitPrice == undefined ? 0 : product.totalUnitPrice}</Cell>
					</Row>
				{/if}
			{/each}
		</Body>
	</DataTable>
	<div style="width: 300px;margin-top: 14px;">
		<p class="summary">
			<span>{$_('Total Amount Excl. VAT')}</span>
			<span>
				<strong>SAR {subTotal} </strong>
			</span>
		</p>
		<p class="summary">
			<span>{$_('Delivery Charges')}</span>
			<span>
				<strong>SAR {deliveryCharges}</strong>
			</span>
		</p>
		<p class="summary">
			<span>{$_('VAT')} ({vat}%)</span>
			<span>
				<strong>SAR {vatTotal} </strong>
			</span>
		</p>
		<p class="invoice-GrandTotal-block">
			<span>
				<strong>{$_('Grand Total')}</strong>
			</span>
			<span>
				<strong>SAR {vatTotal + subTotal + deliveryCharges}</strong>
			</span>
		</p>
	</div>
</Card>

<style>
	:global(.summary-table) {
		display: flex;
		place-content: end;
		align-items: end;
	}

	:global(.mdc-data-table__row),
	:global(.mdc-data-table__header-row) {
		height: 44px;
	}

	:global(.mdc-data-table__cell),
	:global(.mdc-data-table__header-cell) {
		text-align: center;
		font-size: 13px;
		font-family: poppins;
	}

	:global(.mdc-data-table__header-cell) {
		background: #f8f9fa;
		border: 1px solid #f1f3f5;
		border-radius: 4px;
		border: none;
	}

	.summary {
		font-size: 12px;
		color: #7b7b7b;
		font-family: poppins;
		padding-inline: 18px;
		display: flex;
		place-content: space-between;
		align-items: baseline;
	}

	.summary strong {
		color: black;
	}

	.invoice-GrandTotal-block {
		font-size: 14px;
		background: #f8f9fa;
		border: 1px solid #f1f3f5;
		border-radius: 4px;
		padding: 10px 18px;
		display: flex;
		place-content: space-between;
		align-items: baseline;
		font-family: poppins;
	}
</style>
