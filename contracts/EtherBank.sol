pragma solidity ^0.7.0;

contract EtherBank{
    mapping (address => uint) userBalances;
    function getBalance(address user) view public returns(uint) {  
		return userBalances[user];
	}

	function addToBalance() public payable {  
		userBalances[msg.sender] += msg.value;
	}

	function withdrawBalance() public {  
		uint amountToWithdraw = userBalances[msg.sender];
        // <yes> <report> REENTRANCY
		(bool sent, ) = msg.sender.call{value: amountToWithdraw}("");
		require(sent);
		userBalances[msg.sender] = 0;
	}    
}