export default {
    methods: {
     toast(msg,variant){ 
          this.$swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 6000,
          timerProgressBar: false,
        }).fire({
          icon: variant,
          title: msg
        })
    },
    fetched(msg,variant){ 
      this.$swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: false,
    }).fire({
      icon: variant,
      title: msg
    })
  },
  loadingData(){
    this.$swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      // timer: 3000,
      timerProgressBar: false,
    }).fire({
      title: "Loading.."
    })
  }
  }
  };