export function getMetaData(imgUrl, senderAdress) {
    return {
        "name": "nftchat.xyz",
        "description": `You received this message from: ${senderAdress}`,
        "image": `${imgUrl}`,
        "attributes": [{
                "trait_type": "Base",
                "value": "Starfish"
            },
            {
                "trait_type": "Eyes",
                "value": "Big"
            },
            {
                "trait_type": "Level",
                "value": 5
            },
            {
                "trait_type": "Stamina",
                "value": 1.4
            },
            {
                "trait_type": "Personality",
                "value": "Sad"
            },
            {
                "display_type": "boost_number",
                "trait_type": "Aqua Power",
                "value": 40
            },
            {
                "display_type": "boost_percentage",
                "trait_type": "Stamina Increase",
                "value": 10
            },
            {
                "display_type": "number",
                "trait_type": "Generation",
                "value": 2
            },
            {
                "display_type": "date",
                "trait_type": "birthday",
                "value": 8566360800 //Thing about this
            },
            {
                "value": "Simple property"
            }
        ]
    }
}