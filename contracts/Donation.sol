// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Donation {
    
    event DonationReceived(address indexed donor, uint256 amount, string message);

    
    mapping(address => uint256) public donations;

    
    function donate(string memory message) public payable {
        require(msg.value > 0, "Donation must be greater than 0");

        
        donations[msg.sender] += msg.value;

        
        emit DonationReceived(msg.sender, msg.value, message);
    }

    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    
    function withdrawFunds(address payable recipient, uint256 amount) public {
        require(amount <= address(this).balance, "Insufficient balance in contract");
        recipient.transfer(amount);
    }
}