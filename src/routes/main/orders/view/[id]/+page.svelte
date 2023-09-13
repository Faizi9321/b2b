<script lang="ts">
	import { page } from '$app/stores';
	import ViewOrder from '../../../../../components/orderComponent/viewOrder.svelte';

	let obj = { view: 'view-order', id: $page.params.id };
</script>

<main>
	<ViewOrder formObj={obj}/>
</main>
