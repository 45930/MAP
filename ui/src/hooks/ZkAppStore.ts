import { Store } from "@tanstack/store";
import { PollWithMwtAuth } from "../../../contracts/src/PollWithMwtAuth";

const ZkappStore = new Store<
{
  address: string | null,
  instance: PollWithMwtAuth | null
}>({
  address: null,
  instance: null
});

export default ZkappStore;