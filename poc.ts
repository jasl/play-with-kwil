import { Utils as KwilUtils } from "npm:@kwilteam/kwil-js";

const dbOwnerAddress = "0x5BaD959d0AA3DFA44131F61E39192E475c3fBF29"
const dbName = "playground"
const dbid = KwilUtils.generateDBID(dbOwnerAddress, dbName);
console.log(`DBID: ${dbid}`);

import { Wallet } from 'npm:ethers';
import { KwilSigner } from 'npm:@kwilteam/kwil-js';

const dbOwnerEthPrivateKey = "c71d41fa79464fa467aee3f56436b366baa2e738d07808b6cbf1219f43152a61";
const dbOwnerEthSigner = new Wallet(dbOwnerEthPrivateKey);
const dbOwnerEthAddress = await dbOwnerEthSigner.getAddress();
// Kwil will use the address as `@caller`, KEEP IN MIND: THE FORM HAS CHECKSUM AND KWIL IS CASE SENSITIVE !!!
const dbOwnerKwilSigner = new KwilSigner(dbOwnerEthSigner, dbOwnerEthAddress);
console.log(`DB owner ETH address ${dbOwnerEthAddress}`);

const deviceEthPrivateKey = "415ac5b1b9c3742f85f2536b1eb60a03bf64a590ea896b087182f9c92f41ea12";
const deviceEthSigner = new Wallet(deviceEthPrivateKey);
const deviceEthAddress = await deviceEthSigner.getAddress();
// Kwil will use the address as `@caller`, KEEP IN MIND: THE FORM HAS CHECKSUM AND KWIL IS CASE SENSITIVE !!!
const deviceKwilSigner = new KwilSigner(deviceEthSigner, deviceEthAddress);
console.log(`Device ETH address ${deviceEthAddress}`);

const userEthPrivateKey = "9486cea3362297cb21ef0a469d25fb4b4c492402b96e6aa106016f6b38781587";
const userEthSigner = new Wallet(userEthPrivateKey);
const userEthAddress = await userEthSigner.getAddress();
// Kwil will use the address as `@caller`, KEEP IN MIND: THE FORM HAS CHECKSUM AND KWIL IS CASE SENSITIVE !!!
const userKwilSigner = new KwilSigner(userEthSigner, userEthAddress);
console.log(`User ETH address ${userEthAddress}`);


import { WebKwil } from 'npm:@kwilteam/kwil-js';

const kwil = new WebKwil({
    kwilProvider: "http://localhost:8080",
    chainId: "kwil-chain-tmp",
    unconfirmedNonce: true,
});

async function createACL(signer: KwilSigner, subject: string, target: string, readLevel: number, writeLevel: number) {
    const result = await kwil.execute({
        dbid,
        action: "create_acl",
        inputs: [
            {
                $subject: subject,
                $target: target,
                $read_level: readLevel,
                $write_level: writeLevel,
            }
        ]
    }, signer, true);

    return result;
}

async function readACL(subject: string, target: string) {
    const result = await kwil.call({
        dbid,
        action: "read_acl",
        inputs: [
            {
                $subject: subject,
                $target: target,
            }
        ]
    });

    return result;
}

async function createReport(signer: KwilSigner, content: string, createdAt: number) {
    const result = await kwil.execute({
        dbid,
        action: "create_report",
        inputs: [
            {
                $content: content,
                $created_at: createdAt,
            }
        ]
    }, signer, true);

    return result;
}

async function readReports(signer: KwilSigner, did: string, created_at_after: number, limit: number) {
    const result = await kwil.call({
        dbid,
        action: "read_reports",
        inputs: [
            {
                $did: did,
                $created_at_after: created_at_after,
                $limit: limit,
            }
        ]
    }, signer);

    return result;
}

import { sleep } from "https://deno.land/x/sleep/mod.ts"

let result;

// Grant permissions

console.log(`Granting device ${deviceEthAddress} to write reports table permission`);
result = await createACL(dbOwnerKwilSigner, deviceEthAddress, "reports", 0, 1);
console.log(result);

// await sleep(6); // Need to wait insertions in-block

console.log(`Granting user ${userEthAddress} to read ${deviceEthAddress} reports permission`);
result = await createACL(dbOwnerKwilSigner, userEthAddress, deviceEthAddress, 1, 0);
console.log(result);

// await sleep(6); // Need to wait insertions in-block

result = await readACL(deviceEthAddress, "reports");
console.log(result);

result = await readACL(userEthAddress, deviceEthAddress);
console.log(result);

// Create reports

console.log(`Device ${deviceEthAddress} creating a report`);
result = await createReport(deviceKwilSigner, (new Date()).toISOString(), Math.trunc(Date.now() / 1000));
console.log(result);

// await sleep(6); // Need to wait insertions in-block

result = await readReports(userKwilSigner, deviceEthAddress, 0, 10);
console.log(result);

// Read device reports with the db owner identity, this will not get any result
console.log("Read device reports with the db owner identity, this will not get any result, and expect an error")
try {
    result = await readReports(dbOwnerKwilSigner, deviceEthAddress, 0, 10);
    console.log(result);
} catch (ex) {
    console.error(ex.message);
}
