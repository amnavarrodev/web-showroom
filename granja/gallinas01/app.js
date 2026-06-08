// ==================== CONFIGURACIÓN ====================
const CONTRACT_ADDRESS = '0xf0780cce0e9cf04dff9ec2e2b5381a3b750b6153';

const BSC_TESTNET = {
    chainId: '0x61',
    chainName: 'BNB Smart Chain Testnet',
    rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    blockExplorerUrls: ['https://testnet.bscscan.com']
};
const EXPLORER_URL = 'https://testnet.bscscan.com';

// ==================== ESTADO ====================
let provider, signer, userAddress, contract, pollingInterval;
let isCorrectNetwork = false;
let readOnlyContract = null; // Para leer sin wallet conectada

// ==================== UTILIDADES ====================
const $ = (id) => document.getElementById(id);

function formatNumber(num) {
    if (typeof num === 'object' && num._isBigNumber) num = num.toNumber();
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K';
    return ethers.utils.commify(Math.floor(num).toString());
}

function showToast(message) {
    $('copiedToast').textContent = message;
    $('copiedToast').classList.add('show');
    setTimeout(() => $('copiedToast').classList.remove('show'), 2000);
}

function showTx(hash) {
    $('txLog').style.display = 'block';
    $('txHash').innerHTML = `Tx: <strong>${hash.substring(0, 20)}...</strong>`;
    $('explorerLink').href = `${EXPLORER_URL}/tx/${hash}`;
}

// ==================== LECTURA PÚBLICA (sin wallet) ====================
async function checkInitializedPublic() {
    try {
        // Crear un provider público para solo lectura
        const publicProvider = new ethers.providers.JsonRpcProvider(BSC_TESTNET.rpcUrls[0]);
        const publicContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, publicProvider);
        const init = await publicContract.initialized();
        
        $('initialized').textContent = init ? '✅ Sí' : '❌ No';
        
        // Mostrar u ocultar el aviso de inauguración
        $('initNotice').style.display = init ? 'none' : 'block';
        
        // También leer el balance del contrato
        const bal = await publicProvider.getBalance(CONTRACT_ADDRESS);
        $('contractBalance').textContent = parseFloat(ethers.utils.formatEther(bal)).toFixed(4);
        
        // Leer marketEggs
        const mEggs = await publicContract.marketEggs();
        $('marketEggs').textContent = formatNumber(mEggs);
        
        if (init && bal.gt(0)) {
            const price = await publicContract.calculateEggBuySimple(ethers.utils.parseEther('0.01'));
            $('pricePerBnb').textContent = formatNumber(price);
        }
        
        return init;
    } catch (e) {
        console.error('Error lectura pública:', e);
        return false;
    }
}

// ==================== CONEXIÓN ====================
async function checkNetwork() {
    if (!window.ethereum) return false;
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        isCorrectNetwork = (chainId === BSC_TESTNET.chainId);
        $('networkName').textContent = isCorrectNetwork ? '🔶 BSC Testnet' : '❌ Red incorrecta';
        $('networkWarning').style.display = isCorrectNetwork ? 'none' : 'block';
        return isCorrectNetwork;
    } catch (e) { return false; }
}

async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BSC_TESTNET.chainId }]
        });
    } catch (e) {
        if (e.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [BSC_TESTNET]
            });
        }
    }
}

