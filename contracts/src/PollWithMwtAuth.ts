import {
  SmartContract,
  state,
  State,
  method,
  UInt32,
  Reducer,
  Field,
  Struct,
  Signature,
  PublicKey,
  UInt64,
} from 'o1js';
import { PackedUInt32Factory, MultiPackedStringFactory } from 'o1js-pack';
import { MWT, MWTData } from 'mina-web-tokens';

export class IpfsHash extends MultiPackedStringFactory(2) {}
export class PartialBallot extends PackedUInt32Factory() {}

export class Ballot extends Struct({
  partial1: Field,
  partial2: Field,
}) {}

export class VoteAction extends Struct({
  ballot: Ballot,
}) {}

export class AuthShape extends Struct({
  iss: PublicKey,
  sub: PublicKey,
  exp: UInt64,
  scope: Field,
}) {}

export class PollWithMwtAuth extends SmartContract {
  NUM_VOTES_ALLOWED = 1;

  @state(IpfsHash) electionDetailsIpfs = State<IpfsHash>();
  @state(Ballot) ballot = State<Ballot>();
  @state(Field) actionState = State<Field>();

  reducer = Reducer({ actionType: VoteAction });

  init() {
    super.init();
    this.electionDetailsIpfs.set(IpfsHash.fromString(''));
    this.ballot.set({
      partial1: PartialBallot.fromBigInts([0n, 0n, 0n, 0n, 0n, 0n, 0n]).packed,
      partial2: PartialBallot.fromBigInts([0n, 0n, 0n, 0n, 0n, 0n, 0n]).packed,
    });
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
  castVote(vote: Ballot, mwt: Signature, authData: AuthShape) {
    const networkTime = this.network.timestamp.getAndRequireEquals();
    MWT.verify(mwt, authData).assertTrue();
    authData.exp.assertGreaterThan(networkTime);
    authData.scope.assertGreaterThan(0);

    const unpackedVote1 = PartialBallot.unpack(vote.partial1);
    const unpackedVote2 = PartialBallot.unpack(vote.partial2);

    let voteSum = UInt32.from(0);
    for (let i = 0; i < PartialBallot.l; i++) {
      voteSum = voteSum.add(unpackedVote1[i]);
    }
    for (let i = 0; i < PartialBallot.l; i++) {
      voteSum = voteSum.add(unpackedVote2[i]);
    }
    voteSum.assertEquals(UInt32.from(this.NUM_VOTES_ALLOWED)); //

    this.reducer.dispatch({
      ballot: vote,
    });
  }

  @method
  reduceVotes() {
    const ballot = this.ballot.getAndRequireEquals();
    const actionState = this.actionState.getAndRequireEquals();

    let pendingActions = this.reducer
      .getActions({
        fromActionState: actionState,
      })
      .slice(0, 3); // at most, reduce 3 actions

    let { state: newVotes, actionState: newActionState } = this.reducer.reduce(
      pendingActions,
      Ballot,
      (state: Ballot, _action: VoteAction) => {
        const unpackedState1 = PartialBallot.unpack(state.partial1);
        const unpackedState2 = PartialBallot.unpack(state.partial2);
        const unpackedAction1 = PartialBallot.unpack(_action.ballot.partial1);
        const unpackedAction2 = PartialBallot.unpack(_action.ballot.partial2);
        for (let i = 0; i < PartialBallot.l; i++) {
          unpackedState1[i] = unpackedState1[i].add(unpackedAction1[i]);
        }
        for (let i = 0; i < PartialBallot.l; i++) {
          unpackedState2[i] = unpackedState2[i].add(unpackedAction2[i]);
        }
        return {
          partial1: PartialBallot.fromUInt32s(unpackedState1).packed,
          partial2: PartialBallot.fromUInt32s(unpackedState2).packed,
        };
      },
      {
        state: ballot,
        actionState: actionState,
      }
    );

    this.ballot.set(newVotes);
    this.actionState.set(newActionState);
  }
}
