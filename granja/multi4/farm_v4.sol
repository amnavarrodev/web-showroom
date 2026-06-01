// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract GranjaUnificada {
    // ==================== ESTRUCTURAS ====================
    struct AnimalConfig {
        string name;
        string productName;
        uint256 eggsToHatch;
        uint256 initialMarket;
        uint256 productionPerHour;
        bool active;
    }

    struct UserState {
        uint256 hatcheryMiners;
        uint256 claimedEggs;
        uint256 lastHatch;
        address referrer;
    }

    // ==================== PARÁMETROS DE MERCADO ====================
    uint256 PSN;
    uint256 PSNH;
    uint256 public dailyReturnPercent;

    // ==================== ROLES ADMINISTRATIVOS ====================
    address public owner;        // Super-admin (desplegador)
    address public ceoAddress;   // Recibe 50% de comisiones
    address public teamAddress;  // Recibe 50% de comisiones

    // ==================== ESTADO DE LA GRANJA ====================
    bool public initialized = false;

    mapping(uint8 => AnimalConfig) public animals;
    uint8 public animalCount;

    mapping(uint8 => uint256) public marketEggs;
    mapping(uint8 => mapping(address => UserState)) public users;
    mapping(uint8 => mapping(address => address)) public referrals;

    // ==================== EVENTOS ====================
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event CEOAddressChanged(address indexed oldAddr, address indexed newAddr);
    event TeamAddressChanged(address indexed oldAddr, address indexed newAddr);
    event DailyReturnUpdated(uint256 oldPercent, uint256 newPercent);
    event AnimalAdded(uint8 indexed animalId, string name, string productName, uint256 productionPerHour);
    event EggsBought(uint8 indexed animalId, address indexed buyer, uint256 bnbSpent, uint256 eggsReceived);
    event EggsSold(uint8 indexed animalId, address indexed seller, uint256 eggsSold, uint256 bnbReceived);
    event EggsHatched(uint8 indexed animalId, address indexed player, uint256 eggsUsed, uint256 newMiners);
    event ReferralSet(uint8 indexed animalId, address indexed user, address indexed referrer);

    // ==================== CONSTRUCTOR ====================
    constructor(
        address _ceoAddress,
        address _teamAddress,
        uint256 _dailyReturnPercent
    ) {
        require(_ceoAddress != address(0), "CEO no puede ser cero");
        require(_teamAddress != address(0), "Team no puede ser cero");
        require(_dailyReturnPercent > 0 && _dailyReturnPercent <= 20, "% debe ser 1-20");

        owner = msg.sender;
        ceoAddress = _ceoAddress;
        teamAddress = _teamAddress;
        dailyReturnPercent = _dailyReturnPercent;

        _calculateCurveParams(_dailyReturnPercent);

        uint256 baseEggsToHatch = 3600;
        uint256 baseInitialMarket = (10000 / _dailyReturnPercent) * 1000;

        _addAnimal("Gallina", "Huevos", baseEggsToHatch, baseInitialMarket, 1);
        _addAnimal("Vaca", "Leche", baseEggsToHatch / 6, baseInitialMarket, 6);
        _addAnimal("Oveja", "Lana", baseEggsToHatch * 2, baseInitialMarket, 1);
        _addAnimal("Abeja", "Miel", baseEggsToHatch / 3, baseInitialMarket, 3);
        _addAnimal("Cerdo", "Trufas", baseEggsToHatch * 5, baseInitialMarket, 1);
    }

    function _calculateCurveParams(uint256 _percent) internal {
        PSN = 3000 / _percent;
        PSNH = PSN / 2;
        if (PSN < 100) PSN = 100;
        if (PSNH < 50) PSNH = 50;
    }

    function _addAnimal(
        string memory _name,
        string memory _productName,
        uint256 _eggsToHatch,
        uint256 _initialMarket,
        uint256 _productionPerHour
    ) internal {
        uint8 id = animalCount;
        animals[id] = AnimalConfig({
            name: _name,
            productName: _productName,
            eggsToHatch: _eggsToHatch,
            initialMarket: _initialMarket,
            productionPerHour: _productionPerHour,
            active: true
        });
        animalCount++;
        emit AnimalAdded(id, _name, _productName, _productionPerHour);
    }

    // ==================== MODIFICADORES ====================
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el Owner");
        _;
    }

    modifier onlyCEO() {
        require(msg.sender == ceoAddress, "Solo el CEO");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner || msg.sender == ceoAddress, "Solo Owner o CEO");
        _;
    }

    modifier onlyInitialized() {
        require(initialized, "Granja no inaugurada");
        _;
    }

    modifier validAnimal(uint8 _animalId) {
        require(_animalId < animalCount && animals[_animalId].active, "Animal invalido");
        _;
    }

    // ==================== FUNCIONES DE OWNER ====================
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Direccion cero");
        require(_newOwner != owner, "Ya es el Owner");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    function setDailyReturnPercent(uint256 _newPercent) public onlyAdmin {
        require(_newPercent > 0 && _newPercent <= 20, "% debe ser 1-20");
        require(_newPercent != dailyReturnPercent, "Mismo porcentaje");
        uint256 oldPercent = dailyReturnPercent;
        dailyReturnPercent = _newPercent;
        _calculateCurveParams(_newPercent);
        emit DailyReturnUpdated(oldPercent, _newPercent);
    }

    // ==================== FUNCIONES ADMINISTRATIVAS (Owner y CEO) ====================
    function setCEOAddress(address _newCEO) public onlyAdmin {
        require(_newCEO != address(0), "Direccion cero");
        emit CEOAddressChanged(ceoAddress, _newCEO);
        ceoAddress = _newCEO;
    }

    function setTeamAddress(address _newTeam) public onlyAdmin {
        require(_newTeam != address(0), "Direccion cero");
        emit TeamAddressChanged(teamAddress, _newTeam);
        teamAddress = _newTeam;
    }

    // ==================== FUNCIONES PRINCIPALES ====================

    function buyEggs(uint8 _animalId, address _ref)
        public
        payable
        onlyInitialized
        validAnimal(_animalId)
    {
        require(msg.value > 0, "Envia tBNB");

        uint256 eggsBought = calculateEggBuy(
            _animalId,
            msg.value,
            SafeMath.sub(address(this).balance, msg.value)
        );
        eggsBought = SafeMath.sub(eggsBought, devFee(eggsBought));

        uint256 fee = devFee(msg.value);
        uint256 feeHalf = fee / 2;

        (bool sentCEO, ) = payable(ceoAddress).call{value: feeHalf}("");
        require(sentCEO, "Pago CEO fallido");
        (bool sentTeam, ) = payable(teamAddress).call{value: fee - feeHalf}("");
        require(sentTeam, "Pago Team fallido");

        UserState storage user = users[_animalId][msg.sender];
        user.claimedEggs = SafeMath.add(user.claimedEggs, eggsBought);

        emit EggsBought(_animalId, msg.sender, msg.value, eggsBought);

        _hatchEggs(_animalId, _ref);
    }

    function hatchEggs(uint8 _animalId, address _ref)
        public
        onlyInitialized
        validAnimal(_animalId)
    {
        _hatchEggs(_animalId, _ref);
    }

    function _hatchEggs(uint8 _animalId, address _ref) internal {
        AnimalConfig storage animal = animals[_animalId];
        UserState storage user = users[_animalId][msg.sender];

        if (_ref == msg.sender) {
            _ref = address(0);
        }
        if (user.referrer == address(0) && user.referrer != msg.sender) {
            user.referrer = _ref;
            referrals[_animalId][msg.sender] = _ref;
            emit ReferralSet(_animalId, msg.sender, _ref);
        }

        uint256 eggsUsed = getMyEggs(_animalId);
        require(eggsUsed > 0, "No tienes producto acumulado");

        uint256 newMiners = SafeMath.div(eggsUsed, animal.eggsToHatch);
        require(newMiners > 0, "Producto insuficiente para criar");

        user.hatcheryMiners = SafeMath.add(user.hatcheryMiners, newMiners);
        user.claimedEggs = 0;
        user.lastHatch = block.timestamp;

        if (user.referrer != address(0)) {
            UserState storage referrerState = users[_animalId][user.referrer];
            referrerState.claimedEggs = SafeMath.add(
                referrerState.claimedEggs,
                SafeMath.div(eggsUsed, 10)
            );
        }

        marketEggs[_animalId] = SafeMath.add(
            marketEggs[_animalId],
            SafeMath.div(eggsUsed, 5)
        );

        emit EggsHatched(_animalId, msg.sender, eggsUsed, newMiners);
    }

    function sellEggs(uint8 _animalId)
        public
        onlyInitialized
        validAnimal(_animalId)
    {
        UserState storage user = users[_animalId][msg.sender];
        uint256 hasEggs = getMyEggs(_animalId);
        require(hasEggs > 0, "No tienes producto");

        uint256 eggValue = calculateEggSell(_animalId, hasEggs);
        uint256 fee = devFee(eggValue);
        uint256 feeHalf = fee / 2;

        user.claimedEggs = 0;
        user.lastHatch = block.timestamp;
        marketEggs[_animalId] = SafeMath.add(marketEggs[_animalId], hasEggs);

        (bool sentCEO, ) = payable(ceoAddress).call{value: feeHalf}("");
        require(sentCEO, "Pago CEO fallido");
        (bool sentTeam, ) = payable(teamAddress).call{value: fee - feeHalf}("");
        require(sentTeam, "Pago Team fallido");

        uint256 payment = SafeMath.sub(eggValue, fee);
        (bool sentUser, ) = payable(msg.sender).call{value: payment}("");
        require(sentUser, "Pago usuario fallido");

        emit EggsSold(_animalId, msg.sender, hasEggs, payment);
    }

    // ==================== ALGORITMO DE INTERCAMBIO ====================
    function calculateTrade(
        uint256 rt,
        uint256 rs,
        uint256 bs
    ) internal view returns (uint256) {
        if (rt == 0) return 0;
        return SafeMath.div(
            SafeMath.mul(PSN, bs),
            SafeMath.add(
                PSNH,
                SafeMath.div(
                    SafeMath.add(SafeMath.mul(PSN, rs), SafeMath.mul(PSNH, rt)),
                    rt
                )
            )
        );
    }

    function calculateEggSell(uint8 _animalId, uint256 eggs)
        public
        view
        validAnimal(_animalId)
        returns (uint256)
    {
        return calculateTrade(eggs, marketEggs[_animalId], address(this).balance);
    }

    function calculateEggBuy(uint8 _animalId, uint256 eth, uint256 contractBalance)
        public
        view
        validAnimal(_animalId)
        returns (uint256)
    {
        return calculateTrade(eth, contractBalance, marketEggs[_animalId]);
    }

    function calculateEggBuySimple(uint8 _animalId, uint256 eth)
        public
        view
        validAnimal(_animalId)
        returns (uint256)
    {
        return calculateEggBuy(_animalId, eth, address(this).balance);
    }

    // ==================== FUNCIONES DE LECTURA ====================
    function devFee(uint256 amount) public pure returns (uint256) {
        return SafeMath.div(SafeMath.mul(amount, 5), 100);
    }

    function seedMarket() public payable {
        require(!initialized, "Ya inaugurada");
        initialized = true;
        for (uint8 i = 0; i < animalCount; i++) {
            marketEggs[i] = animals[i].initialMarket;
        }
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getMyMiners(uint8 _animalId)
        public
        view
        validAnimal(_animalId)
        returns (uint256)
    {
        return users[_animalId][msg.sender].hatcheryMiners;
    }

    function getMyEggs(uint8 _animalId)
        public
        view
        validAnimal(_animalId)
        returns (uint256)
    {
        UserState storage user = users[_animalId][msg.sender];
        return SafeMath.add(
            user.claimedEggs,
            getEggsSinceLastHatch(_animalId, msg.sender)
        );
    }

    function getEggsSinceLastHatch(uint8 _animalId, address _adr)
        public
        view
        validAnimal(_animalId)
        returns (uint256)
    {
        UserState storage user = users[_animalId][_adr];
        if (user.lastHatch == 0) return 0;

        uint256 secondsPassed = min(
            86400,
            SafeMath.sub(block.timestamp, user.lastHatch)
        );
        return SafeMath.mul(secondsPassed, user.hatcheryMiners);
    }

    function getUserState(uint8 _animalId, address _user)
        public
        view
        validAnimal(_animalId)
        returns (
            uint256 miners,
            uint256 eggs,
            uint256 lastAction,
            address referrer
        )
    {
        UserState storage user = users[_animalId][_user];
        return (
            user.hatcheryMiners,
            SafeMath.add(user.claimedEggs, getEggsSinceLastHatch(_animalId, _user)),
            user.lastHatch,
            user.referrer
        );
    }

    function getProductionInfo(uint8 _animalId)
        public
        view
        validAnimal(_animalId)
        returns (
            string memory name,
            string memory productName,
            uint256 perHour,
            uint256 perDay,
            uint256 eggsToHatch
        )
    {
        AnimalConfig storage animal = animals[_animalId];
        return (
            animal.name,
            animal.productName,
            animal.productionPerHour,
            animal.productionPerHour * 24,
            animal.eggsToHatch
        );
    }

    function getContractConfig()
        public
        view
        returns (
            address _owner,
            address _ceo,
            address _team,
            uint256 _dailyReturnPercent,
            uint256 _psn,
            uint256 _psnh,
            bool _initialized
        )
    {
        return (owner, ceoAddress, teamAddress, dailyReturnPercent, PSN, PSNH, initialized);
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}

// ==================== LIBRERÍA SAFEMATH ====================
library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}