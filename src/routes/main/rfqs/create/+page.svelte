<script lang="ts">
	import CreateOrder from '../../../../components/orderComponent/createOrder.svelte';

	let obj = { view: 'create-rfq' };
</script>

<main>
	<CreateOrder formObj={obj}/>
</main>
