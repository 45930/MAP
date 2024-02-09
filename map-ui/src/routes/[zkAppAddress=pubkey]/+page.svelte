<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getIpfsHash } from '../server/pollWorker';
	import { getIpfsContent } from '../server/ipfsClient';

	let zkAppAddress = $page.params.zkAppAddress;
	let ipfsHash = '';
	let content = '';

	onMount(async () => {
		ipfsHash = await getIpfsHash(zkAppAddress);
		content = await getIpfsContent(ipfsHash);
	});
</script>

<div>
	{content}
</div>
