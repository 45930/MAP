<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getIpfsContent } from '../../server/ipfsClient';

	import zkappStore from '$lib/stores/zkappStore';
	import ipfsDataStore from '$lib/stores/ipfsDataStore';

	interface IIpfsPollData {
		title: string;
		subtitle: string;
		body: Array<string>;
		options: Array<string>;
	}

	let zkAppAddress = $page.params.zkAppAddress;
	let ipfsHash = '';
	let content: IIpfsPollData | undefined;

	let loading = true;

	onMount(() => {
		setup();
	});

	const setup = async () => {
		if (!$ipfsDataStore[zkAppAddress]) {
			ipfsHash = await $zkappStore.getIpfsHash(zkAppAddress);
			$ipfsDataStore[zkAppAddress] = ipfsHash;
		}
		ipfsHash = $ipfsDataStore[zkAppAddress];
		content = await getIpfsContent(ipfsHash);
		loading = false;
	};
</script>

{#if loading}
	<div>Loading....</div>
{:else if content}
	<div class="text-center mx-[200px]">
		<div class=" bg-white p-6 mb-10">
			<h2 class="text-xl font-bold">{content.title}</h2>
			<div>{content.subtitle}</div>
		</div>
		<div class="text-lg font-bold mb-2">
			{#each content.body as body}
				<div>{body}</div>
			{/each}
		</div>
		<div class="text-left">
			{#each content.options as opt}
				<div>{opt}</div>
			{/each}
		</div>
	</div>
{:else}
	<div>Oops!</div>
{/if}
