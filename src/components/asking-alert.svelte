<script lang="ts">
	import Dialog, { Content, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import { createEventDispatcher } from 'svelte';
	import { _ } from 'svelte-i18n';

	export let open: boolean = false;
	export let askingAlertData: any;

	let output = createEventDispatcher();

	export const reCallAlert = () => {
		open = !open;
	};

	let actionHandler = (e: CustomEvent<{ action: string }>) => {
		switch (e.detail.action) {
			case 'close':
				output('onClickAertAction', { status: false, type: askingAlertData?.type });
				break;
			case 'response':
				output('onClickAertAction', { status: true, type: askingAlertData?.type });
				break;
		}
	};
</script>

<Dialog bind:open scrimClickAction="" escapeKeyAction="" on:SMUIDialog:closed={actionHandler}>
	<Content>
		<div class="dialog-width">
			<div style="font-size: 16px;text-align: center;color:black" class="ff-poppins-semibold">
				{$_(askingAlertData?.heading)}
			</div>

			<div
				style="font-size: 12.2195px;color: #000;text-align: center;margin-top: 12px;padding: 0 30px;"
				class="ff-poppins"
			>
				{$_(askingAlertData?.message)}
			</div>
		</div>
	</Content>
	<Actions class="actionsBlock">
		<Button
			variant="unelevated"
			class="btn ff-poppins-semibold"
			style="width: 130px;height: 38px;"
			action="response"
		>
			<Label>{$_(askingAlertData?.leftButtonText)}</Label>
		</Button>
		<Button
			variant="unelevated"
			class="btn ff-poppins-semibold"
			style="background: #95989A;color: white;width: 130px;height: 38px;"
			action="close"
		>
			<Label>{$_(askingAlertData?.rightButtonText)}</Label>
		</Button>
	</Actions>
</Dialog>

<style>
	.dialog-width {
		width: 360px;
	}

	:global(.actionsBlock) {
		grid-gap: 12px;
		display: flex;
		place-content: center;
		align-items: center;
		margin-bottom: 16px;
	}

	:global(.mdc-dialog .mdc-dialog__content) {
		padding: 20px 24px 10px 24px;
	}
</style>
