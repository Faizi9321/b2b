<script lang="ts">
	import { page } from '$app/stores';
	import CustomerForm from '../../../../../components/customerForm/customerForm.svelte';

	let obj = { view: 'edit', id: $page.params.id };
</script>

<main>
	<CustomerForm formObj={obj} />
</main>
