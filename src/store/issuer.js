const issuerStore ={
    namespaced: true,
    state: {
        address:''
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

export default issuerStore;