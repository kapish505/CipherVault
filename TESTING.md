# Quick Test Guide

## Testing the Wallet Switcher

1. **Open http://localhost:3000 in your browser**

2. **Check the top right navbar** - You should see either:
   - "Connect Wallet" button (if not connected)
   - Your wallet address with a dropdown arrow (if connected)

3. **Test the functionality**:
   - Click "Connect Wallet" → MetaMask should open
   - After connecting, click on your wallet address
   - A dropdown should appear showing:
     - Your current wallet (with checkmark)
     - "Add Another Wallet" button
     - "Disconnect" button

4. **Test multi-wallet**:
   - Click "Add Another Wallet"
   - Connect a different account in MetaMask
   - Both wallets should now appear in the dropdown
   - Click any wallet to switch between them

## Overlay Issue Fix

The sticky features bar has been removed to fix the overlay issue. The page should now scroll normally without content being hidden behind the features bar.

## If Issues Persist

Check browser console (F12) for errors and share:
- Screenshot of the navbar area
- Any console error messages
- What happens when you click the wallet button
