// @ts-check

const { Buffer } = require('buffer');

const { PublicKey } = require('@solana/web3.js');


/**
 * @param {string} base64
 * @returns {Uint8Array}
 */
function base64ToBytes(base64) {
  if (typeof atob !== 'undefined') {
    return new Uint8Array(
      atob(base64)
        .split('')
        .map(function (char) {
          return char.charCodeAt(0);
        })
    );
  }
  else if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  else {
    throw new Error('Unsupported environment');
  }
}


/**
 * @param {Uint8Array} u8a
 * @returns {string}
 */
function u8aToHex(u8a) {
  return Array
    .from(u8a)
    .map(function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
}

/**
 * @param {Uint8Array} u8a
 * @returns
 */
function interpretU8a(u8a) {
  if (u8a.length === 1) {
    return `u8:${u8a[0]}`;
  }

  const data = new DataView(u8a.buffer);

  if (u8a.length === 4) {
    const i32 = data.getInt32(0, true);
    const u32 = data.getUint32(0, true);
    return `i32:${i32}/u32:${u32}`;
  }

  if (u8a.length === 8) {
    const i64 = data.getBigInt64(0, true);
    const u64 = data.getBigUint64(0, true);
    return `i64:${i64}/u64:${u64}`;
  }

  if (u8a.length === 32) {
    const pubkey = new PublicKey(u8a);
    return `b58:${pubkey.toBase58()}`;
  }

  const hex = `b16:${u8aToHex(u8a)}`;

  return hex;
}

/**
 * @param {Uint8Array} src
 * @param {Uint8Array} dst
 * @param {number} offset
 * @returns {Uint8Array}
 */
function copyU8a(src, dst, offset) {
  if (!(src instanceof Uint8Array)) {
    throw new TypeError('Source must be a Uint8Array');
  }

  if (!(dst instanceof Uint8Array)) {
    throw new TypeError('Destination must be a Uint8Array');
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new TypeError('Offset must be a non-negative integer');
  }

  const start = offset;
  const end = offset + src.length;

  if (end > dst.length) {
    throw new Error('Destination is too small');
  }

  const subDst = dst.subarray(start, end);

  for (let index = 0; index < src.length; index++) {
    subDst[index] = src[index];
  }

  return dst;
}

/**
 * @param {Uint8Array} u8a
 */
function u8aToDate(u8a) {
  const data = new DataView(u8a.buffer);
  const time = data.getBigInt64(0, true);
  const date = new Date(Number(time) * 1000);
  return date;
}

/**
 * @param {Date} date
 * @returns {bigint}
 */
function dateToUnix(date) {
  const unixMillis = date.getTime();
  const unixSeconds = Math.floor(unixMillis / 1000);
  const unixSecondsBigInt = BigInt(unixSeconds);
  return unixSecondsBigInt;
}

/**
 * @param {Uint8Array} u8a
 * @returns {bigint}
 */
function u8aLeToBigInt(u8a) {
  const data = new DataView(u8a.buffer);
  const value = data.getBigUint64(0, true);
  return value;
}

/**
 * @template T
 * @param {new () => T} classConstructor
 * @param {Partial<T>} data
 * @returns {T}
 */
function create(classConstructor, data) {
  /** @type {any} */
  const instance = new classConstructor();
  for (const key of Object.keys(data)) {
    // @ts-ignore
    instance[key] = data[key];
  }
  return instance;
}

module.exports = {
    base64ToBytes,
    u8aToHex,
    interpretU8a,
    copyU8a,
    u8aToDate,
    dateToUnix,
    u8aLeToBigInt,
    create
}
