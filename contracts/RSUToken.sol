// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Restaurant Reward & Payment Token
/// @notice ERC20 used as loyalty points + payment inside the restaurant ecosystem
contract RSUToken is ERC20, AccessControl {
    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");

    /// @notice Native coin to token rate (for buyTokens)
    uint256 public immutable rate;

    constructor(uint256 _rate) ERC20("RSU Token", "RTK") {
        require(_rate > 0, "Rate must be > 0");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        rate = _rate;
    }

     /// ========= Admin functions =========

    /// @notice Set or change a merchant address later
    /// @dev Only admin (DEFAULT_ADMIN_ROLE) can call this
    function setMerchant(address merchant) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(merchant != address(0), "Invalid merchant address");
        _grantRole(MERCHANT_ROLE, merchant);
    }

    /// Remove a merchant
    function removeMerchant(address merchant) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MERCHANT_ROLE, merchant);
    }

    /// ========= Core business functions =========

    /// @notice Reward tokens to a customer after they pay the bill
    /// @dev amount is already calculated off-chain (e.g. bill * factor)
    function reward(address to, uint256 amount)
        external
        onlyRole(MERCHANT_ROLE)
    {
        _mint(to, amount);
    }

    /// @notice Merchant can mint tokens manually (extra promo, compensation, etc.)
    function mintManual(address to, uint256 amount)
        external
        onlyRole(MERCHANT_ROLE)
    {
        _mint(to, amount);
    }

    /// @notice Redeem tokens from a customer when they use tokens to pay / get promotion
    function redeemFrom(address from, uint256 amount)
        external
        onlyRole(MERCHANT_ROLE)
    {
        _burn(from, amount);
    }

    /// @notice Customer can redeem (burn) their own tokens directly
    /// e.g. front-end button "Redeem 100 tokens for discount"
    function redeem(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// ========= On-chain "buy token" =========

    /// @notice Buy tokens with native coin (e.g. ETH / MATIC)
    function buyTokens() public payable {
        require(msg.value > 0, "Send some native coin");
        uint256 tokenAmount = msg.value * rate;
        _mint(msg.sender, tokenAmount);
    }

    /// @notice Receive native coin and automatically convert using buyTokens()
    receive() external payable {
        buyTokens();
    }

    /// @notice Withdraw collected native coin to admin wallet
    function withdraw(address payable to, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(to != address(0), "Invalid address");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "Withdraw failed");
    }
}
