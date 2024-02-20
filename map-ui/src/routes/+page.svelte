<script lang="ts">
	import { onMount } from 'svelte';
	import zkappStore from '$lib/stores/zkappStore';

	let hasBeenSetup = false;
	let instances: Array<string> = [];

	onMount(async () => {
		const status = await $zkappStore.getStatus();
		instances = status.instnaces;
		hasBeenSetup = status.hasBeenSetup;
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
		{#if hasBeenSetup}
			{#each instances as instance}
				<div>
					<a href={`/${instance}`}>{instance}</a>
				</div>
			{/each}
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
