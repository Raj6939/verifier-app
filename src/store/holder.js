// import { HypersignEdvClientEcdsaSecp256k1 } from "@hypersign-protocol/hypersign-vault-client";
const holderStore ={
    namespaced: true,
    state: {
        address:'',
        didDoc:null,
        edvClient:null,
        edvConfig:null,
    },
    getters: {
        getAddress(state){
            return state.address
        }
    },
    mutations: {
        updateStore(state,payload){
            state.address = payload
        }
    },
    actions: {
        updateMutation({commit},payload){
            commit('updateStore',payload)
        }
    }
}

export default holderStore;