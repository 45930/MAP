import { writable } from 'svelte/store';

const ipfsData: Record<string, string> = {};

export default writable(ipfsData);
