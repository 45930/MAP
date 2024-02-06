<script lang="ts">
	import { Mina, PublicKey, fetchAccount, Field } from 'o1js';
	import { onMount } from 'svelte';
	import { Ballot, PartialBallot, Poll } from 'voting-playground-contracts';
	import type { IPoll } from '../types';
	import { getIpfsContent } from './server/ipfsClient';

	let poll: IPoll;
	let content = '';

	onMount(async () => {
		// 	const network = Mina.Network({
		// 		mina: 'http://localhost:8080/graphql',
		// 		archive: 'http://localhost:8282',
		// 		lightnetAccountManager: 'http://localhost:8181'
		// 	});
		// 	Mina.setActiveInstance(network);
		// 	const a = await fetchAccount({
		// 		publicKey: PublicKey.fromBase58(import.meta.env.VITE_ZKAPP_PUBLIC_KEY)
		// 	});
		// 	const appState = a.account?.zkapp?.appState;
		// 	const ballot1 = Field(appState![2]);
		// 	const ballot2 = Field(appState![3]);
		// 	const ballot =
		// 	poll = new Poll(PublicKey.fromBase58(import.meta.env.VITE_ZKAPP_PUBLIC_KEY));
		// 	console.log(poll.ballot.toString());
		// 	console.log(poll.electionDetailsIpfs.toString());
		poll = {
			prompt: 'What is your favorite Mina Foundation developer program?',
			optionLabels: ['Core Grants', 'Zk Ignite', 'Mina Navigators']
		};

		const cid = 'QmPKD74Pfc6aH5Suh1EXqjbfKBYDs5QVARxmpqsNKMKxe3';
		content = await getIpfsContent(cid);
	});
</script>

<svelte:head>
	<title>MAP HOME</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Welcome to Mina Action Polls</h1>

	<h2>Mina action polls is a simple vote tally applicatio built on Mina.</h2>

	<div>
		{#if poll}
			<div>
				<h2>{poll.prompt}</h2>
				<div>
					{content}
				</div>
				<div class="block">
					{#each poll.optionLabels as label}
						<div>
							<label>{label}</label>
							<input />
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
