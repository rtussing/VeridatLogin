const priv = require('../private')

/*
* Fetch user authorization data from Veridat
*/
async function fetchAuth() {
    let accessToken

    await fetch('https://bench.veridat.io/api/v1/users/auth', {
        method: "POST",
        body: JSON.stringify({
            "api_key": priv.veridatAPIKey,
            "email": priv.email,
            "password": priv.base64Pass
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            accessToken = res.headers.get('x-access-token')
            return res.json()
        })
        .then(json => {
            auth = json
        })

    return accessToken
}
module.exports.fetchAuth = fetchAuth

async function getFolderList() {
    const accessToken = await fetchAuth()
    let folderList
    await fetch('https://bench.veridat.io/api/v1/folders/list?is_sandbox=0', {
        method: 'GET',
        headers: {
            'x-access-token': accessToken,
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(json => {
            folderList = json
        })

    return folderList
}
module.exports.getFolderList = getFolderList

async function getDataRecordListByFolderID(obj) {
    const accessToken = await fetchAuth()
    let dataRecordList
    await fetch('https://bench.veridat.io/api/v1/trials?folder_id='+obj.folderID, {
        method: 'GET',
        headers: {
            'x-access-token': accessToken,
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(json => {
            dataRecordList = json
        })

    return dataRecordList
}
module.exports.getDataRecordListByFolderID = getDataRecordListByFolderID

/*
 * Given an array of folders/dataRecords, find the ID of the
 * folder/dataRecord with the given name
 */
function findID(name, list) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].name === name){
            return list[i].id
        }
    }

    return -1
}
module.exports.findID = findID

async function getTransactionList(obj) {
    const accessToken = await fetchAuth()
    let transactionList
    await fetch('https://bench.veridat.io/api/v1/transactions?trial_id='+obj.trialID, {
        method: 'GET',
        headers: {
            'x-access-token': accessToken,
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(json => {
            transactionList = json
        })

    return transactionList
}
module.exports.getTransactionList = getTransactionList

async function getTransactionMetadata(obj) {
    const accessToken = await fetchAuth()
    let transactionMetadata
    await fetch('https://bench.veridat.io/api/v1/transactions/' + obj.transactionID + '/meta?object_type=array', {
        method: 'GET',
        headers: {
            'x-access-token': accessToken,
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(json => {
            transactionMetadata = json
        })

    return transactionMetadata
}
module.exports.getTransactionMetadata = getTransactionMetadata

async function addTransaction(obj) {
    const accessToken = await fetchAuth()

    fetch('https://bench.veridat.io/api/v1/transactions/add', {
        method: 'POST',
        body: JSON.stringify({
            "folder_id" : obj.folder_id,
            "folder_path": obj.folder_path,
            "trial_id": obj.trial_id,
            "ref_tx_id": obj.ref_tx_id,
            "meta_username": obj.meta_username,
            "meta_password": obj.meta_password
        }),
        headers: {
            'x-access-token': accessToken,
            'Content-Type': 'application/json'
        }
    })
}
module.exports.addTransaction = addTransaction