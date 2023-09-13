<script lang="ts">
	import CustomerForm from '../../../../components/customerForm/customerForm.svelte';

	let obj = { view: 'create' };
</script>

<main>
	<CustomerForm formObj={obj} />
</main>
