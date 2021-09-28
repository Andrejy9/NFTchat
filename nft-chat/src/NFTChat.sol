// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;
 
import "https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol";
import "https://github.com/0xcert/ethereum-erc721/src/contracts/ownership/ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
 
contract NFTChat is NFTokenMetadata, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
 
  constructor() {
    nftName = "NFTchat";
    nftSymbol = "CHAT";
  }
  
  // Current price.
    uint256 public CURRENT_PRICE = 0.005 ether;
    
     function setCurrentPrice(uint256 currentPrice) public onlyOwner {
        CURRENT_PRICE = currentPrice;
    }
 
  function mint(address _to, string calldata _uri) public payable {
       require(msg.value >= CURRENT_PRICE, "Not enough MATIC");
       
      _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

    super._mint(_to, newTokenId);
    super._setTokenUri(newTokenId, _uri);
  }
  
  function withdraw() public payable onlyOwner {
    require(payable(msg.sender).send(address(this).balance));
  }
}
