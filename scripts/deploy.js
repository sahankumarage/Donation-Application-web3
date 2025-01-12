const { ethers } = require("hardhat");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("\nDeploying contract with account:", deployer.address);

    // Deploy contract
    const Donation = await ethers.getContractFactory("Donation");
    const donation = await Donation.deploy();
    await donation.waitForDeployment();
    const contractAddress = await donation.getAddress();
    console.log("Contract deployed to:", contractAddress);

    while (true) {
        console.log("\n=== Donation Contract Menu ===");
        console.log("1. Make a donation");
        console.log("2. Check contract balance");
        console.log("3. Check donor's total donations");
        console.log("4. Withdraw funds");
        console.log("5. Exit");

        const choice = await question("\nEnter your choice (1-5): ");

        try {
            switch (choice) {
                case '1':
                    const amount = await question("Enter donation amount in ETH: ");
                    const message = await question("Enter donation message: ");
                    
                    const tx = await donation.donate(message, {
                        value: ethers.parseEther(amount)
                    });
                    console.log("Waiting for transaction confirmation...");
                    await tx.wait();
                    console.log(`Donation of ${amount} ETH sent successfully!`);
                    console.log("Transaction hash:", tx.hash);
                    break;

                case '2':
                    const balance = await donation.getContractBalance();
                    console.log("Contract balance:", ethers.formatEther(balance), "ETH");
                    break;

                case '3':
                    const donorAddress = await question("Enter donor address to check: ");
                    const donationAmount = await donation.donations(donorAddress);
                    console.log("Total donations:", ethers.formatEther(donationAmount), "ETH");
                    break;

                case '4':
                    const recipientAddress = await question("Enter recipient address: ");
                    const withdrawAmount = await question("Enter withdrawal amount in ETH: ");
                    
                    const withdrawTx = await donation.withdrawFunds(
                        recipientAddress,
                        ethers.parseEther(withdrawAmount)
                    );
                    console.log("Waiting for withdrawal confirmation...");
                    await withdrawTx.wait();
                    console.log(`Successfully withdrawn ${withdrawAmount} ETH to ${recipientAddress}`);
                    console.log("Transaction hash:", withdrawTx.hash);
                    break;

                case '5':
                    console.log("Exiting program...");
                    rl.close();
                    return;

                default:
                    console.log("Invalid choice. Please try again.");
            }
        } catch (error) {
            console.error("\nError:", error.message);
            if (error.data) {
                console.error("Contract error message:", error.data.message);
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
        rl.close();
    });