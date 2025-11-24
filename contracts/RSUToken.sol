// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title RSUToken - Restaurant Reward & Payment Token
contract RSUToken is ERC20, AccessControl {
    /// @notice Rate: rate of exchangeZ
    uint256 public rate;

    /// Track admins manually
    address[] private adminList;
    mapping(address => bool) private isAdminListed;

    constructor(uint256 _rate) ERC20("RSUToken", "RSU") {
        require(_rate > 0, "Rate must be > 0");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _addAdminToList(msg.sender);

        rate = _rate;
    }

    /* =========================================================
                        INTERNAL HELPERS
    ==========================================================*/
    function _addAdminToList(address admin) internal {
        if (!isAdminListed[admin]) {
            adminList.push(admin);
            isAdminListed[admin] = true;
        }
    }

    /* =========================================================
                        ADMIN MANAGEMENT
    ==========================================================*/

    /// @notice Add new admin
    function addAdmin(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        _grantRole(DEFAULT_ADMIN_ROLE, account);
        _addAdminToList(account);
    }

    /// @notice Remove admin (cannot remove yourself)
    function removeAdmin(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != msg.sender, "Admin cannot remove self");
        _revokeRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @notice View list of all admins
    function getAllAdmins() external view returns (address[] memory) {
        return adminList;
    }

    /// @notice Check if address is admin
    function hasAdminRole(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /* =========================================================
                        CORE TOKEN FUNCTIONS
    ==========================================================*/

    /// @notice Reward tokens to a customer after paying bill
    function reward(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(to, amount);
    }

    /// @notice Customer burns their own RSU tokens (redeem)
    function redeem(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /* =========================================================
                        BUY TOKENS
    ==========================================================*/

    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH");
        uint256 tokenAmount = msg.value * rate;
        _mint(msg.sender, tokenAmount);
    }

    receive() external payable {
        buyTokens();
    }

    /* =========================================================
                        ADMIN WITHDRAW ETH
    ==========================================================*/

    function withdraw(address payable to, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(to != address(0), "Invalid");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Withdraw failed");
    }
}
