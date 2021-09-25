/* src/App.js */
import './App.css'
import { create } from 'ipfs-http-client'
import html2canvas from 'html2canvas'
import Web3 from 'web3'
import Contract from 'web3-eth-contract'
import React, { Component } from 'react'
import { NFTchatABI } from "./NFTChatABI";
import { getMetaData } from "./NFTMetadata";

const client = create('https://ipfs.infura.io:5001/api/v0')
let web3;
let account;
let lastIndexNewLine;
let contractAdress;
let mintFee;

const supportedNetworks = new Map();
supportedNetworks.set(1,     {"name": 'Mainnet', "contract": '', "fee": "" });
supportedNetworks.set(137,   {"name":'Polygon', "contract": '', "fee": '0.099' });
supportedNetworks.set(80001, {"name":'Mumbai', "contract": '0xdDe92Ce538484A19A40f26d42E7C6d6c39e99823', "fee": '0.099' });
supportedNetworks.set(56,    {"name": 'BSC', "contract": '', "fee": '0.00033' });
supportedNetworks.set(97,    {"name": 'BSC Tesnet', "contract": '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47', "fee": '0.00033' });

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      show: false,
      network: '',
      MetamaskInstalled: false
    }
  }

  //lifecycle function componenet
  async componentDidMount() {
    await this.loadWeb3()
    if (this.state.show === false) {
      await this.loadBlockchainData()
      // detect Network account change
      window.ethereum.on('chainChanged', function (networkId) {
        console.log('networkChanged', networkId)
        window.location.reload();
      });
    }
  }

  async loadBlockchainData() {
    await window.web3.currentProvider.enable();
    web3 = new Web3(window.web3.currentProvider);
    const accounts = await web3.eth.getAccounts()
    account = accounts[0]
    this.setState({ account: account })
    this.detectNetwork(web3)
  }

  //detect the Network 
  async detectNetwork(web3) {
    web3.eth.net.getId().then(netId => {
        const currentNetwork = supportedNetworks.get(netId);
        if(!currentNetwork){
          console.error('Unsupported network.')
          window.alert('Unsupported Network')
        }
        this.setState({ network: currentNetwork.name })
        console.log(`Connected to ${currentNetwork.name} Network`)

        contractAdress = currentNetwork.contract;
        console.log("contract address: ", contractAdress);

        mintFee= currentNetwork.fee;
        console.log("Mint fee: ", mintFee);
      }
    )
  }

  async loadWeb3() {
    console.log('loading web3...')
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()

    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      this.setState({ MetamaskInstalled: true })
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      this.setState({ show: true })
    }
  }

  async onTxtChanged(e) {
    const textArea = e.target;
    const htmlText = applyTextConstraints(textArea)

    let msgPreview = document.getElementById('msgPreview');
    msgPreview.innerHTML = htmlText;
  }

  async onSend(e) {
    const toAddress = document.getElementById('toAddress').value;
    if (web3.utils.isAddress(toAddress)) {
      console.log("sending msg...")
      const msgPreview = document.getElementById('msgPreview');
      adaptTextToImage(msgPreview)
      html2canvas(msgPreview)
        .then(canvas => {
          msgPreview.removeAttribute("class", "nftImg");
          msgPreview.style.removeProperty("font-size")
          uploadDataToIPFS(canvas.toDataURL("image/png"))
            .then((fileUrl) => { mintNFT(fileUrl, toAddress) })
        })
    } else {
      alert("Invalid receiver address")
    }
  }

  async App() {
    this.setState({ loading: false })
  }

  render() {
    return (
      <div className="App">
        {<pre className="Title">
          <h1 >
            ███    ██ ███████ ████████     ██             ██<br></br>
            ████   ██ ██         ██        ██           ██████<br></br>
            ██ ██  ██ █████      ██  █████ ██████ █████   ██  <br></br>
            ██  ██ ██ ██         ██ ██     ██  ██ ██  ██  ██  <br></br>
            ██   ████ ██         ██  █████ ██  ██ ███ ███ ████<br></br>
          </h1>
        </pre>}
        <input id="toAddress" className="ToAddress" maxLength="42" spellCheck="false" placeholder="Paste the receiver address here..."></input>
        <textarea className="TextArea" id="the_text" maxLength="666" spellCheck="false" placeholder="Write your message here..." onChange={this.onTxtChanged} />
        <div id="previewContainer">
          <div id="msgPreview">  -- NFT message preview --  </div>
        </div>
        <div className="container">
          <div className="clientInfo">
            <b>Sender Address:</b> {this.state.account}
            <br></br>
            <b>Network:</b> {this.state.network}
          </div>
          <button className="MyButton" onClick={this.onSend}>Send</button>
        </div>
      </div>
    )
  }
}

