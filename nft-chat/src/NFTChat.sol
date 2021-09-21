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
 
  function mint(address _to, string calldata _uri) public {
      _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

    super._mint(_to, newTokenId);
    super._setTokenUri(newTokenId, _uri);
  }
 
}