async function connectWallet() {
    if (!window.ethereum) return alert('Instala MetaMask para continuar.');
    
    const ok = await checkNetwork();
    if (!ok) {
        await switchNetwork();
        await checkNetwork();
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    $('walletAddress').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
    
    if (pollingInterval) clearInterval(pollingInterval);
    refreshData();
    pollingInterval = setInterval(refreshData, 8000);
    
    // Eventos de MetaMask
    window.ethereum.on('accountsChanged', (acc) => {
        if (acc.length === 0) {
            userAddress = null;
            contract = null;
            $('walletAddress').textContent = 'No conectada';
            $('referralBox').style.display = 'none';
        } else {
            userAddress = acc[0];
            $('walletAddress').textContent = `${acc[0].substring(0, 6)}...${acc[0].substring(38)}`;
            contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
            refreshData();
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        checkNetwork();
        if (isCorrectNetwork) {
            contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
            refreshData();
        }
    });
}

// ==================== REFRESCO DE DATOS ====================
async function refreshData() {
    if (!contract || !userAddress || !isCorrectNetwork) return;
    
    try {
        // Balance del usuario
        const balance = await provider.getBalance(userAddress);
        $('balanceBNB').textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
        
        // Balance del contrato
        const contractBal = await contract.getBalance();
        $('contractBalance').textContent = parseFloat(ethers.utils.formatEther(contractBal)).toFixed(4);
        
        // Market eggs
        const mEggs = await contract.marketEggs();
        $('marketEggs').textContent = formatNumber(mEggs);
        
        // Inicializado
        const init = await contract.initialized();
        $('initialized').textContent = init ? '✅ Sí' : '❌ No';
        $('initNotice').style.display = init ? 'none' : 'block';
        
        // Precio
        if (init && contractBal.gt(0)) {
            const price = await contract.calculateEggBuySimple(ethers.utils.parseEther('0.01'));
            $('pricePerBnb').textContent = formatNumber(price);
        }
        
        // Mis gallinas
        const miners = await contract.getMyMiners();
        $('myMiners').textContent = formatNumber(miners);
        
        // Mis huevos
        const eggs = await contract.getMyEggs();
        $('myEggs').textContent = formatNumber(eggs);
        
        // Mi referidor
        const ref = await contract.referrals(userAddress);
        if (ref === '0x0000000000000000000000000000000000000000') {
            $('myReferral').textContent = 'Ninguno';
        } else {
            $('myReferral').textContent = `${ref.substring(0, 6)}...${ref.substring(38)}`;
        }
        
        // Estimación de venta
        if (eggs.gt(0)) {
            const sellVal = await contract.calculateEggSell(eggs);
            const afterFee = parseFloat(ethers.utils.formatEther(sellVal)) * 0.95;
            $('sellPreview').style.display = 'block';
            $('sellPreviewAmount').textContent = `${afterFee.toFixed(6)} tBNB`;
            $('eggValueEstimate').textContent = `≈ ${afterFee.toFixed(6)} tBNB`;
        } else {
            $('sellPreview').style.display = 'none';
            $('eggValueEstimate').textContent = '';
        }
        
        // Estimación de compra
        const buyVal = parseFloat($('buyAmount').value);
        if (buyVal > 0) {
            const eb = await contract.calculateEggBuySimple(ethers.utils.parseEther($('buyAmount').value));
            const netEggs = eb.sub(eb.mul(5).div(100));
            const newMiners = netEggs.div(2592000);
            $('buyEstimate').textContent = `≈ ${formatNumber(netEggs)} huevos → +${formatNumber(newMiners)} gallinas`;
        } else {
            $('buyEstimate').textContent = '';
        }
        
        // Estimación de incubación
        if (eggs.gt(0)) {
            const newMiners = eggs.div(2592000);
            $('hatchEstimate').textContent = `Usarás ${formatNumber(eggs)} huevos → +${formatNumber(newMiners)} gallinas (el resto se pierde)`;
        } else {
            $('hatchEstimate').textContent = '';
        }
        
        // Enlace de referido
        $('referralBox').style.display = 'block';
        $('referralLink').textContent = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;
        
    } catch (e) {
        console.error('Error refrescando:', e);
    }
}

// ==================== ACCIONES ====================
function getRefAddress() {
    const input = $('refAddress').value.trim();
    if (input && ethers.utils.isAddress(input)) return input;
    return '0x0000000000000000000000000000000000000000';
}

async function buyAction() {
    if (!contract) return alert('Conecta tu wallet.');
    const val = $('buyAmount').value;
    if (isNaN(val) || val <= 0) return alert('Cantidad inválida.');
    
    try {
        const ref = getRefAddress();
        const tx = await contract.buyEggs(ref, { value: ethers.utils.parseEther(val) });
        showTx(tx.hash);
        $('buyBtn').disabled = true;
        await tx.wait();
        $('buyBtn').disabled = false;
        refreshData();
    } catch (e) {
        console.error(e);
        $('buyBtn').disabled = false;
        alert('Error en compra. ¿tBNB suficiente?');
    }
}

async function hatchAction() {
    if (!contract) return alert('Conecta tu wallet.');
    
    try {
        const ref = getRefAddress();
        const tx = await contract.hatchEggs(ref);
        showTx(tx.hash);
        $('hatchBtn').disabled = true;
        await tx.wait();
        $('hatchBtn').disabled = false;
        refreshData();
    } catch (e) {
        console.error(e);
        $('hatchBtn').disabled = false;
        alert('Error al criar. ¿Tienes huevos suficientes?');
    }
}

async function sellAction() {
    if (!contract) return alert('Conecta tu wallet.');
    
    try {
        const tx = await contract.sellEggs();
        showTx(tx.hash);
        $('sellBtn').disabled = true;
        await tx.wait();
        $('sellBtn').disabled = false;
        refreshData();
    } catch (e) {
        console.error(e);
        $('sellBtn').disabled = false;
        alert('Error al vender.');
    }
}

async function seedAction() {
    if (!contract) return alert('Conecta tu wallet.');
    
    try {
        const tx = await contract.seedMarket();
        showTx(tx.hash);
        $('seedBtn').disabled = true;
        await tx.wait();
        $('seedBtn').disabled = false;
        refreshData();
    } catch (e) {
        console.error(e);
        $('seedBtn').disabled = false;
        alert('Error. ¿Ya está inaugurada?');
    }
}

// ==================== EVENTOS ====================
$('connectBtn').addEventListener('click', connectWallet);
$('buyBtn').addEventListener('click', buyAction);
$('hatchBtn').addEventListener('click', hatchAction);
$('sellBtn').addEventListener('click', sellAction);
$('seedBtn').addEventListener('click', seedAction);
$('switchNetworkBtn').addEventListener('click', switchNetwork);
$('buyAmount').addEventListener('input', () => { if (contract && isCorrectNetwork) refreshData(); });
$('copyReferralBtn').addEventListener('click', () => {
    navigator.clipboard.writeText($('referralLink').textContent).then(() => showToast('✅ ¡Enlace copiado!'));
});

// ==================== INICIALIZACIÓN ====================
window.addEventListener('load', async () => {
    // SIEMPRE verificar el estado del contrato (incluso sin wallet)
    await checkInitializedPublic();
    
    if (window.ethereum) {
        await checkNetwork();
        const acc = await window.ethereum.request({ method: 'eth_accounts' });
        if (acc.length > 0) await connectWallet();
    }
});