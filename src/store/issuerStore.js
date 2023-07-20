import config from "../config"
// import fetch from "node-fetch"
const issuerStore ={
    namespaced: true,
    state: {
        entityAccessToken:null,
        issuedCred:null
    },
    getters: {        
        getEntityHeader: (state) => {
            return {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + state.entityAccessToken
            }
        },
        getIssuedCred: (state)=>{
            if(state.issuedCred!==null){
                return state.issuedCred
            }         
        }
    },
    mutations: {
        setEntityAccessToken(state,payload){
            state.entityAccessToken = payload
        },
        setIssuedCred(state,payload){
            state.issuedCred = payload
        },        

    },
    actions: {
        authenticateEntity: ({commit}) => {
            console.log('s')
            return new Promise((resolve, reject) => {
                try {
                    const url = config.baseUrl + '/api/v1/app/oauth'
                fetch(url,{
                    method:'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Secret-Key':config.apiSecret
                    }
                }).then(resp => {
                    return resp.json()
                }).then(json => {
                    if(json.statusCode == 400) {
                        throw new Error('Bad Request'+json.message.toString())
                    }
                    if (json.statusCode == 401) {
                        throw new Error('Invalid API Secret Key')
                    }
                    const {access_token} = json;
                    console.log(access_token)
                    commit('setEntityAccessToken',access_token)
                    resolve(json)
                })
                } catch (error) {
                    reject(error)
                }                
            })
        },      
        issueCredential: ({getters,rootGetters,commit},payload)=>{
            console.log(payload)
            return new Promise((resolve,reject) => {
                try {                    
                    const url = config.baseUrl + '/api/v1/credential/issue'
                const body = {
                    schemaId: 'sch:hid:testnet:zHHCZDBm1GZYkqHLcsx8atQz8yjaExw2zmp12oeez26y7:1.0', 
                    subjectDid: rootGetters['holderStore/getDidDocId'],
                    issuerDid: 'did:hid:testnet:zHfG5jtCiZLarsiPENH4LZ1u9uUfCWpiXicWshJFZQXTn',
                    expirationDate: "2027-12-10T18:30:00.000Z",
                    fields:{
                        ...payload
                    },
                    namespace:'testnet',
                    verificationMethodId:'did:hid:testnet:zHfG5jtCiZLarsiPENH4LZ1u9uUfCWpiXicWshJFZQXTn#key-1',
                    persist:true
                }
                fetch(url, {
                    method:'POST',
                    headers:getters.getEntityHeader,
                    body:JSON.stringify(body)
                }).then(resp => {
                    return resp.json()
                }).then(json => {
                    if(json.statusCode == 400){
                        throw new Error('Bad Request'+json.message.toString())
                    }
                    console.log(json)
                    commit('setIssuedCred',json.credentialDocument)
                    resolve(json)                    
                })
                } catch (error) {
                    reject(error)
                }
            })
        }                        
    }
}

export default issuerStore;