import {
  SmartContract,
  state,
  State,
  method,
  Reducer,
  Field,
  UInt64,
  Struct,
  Provable,
} from 'o1js';
import { MultiPackedStringFactory } from 'o1js-pack';

export class IpfsHash extends MultiPackedStringFactory(2) {}

class VoteAction extends Struct({
  option: Field,
}) {}

export class Poll extends SmartContract {
  NUM_VOTES_ALLOWED = 1;

  @state(IpfsHash) electionDetailsIpfs = State<IpfsHash>();
  @state(UInt64) option1 = State<UInt64>();
  @state(UInt64) option2 = State<UInt64>();
  @state(UInt64) option3 = State<UInt64>();
  @state(Field) actionState = State<Field>();

  reducer = Reducer({ actionType: VoteAction });

  init() {
    super.init();
    this.electionDetailsIpfs.set(IpfsHash.fromString(''));
    this.option1.set(UInt64.from(0));
    this.option2.set(UInt64.from(0));
    this.option3.set(UInt64.from(0));
    this.actionState.set(Reducer.initialActionState);
    this.account.delegate.set(this.sender);
  }

  @method
  setElectionDetails(electionDetailsIpfs: IpfsHash) {
    this.electionDetailsIpfs.getAndRequireEquals();
    this.electionDetailsIpfs.requireEquals(IpfsHash.fromString(''));
    this.electionDetailsIpfs.set(electionDetailsIpfs);
  }

  @method
  castVote(vote: Field) {
    this.reducer.dispatch({
      option: vote,
    });
  }

  @method
  reduceVotes() {
    const option1 = this.option1.getAndRequireEquals();
    const option2 = this.option2.getAndRequireEquals();
    const option3 = this.option3.getAndRequireEquals();
    const actionState = this.actionState.getAndRequireEquals();

    let pendingActions = this.reducer
      .getActions({
        fromActionState: actionState,
      })
      .slice(0, 3); // at most, reduce 3 actions

    let { state: newVotes, actionState: newActionState } = this.reducer.reduce(
      pendingActions,
      Provable.Array(UInt64, 3),
      (state: Array<UInt64>, action: VoteAction) => {
        const a = Provable.if(action.option.equals(Field(1)), UInt64.from(1), UInt64.from(0));
        const b = Provable.if(action.option.equals(Field(2)), UInt64.from(1), UInt64.from(0));
        const c = Provable.if(action.option.equals(Field(3)), UInt64.from(1), UInt64.from(0));
        state[0] = state[0].add(a);
        state[1] = state[1].add(b);
        state[2] = state[2].add(a);
        return state;
      },
      {
        state: [option1, option2, option3],
        actionState: actionState,
      }
    );

    this.option1.set(newVotes[0]);
    this.option2.set(newVotes[1]);
    this.option3.set(newVotes[2]);
    this.actionState.set(newActionState);
  }
}
