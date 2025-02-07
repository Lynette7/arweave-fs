const Arweave = require('arweave');
const fs = require('fs');

// Initialize Arweave
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

async function uploadFile(walletPath, filePath) {
    try {
        // Read the wallet key file
        const wallet = JSON.parse(fs.readFileSync(walletPath));
        
        // Read the file data
        const fileData = fs.readFileSync(filePath);
        
        // Create transaction
        const transaction = await arweave.createTransaction({
            data: fileData
        }, wallet);
        
        // Add tags if needed
        transaction.addTag('Content-Type', 'application/json');
        transaction.addTag('Upload-Date', new Date().toISOString());
        
        // Sign transaction
        await arweave.transactions.sign(transaction, wallet);
        
        // Submit the transaction
        const response = await arweave.transactions.post(transaction);
        
        if (response.status === 200) {
            console.log('File uploaded successfully!');
            console.log('Transaction ID:', transaction.id);
            console.log('You can view your file at:', `https://arweave.net/${transaction.id}`);
            
            // Get transaction price in AR
            const winston = transaction.reward;
            const ar = arweave.ar.winstonToAr(winston);
            console.log('Transaction cost:', ar, 'AR');
        } else {
            console.error('Upload failed:', response.statusText);
        }
        
        return transaction.id;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

async function main() {
    const walletPath = './wallet.json';
    const filePath = './api.json';
    
    try {
        const txId = await uploadFile(walletPath, filePath);
        console.log('Upload process completed');
    } catch (error) {
        console.error('Main process error:', error);
    }
}

main();