<script lang="ts">
	import Card from '@smui/card';
	import Select, { Option } from '@smui/select';
	import DashboardWidgets from '../../../components/dashboardWidgets.svelte';
	import upTrend from '../../../assets/icons/upTrend.png';
	import { Line } from 'svelte-chartjs';
	import widImg from '../../../assets/icons/bag-tick.png';
	import plus from '../../../assets/icons/bi_cart-plus-fill.png';
	import clock from '../../../assets/icons/bi_cart-fill.png';
	import cross from '../../../assets/icons/bi_cart-x-fill.png';
	import ordersTotal from '../../../assets/icons/total_orders.png';
	import ordersOpen from '../../../assets/icons/open_orders.png';
	import ordersCompany from '../../../assets/icons/pending-approval.png';
	import { _ } from 'svelte-i18n';
	import './dashboard.scss'

	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	} from 'chart.js';
	import { onMount, beforeUpdate, afterUpdate } from 'svelte';
	import { POST } from '../../apiService';
	import TableComponent from '../../../components/tableComponent/tableComponent.svelte';
	import { langChange } from '../../../store';

	ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);

	let fruits = ['Today', 'Last 7 days', 'This Month'];
	let overAllOrderAmount = 0;
	let lineChartData: any = {};
	let CardOrderData: any = [];
	let completedOrder: any = [];
	let submittedOrder: any = [];
	let openedOrder: any = [];
	let cancelledOrder: any = [];
	let CardTotalOrderData: any = [];
	let totalOrder: any = [];
	let openOrder: any = [];
	let CardTotalCompanyUser: any = [];
	let columnHeaders = {
		imgUrl: '',
		productName: 'Product Name',
		productvalue: 'Value',
		count: 'Count'
	};
	let dataSource: any;
	let lang: string = 'en';
	let value: string = 'Today';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		getChartData();
		getOrderDashboard();
		getTotalOrderDashboard();
		getTotalCompanyUserDashboard();
		getTableData();
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
		if ($langChange) {
			getTableData();
			langChange.set(false);
		}
	});

	function getChartData(filter?: string) {
		overAllOrderAmount = 0;
		let url = 'BCDashboard/GetOrderGraph';
		let data = {
			duration: filter == '' || filter == null ? 'Today' : filter
		};
		POST(url, data).then((result) => {
			if (result.succeeded === true) {
				let labels: any = [];
				let sales: any = [];
				result.data.forEach((element: any) => {
					labels.push(element.order);
					sales.push(Math.round(element.totalAmount));
					overAllOrderAmount = overAllOrderAmount + element.totalAmount;
				});
				lineChartData = {
					labels: labels,
					datasets: [
						{
							data: sales,
							label: 'Orders',
							tension: 0.5,
							borderColor: 'rgba(23, 121, 184, 1)',
							backgroundColor: 'rgba(23, 121, 184, 1)',
							pointBorderColor: '#000000',
							pointBackgroundColor: 'white'
						}
					]
				};
			} else {
			}
		});
	}

	function getOrderDashboard(filter?: string, hasPercentage?: boolean) {
		let data = {
			duration: filter == '' || filter == null ? 'Today' : filter
		};
		let url = `BCDashboard/GetOrderDashboard`;
		POST(url, data).then((result) => {
			if (result.succeeded) {
				CardOrderData = result.data;
				openedOrder = CardOrderData.filter((x: any) => x.name === 'Opened');
				submittedOrder = CardOrderData.filter((x: any) => x.name === 'Submitted');
				completedOrder = CardOrderData.filter((x: any) => x.name === 'Completed');
				cancelledOrder = CardOrderData.filter((x: any) => x.name === 'Cancelled');
			}
		});
	}

	function getTotalOrderDashboard(filter?: string, hasPercentage?: boolean) {
		let data = {
			duration: filter == '' || filter == null ? 'Today' : filter
		};
		let url = `BCDashboard/GetOrderValueDashboard`;
		POST(url, data).then((result) => {
			if (result.succeeded) {
				CardTotalOrderData = result.data;
				totalOrder = CardTotalOrderData.filter((x: any) => x.name === 'Total Order Value');
				openOrder = CardTotalOrderData.filter((x: any) => x.name === 'Open Order Value');
			}
		});
	}

	function getTotalCompanyUserDashboard(filter?: string, hasPercentage?: boolean) {
		let data = {
			duration: filter == '' || filter == null ? 'Today' : filter
		};
		let url = `BCDashboard/GetBCUserDashboard`;
		POST(url, data).then((result) => {
			if (result.succeeded) {
				CardTotalCompanyUser = result.data;
			}
		});
	}

	function getTableData(filter?: string) {
		let url = `BCDashboard/GetFrequentOrderProduct`;
		let data = {
			duration: filter == '' || filter == null ? 'Today' : filter
		};
		POST(url, data).then((result) => {
			if (result.succeeded) {
				result.data.forEach((element: any) => {
					element.imgUrl = element.productImage != null ? element.productImage : undefined;
					element.productName = lang == 'ar' ? element.arProductName : element.productName;
				});
				dataSource = result.data;
			}
		});
	}

	function submit(ev: any) {
		if (ev == 'Last 7 days') {
			getOrderDashboard('Last_Seven-Day', false);
			getTotalOrderDashboard('Last_Seven-Day', false);
			getTotalCompanyUserDashboard('Last_Seven-Day', false);
			getChartData('Last_Seven-Day');
			getTableData('Last_Seven-Day');
		} else if (ev == 'This Month') {
			getOrderDashboard('This-Month', true);
			getTotalOrderDashboard('This-Month', false);
			getTotalCompanyUserDashboard('This-Month', false);
			getChartData('This-Month');
			getTableData('This-Month');
		} else {
			getOrderDashboard('Today', false);
			getTotalOrderDashboard('Today', false);
			getTotalCompanyUserDashboard('Today', false);
			getChartData('Today');
			getTableData('Today');
		}
	}
