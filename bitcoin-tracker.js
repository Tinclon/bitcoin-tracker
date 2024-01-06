"use strict";

import chalk from 'chalk';
import fetch from 'node-fetch';

(async () => {
    const wallets = {
        "Satoshi": {
            "addresses": [
                "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                "12cbQLTFMXRnSzktFkuoG3eHoMeFtpTu3S",
                "12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX",
                "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",
                "1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR",
                "15ubicBBWFnvoZLT7GiU2qxjRaKJPdkDMG",
                "1JfbZRwdDHKZmuiZgYArJZhcuuzuw2HuMu",
                "1GkQmKAmHtNfnD3LHhTkewJxKHVSta4m2a",
                "16LoW7y83wtawMg5XmT4M3Q7EdjjUmenjM",
                "1J6PYEzr4CUoGbnXrELyHszoTSz3wCsCaj",
            ],
        },
    };

    const delay = (delay_ms) => new Promise((_) => setTimeout(_, delay_ms));

    for (const wallet in wallets) {
        const promises = wallets[wallet].addresses.map(address =>
            fetch(`https://blockstream.info/api/address/${address}`)
                .then(response => {
                    if (response.status !== 200) {
                        console.error(response.status);
                        return {chain_stats: {funded_txo_sum: 0, spent_txo_sum: 0}};
                    }
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




