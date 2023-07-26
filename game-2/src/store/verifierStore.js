const verifierStore ={
    namespaced: true,
    state: {
        vpResult:null,        
        hypersignVp:null
    },
    getters: {
        getAddress(state){
            return state.address
        },        
    },
    mutations: {
        
    },
    actions: {                
        verifyVp:({rootGetters})=>{
            return new Promise((resolve,reject)=>{
                try {
                    const hypersigVP = rootGetters['holderStore/getHypersignVp']
                    hypersigVP.verifyByClientSpec({
                        signedPresentation:'b'
                     }).then(data=>{
                        resolve(data)
                     })
                } catch (error) {
                    reject(error)
                }        
            })
        }
    }
}

export default verifierStore;