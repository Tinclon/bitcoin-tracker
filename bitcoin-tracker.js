"use strict";

import chalk from 'chalk';
import fetch from 'node-fetch';

import wallets from "./wallets/wallets.js"
// Wallets are of this form:
// export default {
//     "A": {
//         "addresses": [
//             "bc1q6xhy3rn09hkrqhzlxqgc40cetutes530axtvda",
//             "bc1q8cnuhluv6sa3fr9h7k0htfqmyctdsl8xwmnfa2",
//             "bc1qgk4l74uef9aayc3rt69gh2gj4sf8grafmpcvxw",
//             "bc1q0vmp5a4alp0dz287wrgz9uspwdt398hhxpr8ua",
//             "bc1qcxfk4g3mcgs0hvh4qazw24ykvtv4fq6teqmq5p",
//             "bc1qz8wv4a35l6wpk69wuwgcwzgayeyr4t7lx7vaqx",
//             "bc1qyuyc6yvtpfex3t4whgzrw6lcfxfe8625t43a3z",
//         ]
//     },

(async () => {

    const delay = (delay_ms) => new Promise((_) => setTimeout(_, delay_ms));

    let numAddresses = 0;
    let fetchedAddresses = 0;
    for (const wallet in wallets) {
        numAddresses += wallets[wallet].addresses.length;
    }

    for (const wallet in wallets) {
        const promises = wallets[wallet].addresses.map(address =>
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
                .then(balance => balance / 100000000));

        wallets[wallet].total = (await Promise.all(promises)).reduce((acc, cur) => acc + cur, 0)

        await delay(100);
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




