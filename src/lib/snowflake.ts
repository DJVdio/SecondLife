// 雪花漂移 ID 生成器
// 自定义纪元: 2025-01-01T00:00:00Z
const EPOCH = 1735689600000n;
const WORKER_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n;

let lastTimestamp = -1n;
let sequence = 0n;
const workerId = BigInt(Math.floor(Math.random() * 1024));

export function generateSnowflakeId(): string {
  let timestamp = BigInt(Date.now());

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & MAX_SEQUENCE;
    if (sequence === 0n) {
      while (timestamp <= lastTimestamp) {
        timestamp = BigInt(Date.now());
      }
    }
  } else {
    sequence = 0n;
  }

  lastTimestamp = timestamp;

  const id =
    ((timestamp - EPOCH) << (WORKER_ID_BITS + SEQUENCE_BITS)) |
    (workerId << SEQUENCE_BITS) |
    sequence;

  return id.toString();
}
