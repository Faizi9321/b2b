<script lang="ts">
	import B2BLogo from '../assets/images/blue-logo.png';
	import CircularProgress from '@smui/circular-progress';
</script>

<div class="loader">
	<img src={B2BLogo} alt="" width="120px" height="auto" />
	<CircularProgress style="height: 32px; width: 32px;" indeterminate />
</div>

<style>
	.loader {
		position: absolute;
		z-index: 9999999999999;
		width: 200px;
		height: 100px;
		background: white;
		border-radius: 12px;
		padding: 20px;
		top: 40%;
		left: 44%;
		box-shadow: 0px 0px 6px #888888;
		display: flex;
		flex-direction: column;
		place-content: center;
		align-items: center;
		grid-gap: 26px;
	}
	:global(.mdc-circular-progress__indeterminate-circle-graphic) {
		stroke: #168ec8;
	}
</style>
