<template>
  <b-modal :size="Size" hide-footer :id="Id" :hide-header="keepHeader" :title="Header" :no-close-on-backdrop="true" centered>
    <div v-if="keepHeader" class="d-flex justify-content-end">
    <button type="button" class="close" @click="close(Id)" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
    <slot />
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      show: false,
    };
  },
  props: {
    Header: {
      type: String,
      require: false,
    },
    keepHeader:{
      type:Boolean,
      require:false,
    },
    Id: {
      type: String,
    },
    Size: {
      type: String,
    }
  },
  created() {
    this.openModal();
    this.closeModal();
  },
  methods: {
    openModal() {
      this.$root.$on("modal-show", () => {
        this.show = true;
      });
    },
    closeModal() {
      this.$root.$on("modal-close", () => {
        this.show = false;
      });
    },
    close(id){
      this.$root.$emit('bv::hide::modal', id)
    }
  },
};
</script>

<style></style>
