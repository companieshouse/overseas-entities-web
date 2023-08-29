import * as crypto from 'crypto';

export function encode(input: string): string {

  const salt = 'ks734s_sdgOc4£b2'; // would load this from env variable

  const combinedString = input + salt;

  const sha1Hash = crypto.createHash('sha1').update(combinedString).digest('hex');

  const base64Encoded = Buffer.from(sha1Hash, 'hex').toString('base64');

  return base64Encoded.replace(/=+$/, '');
}
