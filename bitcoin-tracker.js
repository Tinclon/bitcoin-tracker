"use strict";

import chalk from 'chalk';
import fetch from 'node-fetch';

import wallets from "./wallets/wallets.js"
// Wallets are of this form:
// export default {
//     "A": {
//         "addresses": [
//             "bc1qtq2my0lz6425ch7jnahtnvxa2uhns0a4jnc96z",
//             "bc1qkzqhuwsuzrw2pyuchw3czwff94vj2q5und9qp6",
//             "bc1qskr0vz624f267ywm4jms2pd3n67dj7d6cyry48",
//             "bc1qedee3qm47wmej29e9vwrj2rg02pfh5wzsu680c",
//             "bc1qg68j4pjg5knye0zuy7g0yk9ap4evcmdpzndmps",
//             "bc1qhkz0utxq7gr0ql0ya6m33c53zgxtzqwt8dlmph",
//             "bc1q86lw5n9m2fut86aqy6ltghdnuandatze32qrxl",
//         ]
//     },

(async () => {

    const delayPromise = (delay_ms) => new Promise(_ => setTimeout(_, delay_ms));
    const delayFunction = (delay_ms) => value => new Promise(resolve => setTimeout(() => resolve(value), delay_ms));

    let numAddresses = 0;
    let fetchedAddresses = 0;
    for (const wallet in wallets) {
        numAddresses += wallets[wallet].addresses.length;
    }

    for (const wallet in wallets) {
        const promises = wallets[wallet].addresses.map((address, index) => Promise.resolve()
            .then(delayFunction(1000 * index)).then(() =>
                fetch(`https://blockstream.info/api/address/${address}`)
                    .then(response => {
                        if (response.status !== 200) {
                            console.error(response.status);
                            ++fetchedAddresses;
                            return {chain_stats: {funded_txo_sum: 0, spent_txo_sum: 0}};
                        }
                        console.error(`Retrieved ${++fetchedAddresses} of ${numAddresses}`);
                        return response.json()
                    })
                    .then(json => json.chain_stats.funded_txo_sum - json.chain_stats.spent_txo_sum)
                    .then(balance => balance / 100000000)));

        wallets[wallet].total = (await Promise.all(promises)).reduce((acc, cur) => acc + cur, 0)

        await delayPromise(1000);
    }

    console.error();
    let total = 0;
    for (const wallet in wallets) {
        console.error(chalk.green(`${wallet}: ₿`), wallets[wallet].total);
        total += wallets[wallet].total;
    }

    console.error();
    console.error(chalk.blue.bold("Total: ₿"), total);
    console.error();
})();