export default App


function applyTextConstraints(textArea) {
  let theText = textArea.value;
  const numberOfLines = (theText.match(/\n\r?/g) || []).length + 1

  if (numberOfLines >= 10) {
    if (numberOfLines < 11) {
      lastIndexNewLine = theText.lastIndexOf('\n');
    }
    theText = theText.slice(0, lastIndexNewLine)
    textArea.value = theText
  }
  return plainTxtToHtml(theText);
}

function plainTxtToHtml(theText) {
  return theText
    .replace(/\t/g, '    ')
    .replace(/ {2}/g, '&nbsp; ')
    .replace(/ {2}/g, ' &nbsp;')
    .replace(/\n\r?/g, '<br>')
}

function adaptTextToImage(msgPreview) {
  const length = msgPreview.textContent.length
  const maxSize = 10
  const minSize = 2.6
  let fontSize = 100 / length
  if (fontSize > maxSize) {
    fontSize = maxSize
  } else if (fontSize < minSize) {
    fontSize = minSize
  }
  msgPreview.setAttribute("class", "nftImg")
  msgPreview.style.fontSize = `${fontSize}vh`
  console.log("fontSize", fontSize)
}

async function uploadDataToIPFS(imageURL) {
  const imgFile = getImageFile(imageURL)
  const imgUrl = await uploadFileToIPFS(imgFile)
  console.log("IMAGE IPFS", imgUrl)
  const today = new Date().toLocaleDateString("en-US")
  const metadata = getMetaData(imgUrl, account, today)
  const metaJson = JSON.stringify(metadata)
  const metadataFile = new File([metaJson], 'metadata.json', { type: 'text/plain;charset=UTF-8' })
  const fileUrl = await uploadFileToIPFS(metadataFile)
  console.log("IPFS File URL:", fileUrl)
  return fileUrl;
}

function getImageFile(fileContent) {
  const arr = fileContent.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  const imgFile = new File([u8arr], 'filename.png', { type: mime })
  return imgFile;
}

async function uploadFileToIPFS(file) {
  let fileUrl;
  try {
    const added = await client.add(file)
    fileUrl = `https://ipfs.infura.io/ipfs/${added.path}`
  } catch (error) {
    console.log('Error uploading file: ', error)
  }
  return fileUrl
}

async function mintNFT(fileURI, toAddress) {
  const nonce = await web3.eth.getTransactionCount(account, 'latest');
  //the transaction
  const amount = web3.utils.toWei(mintFee, 'ether');
  const value = web3.utils.toHex(amount);
  const NFTContract = new Contract(NFTchatABI, contractAdress)

  const tx = {
    'from': account.toString(),
    'to': contractAdress,
    'nonce': nonce.toString(),
    //TODO define gas for different blockchains
    'gas': '200000',
    //TODO define maxPriorityFeePerGas
    'maxPriorityFeePerGas': '2000000',
    'data': NFTContract.methods.mint(toAddress, fileURI).encodeABI(),
    // da gestire con BigNumber
    'value': value.toString()
  };

  console.log(tx)

  const txHash = await window.ethereum
  .request({
    method: 'eth_sendTransaction',
    params: [tx],
  })
  .then((result) => {
    console.log("Transaction hash:", txHash)
    console.log("Transaction Result:", result)
  })
  .catch((error) => {
    console.error(error)
  });
}