</script>

<main>
	<div class="main">
		<div class="graph-div">
			<div>
				<Card
					class="graph-card"
					style="height:400px; border-radius:10px; padding:24px 22px; display:grid; grid-template-rows: 3fr 8fr"
				>
					<div style=" display:flex; justify-content:space-between">
						<div>
							<p class="overall-order">{$_('Overall Orders')}</p>
							<div style="display:flex; align-items:center">
								<p class="overall-order-value">
									SAR {overAllOrderAmount == undefined ? 0 : overAllOrderAmount.toLocaleString()}
								</p>
								{#if value == 'This Month'}
									<img src={upTrend} style="height: 7px; width:11px; margin-left:7px" alt="" />
									<span class="green-text"> 13.02% </span>
								{/if}
							</div>
						</div>
						<div>
							<Select class="shaped-filled currentFilter" variant="filled" bind:value>
								<!-- <Option value="" /> -->
								{#each fruits as fruit}
									<Option on:click={() => submit(fruit)} value={fruit}>{$_(fruit)}</Option>
								{/each}
							</Select>

							<!-- <pre class="status">Selected: {value}</pre> -->
						</div>
					</div>
					<div style="width:98%">
						<Line
							data={lineChartData}
							options={{
								maintainAspectRatio: false,
								scales: {
									x: {
										grid: { display: false },
										ticks: {
											color: '#BCBCBC'
										}
									},
									y: {
										grid: { borderDash: [4] },
										ticks: {
											color: '#BCBCBC',
											callback: (value) => {
												return 'SAR ' + value.toString() + 'K';
											}
										}
									}
								}
							}}
						/>
					</div>
				</Card>
			</div>
			<div class="graph-widgets-div">
				<DashboardWidgets
					order={openedOrder[0]?.name}
					orderValue={openedOrder[0]?.count}
					percentageValue={openedOrder[0]?.percentage.toFixed(2)}
					previousMonthName={openedOrder[0]?.previousMonthName}
					icon={widImg}
					currentMonth={value}
				/>
				<DashboardWidgets
					order={submittedOrder[0]?.name}
					orderValue={submittedOrder[0]?.count}
					percentageValue={submittedOrder[0]?.percentage.toFixed(2)}
					previousMonthName={submittedOrder[0]?.previousMonthName}
					icon={plus}
					currentMonth={value}
				/>
				<DashboardWidgets
					order={completedOrder[0]?.name}
					orderValue={completedOrder[0]?.count}
					percentageValue={completedOrder[0]?.percentage.toFixed(2)}
					previousMonthName={completedOrder[0]?.previousMonthName}
					icon={clock}
					currentMonth={value}
				/>
				<DashboardWidgets
					order={cancelledOrder[0]?.name}
					orderValue={cancelledOrder[0]?.count}
					percentageValue={cancelledOrder[0]?.percentage.toFixed(2)}
					previousMonthName={cancelledOrder[0]?.previousMonthName}
					icon={cross}
					currentMonth={value}
				/>
			</div>
		</div>
		<div class="widgets-row">
			<DashboardWidgets
				order={totalOrder[0]?.name}
				orderValue={totalOrder[0]?.totalOrderValue}
				percentageValue={totalOrder[0]?.percentage.toFixed(2)}
				previousMonthName={totalOrder[0]?.previousMonthName}
				icon={ordersTotal}
				currentMonth={value}
				totalOrderDashboard={true}
			/>
			<DashboardWidgets
				order={openOrder[0]?.name}
				orderValue={openOrder[0]?.openOrderValue}
				percentageValue={openOrder[0]?.percentage.toFixed(2)}
				previousMonthName={openOrder[0]?.previousMonthName}
				icon={ordersOpen}
				currentMonth={value}
				totalOrderDashboard={true}
			/>
			<DashboardWidgets
				order={CardTotalCompanyUser[0]?.name}
				orderValue={CardTotalCompanyUser[0]?.count}
				percentageValue={CardTotalCompanyUser[0]?.percentage.toFixed(2)}
				previousMonthName={CardTotalCompanyUser[0]?.previousMonthName}
				icon={ordersCompany}
				currentMonth={value}
			/>
		</div>
		<div class="dashboard-table-div">
			<Card style="height:340px;overflow:auto;">
				<p class="top-order">{$_('Top 10 Frequently Ordered Products')}</p>
				<TableComponent {columnHeaders} {dataSource} isPagination={false} />
			</Card>
		</div>
	</div>
</main>

