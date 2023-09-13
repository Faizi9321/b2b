<script lang="ts">
	import { page } from '$app/stores';
	import CustomerForm from '../../../../../components/customerForm/customerForm.svelte';

	let obj = { view: 'view', id: $page.params.id };
</script>

<main>
	<CustomerForm formObj={obj} />
</main>
