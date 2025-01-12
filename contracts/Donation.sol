// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Donation {
    // Event for logging donations
    event DonationReceived(address indexed donor, uint256 amount, string message);

    // Mapping to track total donations by each address
    mapping(address => uint256) public donations;

    // Function to receive donations
    function donate(string memory message) public payable {
        require(msg.value > 0, "Donation must be greater than 0");

        // Update donor's total donations
        donations[msg.sender] += msg.value;

        // Emit event for donation
        emit DonationReceived(msg.sender, msg.value, message);
    }

    // Function to check the contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Function to withdraw funds by the contract owner
    function withdrawFunds(address payable recipient, uint256 amount) public {
        require(amount <= address(this).balance, "Insufficient balance in contract");
        recipient.transfer(amount);
    }
}