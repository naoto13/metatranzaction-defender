// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

// ERC2771Contextを継承(受け手のやつ)
contract Registry is ERC2771Context {  
  event Registered(address indexed who, string name);

  mapping(address => string) public names;
  mapping(string => address) public owners;

  // デプロイ時に受け付けるforwarderを渡して確定させる
  // どんなfowarderでも受け付ける訳ではない。
  constructor(MinimalForwarder forwarder) // Initialize trusted forwarder
    ERC2771Context(address(forwarder)) {
  }

  function register(string memory name) external {
    require(owners[name] == address(0), "Name taken");
    // _msgSender()はmsg.senderではなく、clientのaddressを返す
    // ここをデプロイ時に自由に書き換えられるとなんでもできるような....
    address owner = _msgSender(); // Changed from msg.sender
    owners[name] = owner;
    names[owner] = name;
    emit Registered(owner, name); //Clientにregisterしたことを伝える
  }
}
