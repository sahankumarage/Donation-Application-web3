const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Donation Contract", function () {
  let donation;
  let owner;
  let donor1;
  let donor2;
  const oneEther = ethers.parseEther("1.0");
  const halfEther = ethers.parseEther("0.5");

  beforeEach(async function () {
    // Get signers
    [owner, donor1, donor2] = await ethers.getSigners();

    // Deploy contract
    const Donation = await ethers.getContractFactory("Donation");
    donation = await Donation.deploy();
    await donation.waitForDeployment();
  });

  describe("Donations", function () {
    it("Should accept donations and log them correctly", async function () {
      // Make a donation
      await donation.connect(donor1).donate("First donation!", {
        value: oneEther
      });

      // Check donation was logged
      const donationAmount = await donation.donations(donor1.address);
      expect(donationAmount).to.equal(oneEther);
    });

    it("Should handle multiple donations from the same donor", async function () {
      // Make multiple donations
      await donation.connect(donor1).donate("First donation!", {
        value: oneEther
      });
      await donation.connect(donor1).donate("Second donation!", {
        value: halfEther
      });

      // Check total donation amount
      const totalDonation = await donation.donations(donor1.address);
      expect(totalDonation).to.equal(ethers.parseEther("1.5"));
    });

    it("Should emit event on donation", async function () {
      // Check if event is emitted
      await expect(
        donation.connect(donor1).donate("Thank you!", {
          value: oneEther
        })
      )
        .to.emit(donation, "NewDonation")
        .withArgs(donor1.address, oneEther, "Thank you!");
    });

    it("Should reject donations of 0 ETH", async function () {
      // Try to donate 0 ETH
      await expect(
        donation.connect(donor1).donate("Zero donation", {
          value: 0
        })
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });

    it("Should track total donations correctly", async function () {
      // Make donations from multiple donors
      await donation.connect(donor1).donate("First donor", {
        value: oneEther
      });
      await donation.connect(donor2).donate("Second donor", {
        value: halfEther
      });

      // Check total donations
      const totalDonations = await donation.getTotalDonations();
      expect(totalDonations).to.equal(ethers.parseEther("1.5"));
    });

    it("Should allow retrieving donation history", async function () {
      // Make a donation
      await donation.connect(donor1).donate("Test message", {
        value: oneEther
      });

      // Get donation history
      const history = await donation.getDonationHistory(donor1.address);
      expect(history.length).to.equal(1);
      expect(history[0].amount).to.equal(oneEther);
      expect(history[0].message).to.equal("Test message");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow owner to withdraw funds", async function () {
      // Make a donation first
      await donation.connect(donor1).donate("For withdrawal", {
        value: oneEther
      });

      // Check owner's balance before withdrawal
      const beforeBalance = await ethers.provider.getBalance(owner.address);

      // Withdraw funds
      await donation.connect(owner).withdraw();

      // Check owner's balance after withdrawal
      const afterBalance = await ethers.provider.getBalance(owner.address);
      expect(afterBalance).to.be.gt(beforeBalance);
    });

    it("Should prevent non-owners from withdrawing", async function () {
      await donation.connect(donor1).donate("For withdrawal", {
        value: oneEther
      });

      // Try to withdraw as non-owner
      await expect(
        donation.connect(donor1).withdraw()
      ).to.be.revertedWith("Only owner can withdraw");
    });
  });
});