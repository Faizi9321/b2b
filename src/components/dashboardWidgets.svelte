<script lang="ts">
	import Card from '@smui/card/src/Card.svelte';
	import upTrend from '../assets/icons/upTrend.png';
	import downTrend from '../assets/icons/downTrend.png';
	import { _ } from 'svelte-i18n';

	export let order: any;
	export let orderValue: any;
	export let percentageValue: any;
	export let previousMonthName: any;
	export let icon: any;
	export let currentMonth: string = '';
	export let totalOrderDashboard: boolean = false;
</script>

<main>
	<Card style="height:100%; border-radius:10px; padding:20px">
		<div style="display: flex; justify-content:space-between">
			<div class="widget-icon-div">
				<img src={icon} style="height: 22px; width:22px; margin:5px" alt="" />
			</div>
		</div>
		<p class="widget-status">{order == undefined ? '' : $_(order)}</p>

		<p class="widget-values">
			{totalOrderDashboard
				? 'SAR ' + (orderValue == undefined ? 0 : orderValue.toLocaleString())
				: orderValue == undefined
				? 0
				: orderValue}
		</p>
		{#if currentMonth == 'This Month' || currentMonth == ''}
			<div class="trend-div">
				<img
					src={percentageValue > 1 ? upTrend : downTrend}
					style="height: 7px; width:11px"
					alt=""
				/>
				<p style={percentageValue > 1 ? 'color: #16c098;' : 'color: red;'} class="trend-value">
					&nbsp;{percentageValue == undefined ? 0 : percentageValue}%
				</p>
				<p class="trend-time">
					&nbsp;{$_('From')} {previousMonthName == undefined ? '' : previousMonthName}
				</p>
			</div>
		{/if}
	</Card>
</main>

<style>
	.widget-icon-div {
		width: 34.62px;
		height: 34.62px;
		background: #e8e8e8;
		border-radius: 12.2195px;
	}

	.widget-status {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 400;
		font-size: 12.2195px;
		line-height: 18px;
		letter-spacing: 0.01em;
		color: #606060;
		margin-top: 12px;
	}

	.widget-values {
		font-family: 'Poppins';
		font-style: normal;
		font-weight: 600;
		font-size: 22.4024px;
		line-height: 34px;
		letter-spacing: 0.01em;
		color: #000000;
		margin: 0;
	}

	.trend-div {
		display: flex;
		margin-top: 5px;
	}

	.trend-value {
		font-family: 'Poppins';
		font-weight: 400;
		font-size: 10.3809px;
		line-height: 16px;
		letter-spacing: 0.01em;
		margin: 0;
	}

	.trend-time {
		font-family: 'Poppins';
		font-weight: 400;
		font-size: 10.9622px;
		line-height: 16px;
		letter-spacing: 0.01em;
		margin: 0;
		color: #606060;
	}
</style>
