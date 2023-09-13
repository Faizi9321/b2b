<script lang="ts">
	import Dialog, { Content, Header } from '@smui/dialog';
	import { appConfig } from '../config';
	import defaultPlaceholder from '../assets/images/default-placeholder.png';
	import IconButton from '@smui/icon-button';
	import { afterUpdate } from 'svelte';

	export let open: boolean;
	export let modalData: any;

	let curreImg: number = 1;
	let totalImgs: number = 0;
	let imgSrc: any;

	afterUpdate(() => {
		totalImgs = modalData == undefined ? 0 : modalData.length;
		if (modalData != undefined) {
			imgSrc = appConfig.file_base_url + modalData[0].path;
		}
	});

	let onPrevious = () => {
		curreImg--;
		imgSrc = appConfig.file_base_url + modalData[curreImg - 1].path;
	};

	let onNext = () => {
		imgSrc = appConfig.file_base_url + modalData[curreImg].path;
		curreImg++;
	};
</script>

<main>
	<Dialog bind:open>
		<Header class="dialog-header">
			<IconButton action="close" class="material-icons close-icon">close</IconButton>
		</Header>
		<Content id="simple-content">
			<img
				src={imgSrc != undefined || imgSrc != null ? imgSrc : defaultPlaceholder}
				alt=""
				style="height:350px; width:350px;padding:12px"
			/>
		</Content>
		<div class="product-img-navigation">
			<IconButton
				class="material-icons product-img-icons"
				style={curreImg == 1 ? 'background: #C2C2C2;pointer-events: none;' : 'background: #1779B8;'}
				on:click={onPrevious}>arrow_back_ios</IconButton
			>
			<p style="margin-inline: 8px;font-size: 14px;" class="ff-poppins">{curreImg}/{totalImgs}</p>
			<IconButton
				class="material-icons product-img-icons"
				style={curreImg == totalImgs
					? 'background: #C2C2C2;pointer-events: none;'
					: 'background: #1779B8;'}
				on:click={onNext}>arrow_forward_ios</IconButton
			>
		</div>
	</Dialog>
</main>

<style>
	.product-img-navigation {
		position: absolute;
		bottom: 10%;
		box-shadow: 0px 20px 50px rgb(0 0 0 / 20%);
		border-radius: 40px;
		height: 30px;
		left: 50%;
		right: 50%;
		display: flex;
		place-content: center;
		align-items: center;
	}

	:global(.product-img-icons) {
		font-size: 14px;
		height: 20px;
		width: 20px;
		box-shadow: 0px 20px 50px rgb(0 0 0 / 5%);
		border-radius: 50%;
		padding: 14px;
		color: white;
		cursor: pointer;
	}

	:global(.mdc-dialog__surface) {
		position: inherit;
		overflow: inherit;
		width: fit-content;
		padding: 0;
	}

	:global(.close-icon) {
		background: #1779b8;
		color: white !important;
		border-radius: 50%;
		position: absolute;
		font-size: 16px;
		width: 16px;
		height: 16px;
		cursor: pointer;
		right: 0;
	}

	:global(.mdc-dialog__header) {
		position: relative;
		top: -12px;
		right: -12px;
	}
</style>
