<script lang="ts">
	import { page } from '$app/stores';
	import ViewOrder from '../../../../../components/orderComponent/viewOrder.svelte';

	let obj = { view: 'view-rfq', id: $page.params.id };
</script>

<main>
	<ViewOrder formObj={obj}/>
</main>
