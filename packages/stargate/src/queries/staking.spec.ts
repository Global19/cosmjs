/* eslint-disable @typescript-eslint/naming-convention */
import { coin, coins } from "@cosmjs/launchpad";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { adaptor34, Client as TendermintClient } from "@cosmjs/tendermint-rpc";
import { sleep } from "@cosmjs/utils";

import { MsgDelegate, MsgUndelegate } from "../codec/cosmos/staking/v1beta1/tx";
import { SigningStargateClient } from "../signingstargateclient";
import { assertIsBroadcastTxSuccess } from "../stargateclient";
import { faucet, pendingWithoutSimapp, simapp, simappEnabled, validator } from "../testutils.spec";
import { QueryClient } from "./queryclient";
import { setupStakingExtension, StakingExtension } from "./staking";

async function makeClientWithStaking(
  rpcUrl: string,
): Promise<[QueryClient & StakingExtension, TendermintClient]> {
  const tmClient = await TendermintClient.connect(rpcUrl, adaptor34);
  return [QueryClient.withExtensions(tmClient, setupStakingExtension), tmClient];
}

describe("StakingExtension", () => {
  const defaultFee = {
    amount: coins(25000, "ucosm"),
    gas: "1500000", // 1.5 million
  };

  beforeAll(async () => {
    if (simappEnabled()) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucet.mnemonic);
      const client = await SigningStargateClient.connectWithSigner(simapp.tendermintUrl, wallet);

      {
        const msg: MsgDelegate = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(25000, "ustake"),
        };
        const msgAny = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: msg,
        };
        const memo = "Test delegation for Stargate";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], defaultFee, memo);
        assertIsBroadcastTxSuccess(result);
      }
      {
        const msg: MsgUndelegate = {
          delegatorAddress: faucet.address0,
          validatorAddress: validator.validatorAddress,
          amount: coin(100, "ustake"),
        };
        const msgAny = {
          typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
          value: msg,
        };
        const memo = "Test undelegation for Stargate";
        const result = await client.signAndBroadcast(faucet.address0, [msgAny], defaultFee, memo);
        assertIsBroadcastTxSuccess(result);
      }

      await sleep(75); // wait until transactions are indexed
    }
  });

  describe("unverified", () => {
    describe("delegation", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.delegation(
          faucet.address0,
          validator.validatorAddress,
        );
        expect(response.delegationResponse).toBeDefined();
        expect(response.delegationResponse).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("delegatorDelegations", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.delegatorDelegations(faucet.address0);
        expect(response.delegationResponses).toBeDefined();
        expect(response.delegationResponses).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("delegatorUnbondingDelegations", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.delegatorUnbondingDelegations(faucet.address0);
        expect(response.unbondingResponses).toBeDefined();
        expect(response.unbondingResponses).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("delegatorValidator", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.delegatorValidator(
          faucet.address0,
          validator.validatorAddress,
        );
        expect(response.validator).toBeDefined();
        expect(response.validator).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("delegatorValidators", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.delegatorValidators(faucet.address0);
        expect(response.validators).toBeDefined();
        expect(response.validators).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("historicalInfo", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.historicalInfo(5);
        expect(response.hist).toBeDefined();
        expect(response.hist).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("params", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.params();
        expect(response.params).toBeDefined();
        expect(response.params).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("pool", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.pool();
        expect(response.pool).toBeDefined();
        expect(response.pool).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("redelegations", () => {
      it("works", async () => {
        // TODO: Set up a result for this test
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        await expectAsync(
          client.staking.unverified.redelegations(
            faucet.address0,
            validator.validatorAddress,
            validator.validatorAddress,
          ),
        ).toBeRejectedWithError(/redelegation not found/i);

        tmClient.disconnect();
      });
    });

    describe("unbondingDelegation", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.unbondingDelegation(
          faucet.address0,
          validator.validatorAddress,
        );
        expect(response.unbond).toBeDefined();
        expect(response.unbond).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("validator", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.validator(validator.validatorAddress);
        expect(response.validator).toBeDefined();
        expect(response.validator).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("validatorDelegations", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.validatorDelegations(validator.validatorAddress);
        expect(response.delegationResponses).toBeDefined();
        expect(response.delegationResponses).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("validators", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.validators("BOND_STATUS_BONDED");
        expect(response.validators).toBeDefined();
        expect(response.validators).not.toBeNull();

        tmClient.disconnect();
      });
    });

    describe("validatorUnbondingDelegations", () => {
      it("works", async () => {
        pendingWithoutSimapp();
        const [client, tmClient] = await makeClientWithStaking(simapp.tendermintUrl);

        const response = await client.staking.unverified.validatorUnbondingDelegations(
          validator.validatorAddress,
        );
        expect(response.unbondingResponses).toBeDefined();
        expect(response.unbondingResponses).not.toBeNull();

        tmClient.disconnect();
      });
    });
  });
});
