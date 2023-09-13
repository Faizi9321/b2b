<script lang="ts">
	import { page } from '$app/stores';
	import LocationForm from '../../../../../components/locationForm/locationForm.svelte';

	let obj = { view: 'view', id: $page.params.id };
</script>

<main>
	<LocationForm locationFormObj={obj} />
</main>
