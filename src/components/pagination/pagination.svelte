<script lang="ts">
	import IconButton from '@smui/icon-button';
	import './pagination.scss';
	import { afterUpdate, beforeUpdate, createEventDispatcher, onMount } from 'svelte';

	export let currentPage = 1;
	export let totalPages = 0;
	let setPage = createEventDispatcher();
	let lang: string = 'en';

	onMount(() => {
		lang = localStorage.getItem('language')!;
	});

	beforeUpdate(() => {
		lang = localStorage.getItem('language')!;
	});

	let makePagination = (pageNumber: any) => {
		setPage('setPage', pageNumber);
	};
</script>

<div class="table-footer ff-poppins">
	<ul class="up-pagination">
		<li>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				on:click={() => makePagination(currentPage - 1)}
				style="width: 28px; padding: 2px 0px;border: none;"
				class={currentPage === 1 ? 'disabled' : ''}
			>
				<IconButton class="material-icons icon-button"
					>{lang == 'ar' ? 'keyboard_arrow_right' : 'keyboard_arrow_left'}</IconButton
				>
			</a>
		</li>
		{#if currentPage > 4}
			<li>
				<span style="display: block; margin: 0 5px">...</span>
			</li>
		{/if}
		{#if currentPage > 3}
			<li>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-missing-attribute -->
				<a on:click={() => makePagination(currentPage - 3)}>{currentPage - 3}</a>
			</li>
		{/if}
		{#if currentPage > 2}
			<li>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-missing-attribute -->
				<a on:click={() => makePagination(currentPage - 2)}>{currentPage - 2}</a>
			</li>
		{/if}
		{#if currentPage > 1}
			<li>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-missing-attribute -->
				<a on:click={() => makePagination(currentPage - 1)}>{currentPage - 1}</a>
			</li>
		{/if}
		<li class="active">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a on:click={() => makePagination(currentPage)}>{currentPage}</a>
		</li>
		{#if currentPage < totalPages}
			<li>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-missing-attribute -->
				<a on:click={() => makePagination(currentPage + 1)}>{currentPage + 1}</a>
			</li>
		{/if}
		{#if currentPage + 1 < totalPages}
			<li>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-missing-attribute -->
				<a on:click={() => makePagination(currentPage + 2)}>{currentPage + 2}</a>
			</li>
		{/if}
		{#if currentPage + 3 < totalPages}
			<li>
				<span style="display: block; margin: 0 5px">...</span>
			</li>
		{/if}
		<!-- svelte-ignore a11y-missing-attribute -->
		<li>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<a
				on:click={() => makePagination(currentPage + 1)}
				style="width: 28px; padding: 2px 0px;border: none;"
				class={currentPage === totalPages ? 'disabled' : ''}
			>
				<IconButton class="material-icons icon-button"
					>{lang == 'ar' ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}</IconButton
				>
			</a>
		</li>
	</ul>
</div>
