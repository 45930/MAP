<script lang="ts">
	import { Mina, PublicKey, fetchAccount } from 'o1js';
	import { onMount } from 'svelte';
	import { Poll } from 'voting-playground-contracts';

	let poll: Poll;

	onMount(async () => {
		const network = Mina.Network({
			mina: 'http://localhost:8080/graphql',
			archive: 'http://localhost:8282',
			lightnetAccountManager: 'http://localhost:8181'
		});
		Mina.setActiveInstance(network);
		const a = await fetchAccount({
			publicKey: PublicKey.fromBase58(import.meta.env.VITE_ZKAPP_PUBLIC_KEY)
		});
		console.log(a.account?.zkapp?.appState);
		await Poll.compile();
		poll = new Poll(PublicKey.fromBase58(import.meta.env.VITE_ZKAPP_PUBLIC_KEY));
		console.log(poll.ballot.toString());
		console.log(poll.electionDetailsIpfs.toString());
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
		<h2>Active Polls</h2>
		{#if poll}
			<div>
				{poll.ballot.toString()}, {poll.electionDetailsIpfs.toString()}
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
