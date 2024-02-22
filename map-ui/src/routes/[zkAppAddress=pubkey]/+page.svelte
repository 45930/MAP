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

	const formId = `form-${$page.params.zkAppAddress}`;
	let vote: number | null = null;
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

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		const votes = new Array(content?.options.length).fill(0);
		if (vote != null) {
			votes[vote] = 1;
		}
		const tx = await $zkappStore.vote(zkAppAddress, votes);
		vote = null;
		console.log(tx);
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
			<form id={formId} on:submit={handleSubmit}>
				{#each content.options as opt, idx}
					<div>
						<label>
							<input
								id={`opt-${idx}`}
								name={`opt-${idx}`}
								value={idx}
								bind:group={vote}
								type="radio"
							/>
							{opt}
						</label>
					</div>
				{/each}
				<button type="submit">Submit your vote!</button>
			</form>
		</div>
	</div>
{:else}
	<div>Oops!</div>
{/if}
