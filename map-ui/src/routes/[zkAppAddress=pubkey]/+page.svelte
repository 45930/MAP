<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import ZkappClient from '../../server/zkapp/pollClient';
	import { getIpfsContent } from '../../server/ipfsClient';

	let zkAppAddress = $page.params.zkAppAddress;
	let ipfsHash = '';
	let content = '';

	let loading = true;

	const zkClient = new ZkappClient();

	onMount(() => {
		setup();
	});

	const setup = async () => {
		await zkClient.setupZkappInstance(zkAppAddress);
		// ipfsHash = zkClient.getIpfsHash();
		// content = await getIpfsContent(ipfsHash);
		loading = false;
	};
</script>

{#if loading}
	<div>Loading....</div>
{:else}
	<div>
		{content}
	</div>
{/if}
