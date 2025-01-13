import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DonationABI from './Donation.json';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [userDonations, setUserDonations] = useState('0');

  const contractAddress = '0xDF223Ef8Bbb075ab783e74e28A375A9fF0C679F1';

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          setAccount(accounts[0]);

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const donationContract = new ethers.Contract(contractAddress, DonationABI.abi, signer);
          setContract(donationContract);

          // Get initial contract balance
          const balance = await donationContract.getContractBalance();
          setBalance(ethers.utils.formatEther(balance));

          // Get user's total donations
          const userDonation = await donationContract.donations(accounts[0]);
          setUserDonations(ethers.utils.formatEther(userDonation));
        } catch (error) {
          console.error('Error initializing:', error);
        }
      }
    };

    init();
  }, []);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!contract || !amount || !message) return;

    try {
      setLoading(true);
      const tx = await contract.donate(message, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();

      // Update balances
      const newBalance = await contract.getContractBalance();
      setBalance(ethers.utils.formatEther(newBalance));

      const userDonation = await contract.donations(account);
      setUserDonations(ethers.utils.formatEther(userDonation));

      setAmount('');
      setMessage('');
      alert('Thank you for your donation!');
    } catch (error) {
      console.error('Error donating:', error);
      alert('Error making donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!contract || !withdrawAmount || !recipientAddress) return;

    try {
      setLoading(true);
      const tx = await contract.withdrawFunds(
        recipientAddress,
        ethers.utils.parseEther(withdrawAmount),
      );
      await tx.wait();

      // Update contract balance
      const newBalance = await contract.getContractBalance();
      setBalance(ethers.utils.formatEther(newBalance));

      setWithdrawAmount('');
      setRecipientAddress('');
      alert('Withdrawal successful!');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Error withdrawing funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h3" align="center" gutterBottom>
        Donation Platform
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        Contract Balance: {balance} ETH
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        Connected Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        Your Total Donations: {userDonations} ETH
      </Typography>

      <Grid container spacing={4} marginTop={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Make a Donation
              </Typography>
              <TextField
                label="Amount (ETH)"
                type="number"
                fullWidth
                margin="normal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <TextField
                label="Message"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleDonate}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Donate'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Withdraw Funds
              </Typography>
              <TextField
                label="Recipient Address"
                fullWidth
                margin="normal"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <TextField
                label="Amount (ETH)"
                type="number"
                fullWidth
                margin="normal"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleWithdraw}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Withdraw'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
