<script lang="ts">
	import Card from '@smui/card/src/Card.svelte';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import { afterUpdate, beforeUpdate, createEventDispatcher } from 'svelte';
	import DateRangeSelect from 'svelte-date-range-select';
	import search from '../../assets/icons/search.png';
	import './advanced-search.scss';
	import { _ } from 'svelte-i18n';

	const dispatch = createEventDispatcher();
	export let advanceSearchConfig: any;
	export let searchVal = '';
	let searchLabel: string = '';
	let dropdowns: any[] = [];
	let datePicker: any;
	let noLabel: boolean = false;

	beforeUpdate(() => {
		({ searchLabel, dropdowns } = advanceSearchConfig);
		datePicker = dropdowns.find((element: any) => {
			if (element.placeholder == 'Date Range') {
				return true;
			}
		});
	});

	function handleChange(ev: any) {
		dispatch('searchText', {
			text: ev.data
		});
	}

	const handleStatusChnage = (ev: any) => {
		if (ev) {
			noLabel = true;
		}
		dispatch('dropdown', {
			option: ev
		});
	};

	const endDateMax = new Date();
	const startDateMin = new Date(
		new Date().setFullYear(endDateMax.getFullYear(), endDateMax.getMonth() - 36)
	);
	function handleApplyDateRange(data: any) {
		dispatch('datepicker', {
			date: data.detail
		});
	}
</script>

<main>
	<Card
		style={datePicker
			? 'padding:4px 20px; margin-bottom:24px'
			: 'padding:12px 20px; margin-bottom:24px'}
	>
		<div class="main-advance-search">
			<Textfield
				class="shaped-outlined"
				variant="outlined"
				bind:value={searchVal}
				label={$_(searchLabel)}
				noLabel={true}
				ripple={false}
				on:input={handleChange}
				style="width:100%"
			>
				<img
					src={search}
					height="18px"
					width="18px"
					alt=""
					slot="leadingIcon"
					style="margin: 8px;align-self: center;"
				/>
			</Textfield>
			{#each dropdowns as dropdown}
				{#if dropdown.placeholder == 'Date Range'}
					<div class="datePicker">
						<DateRangeSelect
							{startDateMin}
							{endDateMax}
							on:onApplyDateRange={handleApplyDateRange}
						/>
					</div>
				{/if}
				{#if dropdown.placeholder != 'Date Range'}
					<div class="dropdown">
						<Select
							class="shaped-filled"
							variant="outlined"
							label={$_(dropdown.placeholder)}
							{noLabel}
						>
							{#each dropdown.options as option}
								<Option on:click={() => handleStatusChnage(option.id)} value={option.id}
									>{$_(option.name)}</Option
								>
							{/each}
							<img
								src={dropdown.iconPath}
								height="18px"
								width="18px"
								alt=""
								slot="leadingIcon"
								style="margin: 8px;align-self: center;"
							/>
						</Select>
					</div>
				{/if}
			{/each}
		</div>
	</Card>
</main>

<style>
	:global(.applyButton.svelte-nnopc8) {
		border: 1px solid;
	}

	:global(.applyButton.svelte-nnopc8) {
		width: var(--applyButtonWidth, 43px) !important;
		height: var(--applyButtonHeight, 38px) !important;
		color: var(--applyButtonColor, #fff) !important;
		padding: var(--applyButtonPadding, 0px) !important;
		border-radius: 12px;
	}
</style>
