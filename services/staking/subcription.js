// @ts-check

const { PublicKey } = require('@solana/web3.js');
const { StakeProgramClient } = require('./program.js');

const { unpackStakeDepositEvent } = require('./events/stakeDepositEvent.js');
const { StakeEvent } = require('./event.js');
const { STAKE_CLAIM_EVENT, STAKE_INIT_EVENT, STAKE_UNSTAKE_EVENT } = require('./constant.js');
const { base64ToBytes } = require('./tools.js');
const { unpackStakeClaimEvent } = require('./events/stakeClaimEvent.js');
const { unpackStakeUnstakeEvent } = require('./events/stakeUnstakeEvent.js');

/**
 * @param {StakeProgramClient} client
 * @param {(event: StakeEvent) => Promise<void>} subscriberFn
 * @returns {() => void}
 */
function createStakeEventSubscription(client, subscriberFn) {
  const parseStakeEvent = createStakeEventParser(client);
  const clientSubscriptionId = client.connection.onLogs(
    client.programId,
    function (logs) {
      /** @type {StakeEvent|undefined} */
      let stakeEvent;
      try {
        stakeEvent = parseStakeEvent(logs);
      }
      catch (error) {
        console.error('Error processing StakeEvent', error);
        return;
      }
      if (stakeEvent instanceof StakeEvent) {
        subscriberFn(stakeEvent);
      }
      else {
        console.log('Unknown StakeEvent', logs);
      }
    },
  );
  return function () {
    client.connection.removeOnLogsListener(clientSubscriptionId);
  };
}

/**
 * @param {StakeProgramClient} client
 * @param {PublicKey} publisherPda
 * @param {(event: StakeEvent) => Promise<void>} subscriberFn
 * @returns {() => void}
 */
function createPublisherStakeEventSubscription(client, publisherPda, subscriberFn) {
  const parseStakeEvent = createStakeEventParser(client);
  const clientSubscriptionId = client.connection.onLogs(
    publisherPda,
    function (logs) {
      /** @type {StakeEvent|undefined} */
      let stakeEvent;
      try {
        stakeEvent = parseStakeEvent(logs);
      }
      catch (error) {
        console.error('Error processing StakeEvent', error);
        return;
      }
      if (stakeEvent instanceof StakeEvent) {
        subscriberFn(stakeEvent);
      }
    },
  );
  return function () {
    client.connection.removeOnLogsListener(clientSubscriptionId);
  };
}

/**
 * warning! this function walk form latest to earliest
 * todo: this function is not subscribtion, should be placed somewhere else
 *
 * @param {StakeProgramClient} client
 * @param {PublicKey} publisherPda
 * @param {string|null} earliestSignature
 * @param {string|null} latestSignature
 * @param {(event: StakeEvent) => Promise<void>} walkerFn
 * @returns {Promise<string|null>}
 */
async function walkHistoricalPublisherStakeEvents(client, publisherPda, latestSignature, earliestSignature, walkerFn) {
  const signatures = await client.connection.getSignaturesForAddress(publisherPda, {
    ...(latestSignature ? { before: latestSignature } : {}),
    ...(earliestSignature ? { until: earliestSignature } : {}),
  });

  console.info('Walking signatures', publisherPda.toBase58(), signatures.length, signatures);

  if (signatures.length === 0) {
    return earliestSignature;
  }

  const parseStakeEvent = createStakeEventParser(client);

  for (const signature of signatures) {
    const transaction = await client.connection.getTransaction(signature.signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 2,
    });

    /** @type {any} */
    const event = {
      signature: signature.signature,
      err: transaction?.meta?.err ?? null,
      logs: transaction?.meta?.logMessages ?? [],
    };

    /** @type {StakeEvent|undefined} */
    let stakeEvent;

    try {
      stakeEvent = parseStakeEvent(event);
    }
    catch (error) {
      console.error('Error processing StakeEvent', error);
      continue;
    }

    if (stakeEvent instanceof StakeEvent) {
      await walkerFn(stakeEvent);
    }
    else {
      console.log('Unknown StakeEvent', event);
    }
  }

  return await walkHistoricalPublisherStakeEvents(
    client,
    publisherPda,
    signatures[signatures.length - 1].signature,
    earliestSignature,
    walkerFn,
  );
}

/**
 * @param {StakeProgramClient} client
 * @returns {any}
 */
function createStakeEventParser(client) {
  return function (event) {
    const programId = client.programId.toBase58();
    
    let isStakeEvent = false;
    for (const log of event.logs) {
      if (log.includes(`Program ${programId} invoke`)) {
        isStakeEvent = true;
      }

      if (log.includes(`Program ${programId} success`)) {
        isStakeEvent = false;
      }

      if (!isStakeEvent) {
        continue;
      }

      if (!log.startsWith('Program data')) {
        continue;
      }

      const logData = log.split(': ')[1] ?? '';
      const u8as = logData
        .split(' ')
        .map(function (base64Data) {
          return base64ToBytes(base64Data);
        });

      const eventType = u8as[0]?.[0] ?? -1;
      
      if (eventType === -1) {
        continue;
      }
      

      /**
       * @param {StakeEvent} stakeEvent
       */
      const attachMetadata = function (stakeEvent) {
        stakeEvent.signature = event.signature;
        stakeEvent.programId = client.programId;
        stakeEvent.data = event;
      };

      if (eventType === STAKE_INIT_EVENT[0]) {
        const stakeEvent = unpackStakeDepositEvent(u8as);
        attachMetadata(stakeEvent);
        return stakeEvent;
      }

      if (eventType === STAKE_CLAIM_EVENT[0]) {
        const stakeEvent = unpackStakeClaimEvent(u8as);
        attachMetadata(stakeEvent);
        return stakeEvent;
      }
      

      if (eventType === STAKE_UNSTAKE_EVENT[0]) {
        const stakeEvent = unpackStakeUnstakeEvent(u8as);
        attachMetadata(stakeEvent);
        return stakeEvent;
      }
    }

    console.warn('StakeEvent Not Found', event);
  };
}

module.exports = {
    createStakeEventSubscription,
    createPublisherStakeEventSubscription,
    walkHistoricalPublisherStakeEvents,
    createStakeEventParser
}