<script lang="ts">
	import { page } from '$app/stores';
	import CreateOrder from '../../../../../components/orderComponent/createOrder.svelte';

	let obj = { view: 'edit-order', id: $page.params.id };
</script>

<main>
	<CreateOrder formObj={obj}/>
</main>
