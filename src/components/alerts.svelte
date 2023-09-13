<script lang="ts">
	import IconButton from '@smui/icon-button';
	import Dialog from '@smui/dialog';
	import mark from '../assets/icons/mark-done.png';
	import error from '../assets/icons/mark-error.png';
	import { _ } from 'svelte-i18n';
	import { afterUpdate } from 'svelte';

	export let alertData: any;
	export let openAlerts: boolean;
	export const reCallAlerts = () => {
		openAlerts = !openAlerts;
	};
	let lang: string = 'en';

	afterUpdate(() => {
		lang = localStorage.getItem('language')!;
	});
</script>

<main>
	<Dialog
		bind:open={openAlerts}
		aria-labelledby="default-focus-title"
		aria-describedby="default-focus-content"
	>
		<div class="dialog">
			<IconButton
				action="close"
				class="material-icons"
				on:click={() => (openAlerts = false)}
				style={lang == 'en'
					? 'position:absolute; right:0; z-index:1; top:0'
					: 'position:absolute; left:0; z-index:1; top:0'}>close</IconButton
			>

			<div style="height:50px">
				<img class="icon" src={alertData?.type == 'success' ? mark : error} alt="" />
			</div>

			<div>
				<div style="font-family: poppins-semibold;font-size: 18px;">
					{$_(alertData?.heading)}
				</div>
				<div style="font-family: poppins; font-size: 14px;">
					{$_(alertData?.message)}
				</div>
			</div>
		</div>
	</Dialog>
</main>

<style>
	:global(.mdc-icon-button.mdc-ripple-upgraded) {
		--mdc-ripple-fg-size: 0px !important;
		--mdc-ripple-fg-scale: 0px !important;
		--mdc-ripple-left: 0px !important;
		--mdc-ripple-top: 0px !important;
	}

	.icon {
		width: 60px;
		height: 60px;
		margin-inline: 14px;
	}

	.dialog {
		min-height: 100px;
		max-height: fit-content;
		display: flex;
		place-content: baseline;
		align-items: center;
		width: 400px;
		position: relative;
	}
</style>
