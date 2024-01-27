import { Store } from "@tanstack/store";
import { PollWithMwtAuth } from "../../../contracts/src/PollWithMwtAuth";

const ZkappStore = new Store<
{
  address: string | null,
  instance: PollWithMwtAuth | null,
  worker: any
}>({
  address: null,
  instance: null,
  worker: null
});

export default ZkappStore;