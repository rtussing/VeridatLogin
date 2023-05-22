const prompt = require('prompt-sync')({sigint: true})
const VM = require('./veridatMethods')

async function getLoginInfoID() {
    /*
     * Obtain the folder list
     */
    let folderList
    const folderListPromise = VM.getFolderList()
    await folderListPromise.then(res => {
        res.success === true ? 
        folderList = res.data :
        () => {
            console.log('getFolderList failed\n')
        }
    })

    /*
     * Find the ID of the folder 'Users'
     */
    const usersID = VM.findID('Users', folderList)

    /*
     * Get the list of DataRecords (users) in the 'Users' folder
     */
    let dataRecordList
    const dataRecordListPromise = VM.getDataRecordListByFolderID({folderID: usersID})
    await dataRecordListPromise.then(res => {
        res.success === true ? 
        dataRecordList = res.data :
        () => {
            console.log('getDataRecordListByFolderID failed\n')
        }
    })

    /*
     * Find the ID of the DataRecord 'Login Info'
     */
    const loginInfoID = VM.findID('Login Info', dataRecordList)

    return loginInfoID
}

async function login(username, password, transactionList) {
    let loggedIn = 0

    /*
     * Search through the transactions in the 'Login Info' DataRecord
     * until a transaction with a matching username is found.
     */
    for (let i = transactionList.length - 1; i >= 0; i--) {
        let transactionMetadataList

        /*
         * Obtain the metadata for the i-th transaction in the DataRecord
         */
        const transactionMetadataObj = await VM.getTransactionMetadata({transactionID: transactionList[i].id})
        transactionMetadataObj.success === true ?
            transactionMetadataList = transactionMetadataObj.data :
            console.log('getTransactionMetadata failed')

        /*
         * If the array of metadata isn't empty, complete checks on the 
         * username and password.
         */
        if (transactionMetadataList.length != 0) {
            let u = transactionMetadataList[0].meta_value // username
            if (u === username) {
                let p = transactionMetadataList[1].meta_value // password
                if (p === password) {
                    console.log('\n-- User logged in successfully!')
                    loggedIn = 1
                } else {
                    console.log('\n-- Incorrect password!')
                    loggedIn = -1
                }
                break
            }
        }
    }

    return loggedIn
}

async function handleLogin(username, password, transactionList, loginInfoID) {
    const loggedIn = await login(username, password, transactionList)

    /*
     * Determine if login() succeeded in logging the user in. If the username
     * was unique, attempt to create a new user.
     */
    let createUser
    if (loggedIn === 0) {
        console.log('\n-- Failed to log in user.\n')
        createUser = prompt('-- Create user with provided credentials? (y) ')

        if (createUser === 'y') {
            const addedTransaction = await VM.addTransaction({
                folder_id: "",
                folder_path: "",
                trial_id: loginInfoID,
                ref_tx_id: "",
                meta_username: username, 
                meta_password: password
            })
            
            addedTransaction.status === 200 ?
                console.log('\n-- Added user successfully!\n-- User logged in successfully!') :
                console.log('Failed to add user.')
        }
    }
}

async function userLoginSequence(loginInfoID) {
    /*
     * Prompt the user to log in
     */
    const username = prompt('Username: ')
    const password = prompt('Password: ')

    /*
     * Checks on input
     */
    if (username.length === 0) {
        console.log('Invalid Username')
        return
    } else if (password.length === 0) {
        console.log('Invalid Password')
        return
    }
    
    /*
     * Fetch an array of Transactions for DataRecord 'Login Info'
     */
    const transactionListPromise = VM.getTransactionList({trialID: loginInfoID})
    
    /*
     * Determine if the promise returned from the fetch() was a success (as denoted within
     * the promise object according to the Veridat API). If so, assign its data for ease
     * of use.
     */
    let transactionList
    await transactionListPromise.then(res => {
        res.success === true ? 
        transactionList = res.data :
        () => {
            console.log('getTransactionList failed\n')
        }
    })

    /*
     * Log the user in or handle their information
     */
    handleLogin(username, password, transactionList, loginInfoID)
}

async function main() {
    /*
     * Startup message and initial prompt
     */
    console.log('\n-- Welcome to Veridat Experimentation --\n')
    console.log('-- Please enter your login information.\n')

    let doLogin = prompt('-- Would you like to log in? (y) ')
    
    /*
     * Allow the user to log in if they chose to do so
     */
    if (doLogin === 'y') {
        /*
         * Obtain the list of users. Note that getLoginInfoID is async,
         * so the promise is resolved into the ID after running.
         */
        let loginInfoID
        const loginInfoIDPromise = getLoginInfoID()
        await loginInfoIDPromise.then(res => {
            res ? loginInfoID = res : 
            () => {
                console.log('getLoginInfoID failed\n')
            }
        })

        /*
        * Get the login information and determine its validity
        */
        await userLoginSequence(loginInfoID)
    }
}

main()