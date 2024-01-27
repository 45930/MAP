import { writable } from "svelte/store";
import "o1js";
import { Mina, PublicKey, fetchAccount } from "o1js";
import { Poll } from "voting-playground-contracts";

const network = Mina.Network({
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
});
Mina.setActiveInstance(network);

export const minaStore = writable(Mina);

await fetchAccount({publicKey: PublicKey.fromBase58(import.meta.env.VITE_ZKAPP_PUBLIC_KEY) });
const initPoll = new Poll(PublicKey.fromBase58(import.meta.env.VITE_ZKAPP_PUBLIC_KEY));
export const pollStore = writable<Poll[]>([initPoll]);