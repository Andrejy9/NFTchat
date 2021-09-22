export function getMetaData(imgUrl, senderAdress, birthday) {
    return {
        "name": "nftchat.xyz",
        "description": `${birthday} \n
You received this message from ${senderAdress} \n
To reply visit nftchat.xyz`,
        "image": `${imgUrl}`,
        "attributes": [{
            "display_type": "date",
            "trait_type": "Message Date",
            "value": `${birthday}`
        }]
    }
}